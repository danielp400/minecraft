import Chunk from './Chunk.js';
import * as THREE from 'three';

export default class World {
    constructor(blockManager, chunkSize = 16, chunkHeight = 32) {
        this.blockManager = blockManager;
        this.chunkSize = chunkSize;
        this.chunkHeight = chunkHeight;
        this.chunks = new Map();
        this.scene = null;
    }

    getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    addChunk(chunk) {
        this.chunks.set(this.getChunkKey(chunk.chunkX, chunk.chunkZ), chunk);
    }

    getChunk(chunkX, chunkZ) {
        return this.chunks.get(this.getChunkKey(chunkX, chunkZ));
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
        const min = new THREE.Vector3(
            Math.floor(box.min.x),
            Math.floor(box.min.y),
            Math.floor(box.min.z)
        );
        const max = new THREE.Vector3(
            Math.floor(box.max.x),
            Math.floor(box.max.y),
            Math.floor(box.max.z)
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

    generateTerrain(radius = 1, scene) {
        this.scene = scene;

        for (let chunkX = -radius; chunkX <= radius; chunkX += 1) {
            for (let chunkZ = -radius; chunkZ <= radius; chunkZ += 1) {
                const chunk = new Chunk(chunkX, chunkZ, this.blockManager, this.chunkSize, this.chunkHeight);
                this.fillChunkTerrain(chunk);
                this.addChunk(chunk);
            }
        }

        this.chunks.forEach((chunk) => chunk.buildMesh(this));
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
