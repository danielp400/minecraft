import Chunk from './Chunk.js';
import * as THREE from 'three';

export default class World {
    constructor(blockManager, chunkSize = 16, chunkHeight = 128, loadRadius = 2, unloadRadius = 4) {
        this.blockManager = blockManager;
        this.chunkSize = chunkSize;
        this.chunkHeight = chunkHeight;
        this.loadRadius = loadRadius;
        this.unloadRadius = unloadRadius;
        this.chunks = new Map();
        this.scene = null;
        this.chunkBuildQueue = [];
        this.pendingBuildChunks = new Set();
        this.chunkNeedsRebuild = new Set();
        this.isBuilding = false;
        this.lastPlayerChunk = { x: null, z: null };
    }

    getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    setScene(scene) {
        this.scene = scene;
    }

    addChunk(chunk) {
        this.chunks.set(this.getChunkKey(chunk.chunkX, chunk.chunkZ), chunk);
    }

    removeChunk(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);
        const chunk = this.chunks.get(key);
        if (!chunk) return;
        if (chunk.mesh && this.scene) {
            this.scene.remove(chunk.mesh);
        }
        chunk.disposeMesh?.();
        this.chunks.delete(key);
        this.rebuildNeighborChunks(chunkX, chunkZ);
    }

    getChunk(chunkX, chunkZ) {
        return this.chunks.get(this.getChunkKey(chunkX, chunkZ));
    }

    loadChunk(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);
        if (this.chunks.has(key)) return;

        const chunk = new Chunk(chunkX, chunkZ, this.blockManager, this.chunkSize, this.chunkHeight);
        this.fillChunkTerrain(chunk);
        this.addChunk(chunk);
        this.queueChunkBuild(chunk);
        this.rebuildNeighborChunks(chunkX, chunkZ);
    }

    queueChunkBuild(chunk) {
        const key = this.getChunkKey(chunk.chunkX, chunk.chunkZ);
        if (this.pendingBuildChunks.has(key)) {
            this.chunkNeedsRebuild.add(key);
            return;
        }

        this.pendingBuildChunks.add(key);
        this.chunkBuildQueue.push(chunk);
        if (!this.isBuilding) {
            this.processBuildQueue();
        }
    }

    processBuildQueue() {
        if (this.chunkBuildQueue.length === 0) {
            this.isBuilding = false;
            return;
        }

        this.isBuilding = true;
        const chunk = this.chunkBuildQueue.shift();
        this.requestIdleCallback(() => {
            if (chunk) {
                const key = this.getChunkKey(chunk.chunkX, chunk.chunkZ);
                this.pendingBuildChunks.delete(key);
                chunk.buildMesh(this);

                if (this.chunkNeedsRebuild.has(key)) {
                    this.chunkNeedsRebuild.delete(key);
                    this.queueChunkBuild(chunk);
                }
            }
            this.processBuildQueue();
        });
    }

    rebuildNeighborChunks(chunkX, chunkZ) {
        const neighborOffsets = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ];

        neighborOffsets.forEach(([dx, dz]) => {
            const neighbor = this.getChunk(chunkX + dx, chunkZ + dz);
            if (neighbor) {
                this.queueChunkBuild(neighbor);
            }
        });
    }

    requestIdleCallback(callback) {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 50 });
        } else {
            setTimeout(callback, 0);
        }
    }

    generateTerrain(radius = 2, scene) {
        if (scene) {
            this.setScene(scene);
        }

        const centerX = 0;
        const centerZ = 0;

        for (let dx = -radius; dx <= radius; dx += 1) {
            for (let dz = -radius; dz <= radius; dz += 1) {
                this.loadChunk(centerX + dx, centerZ + dz);
            }
        }
    }

    update(playerPosition) {
        this.updateChunks(playerPosition);
    }

    updateChunks(playerPosition) {
        const chunkX = Math.floor(playerPosition.x / this.chunkSize);
        const chunkZ = Math.floor(playerPosition.z / this.chunkSize);

        if (this.lastPlayerChunk.x === chunkX && this.lastPlayerChunk.z === chunkZ) {
            return;
        }

        this.lastPlayerChunk.x = chunkX;
        this.lastPlayerChunk.z = chunkZ;

        for (let dx = -this.loadRadius; dx <= this.loadRadius; dx += 1) {
            for (let dz = -this.loadRadius; dz <= this.loadRadius; dz += 1) {
                this.loadChunk(chunkX + dx, chunkZ + dz);
            }
        }

        const keysToUnload = [];
        this.chunks.forEach((chunk) => {
            const distanceX = Math.abs(chunk.chunkX - chunkX);
            const distanceZ = Math.abs(chunk.chunkZ - chunkZ);
            if (distanceX > this.unloadRadius || distanceZ > this.unloadRadius) {
                keysToUnload.push(this.getChunkKey(chunk.chunkX, chunk.chunkZ));
            }
        });

        for (const key of keysToUnload) {
            const [x, z] = key.split(',').map(Number);
            this.removeChunk(x, z);
        }
    }

    getBlockAt(x, y, z) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const localX = x - chunkX * this.chunkSize;
        const localZ = z - chunkZ * this.chunkSize;

        const chunk = this.getChunk(chunkX, chunkZ);
        if (!chunk || y < 0 || y >= this.chunkHeight) {
            return this.blockManager.getBlockByName('air');
        }

        return chunk.getBlock(localX, y, localZ);
    }

    isSolidAt(x, y, z) {
        return this.getBlockAt(x, y, z).solid;
    }

    getCollidingBlocks(box) {
        const EPSILON = 1e-4;
        const min = new THREE.Vector3(
            Math.floor(box.min.x + EPSILON),
            Math.floor(box.min.y + EPSILON),
            Math.floor(box.min.z + EPSILON)
        );
        const max = new THREE.Vector3(
            Math.ceil(box.max.x - EPSILON) - 1,
            Math.ceil(box.max.y - EPSILON) - 1,
            Math.ceil(box.max.z - EPSILON) - 1
        );

        const collisions = [];
        for (let x = min.x; x <= max.x; x += 1) {
            for (let y = min.y; y <= max.y; y += 1) {
                for (let z = min.z; z <= max.z; z += 1) {
                    if (this.isSolidAt(x, y, z)) {
                        collisions.push({ x, y, z });
                    }
                }
            }
        }

        return collisions;
    }

    fillChunkTerrain(chunk) {
        for (let x = 0; x < chunk.size; x += 1) {
            for (let z = 0; z < chunk.size; z += 1) {
                const worldX = chunk.chunkX * chunk.size + x;
                const worldZ = chunk.chunkZ * chunk.size + z;
                const surfaceY = this.computeSurfaceHeight(worldX, worldZ);

                for (let y = 0; y < chunk.height; y += 1) {
                    if (y > surfaceY) {
                        chunk.setBlock(x, y, z, this.blockManager.getBlockByName('air').id);
                        continue;
                    }

                    if (y === surfaceY) {
                        chunk.setBlock(x, y, z, this.blockManager.getBlockByName('grama').id);
                    } else if (y > surfaceY - 4) {
                        chunk.setBlock(x, y, z, this.blockManager.getBlockByName('terra').id);
                    } else {
                        chunk.setBlock(x, y, z, this.blockManager.getBlockByName('pedra').id);
                    }
                }
            }
        }
    }

    computeSurfaceHeight(x, z) {
        const base = 6;
        const hills = Math.sin(x * 0.15) * 2 + Math.cos(z * 0.2) * 2;
        const elevation = Math.floor(base + hills + Math.sin((x + z) * 0.1));
        return Math.min(this.chunkHeight - 2, Math.max(1, elevation));
    }

    getSurfaceHeight(x, z) {
        for (let y = this.chunkHeight - 1; y >= 0; y -= 1) {
            if (this.isSolidAt(x, y, z)) {
                return y;
            }
        }
        return -1;
    }

    getBounds(radius = 1) {
        const min = new THREE.Vector3(
            -radius * this.chunkSize,
            0,
            -radius * this.chunkSize
        );
        const max = new THREE.Vector3(
            (radius + 1) * this.chunkSize,
            this.chunkHeight,
            (radius + 1) * this.chunkSize
        );
        return { min, max };
    }
}
