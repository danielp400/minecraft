import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const FACES = [
    { name: 'top', offset: [0, 1, 0], rotation: [ -Math.PI / 2, 0, 0 ], translate: [0, 1, 0] },
    { name: 'bottom', offset: [0, -1, 0], rotation: [ Math.PI / 2, 0, 0 ], translate: [0, 0, 0] },
    { name: 'north', offset: [0, 0, 1], rotation: [0, 0, 0], translate: [0, 0, 1] },
    { name: 'south', offset: [0, 0, -1], rotation: [0, Math.PI, 0], translate: [0, 0, 0] },
    { name: 'east', offset: [1, 0, 0], rotation: [0, -Math.PI / 2, 0], translate: [1, 0, 0] },
    { name: 'west', offset: [-1, 0, 0], rotation: [0, Math.PI / 2, 0], translate: [0, 0, 0] }
];

export default class Chunk {
    constructor(chunkX, chunkZ, blockManager, size = 16, height = 32) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.size = size;
        this.height = height;
        this.blockManager = blockManager;
        this.blocks = new Uint16Array(size * size * height);
        this.mesh = null;

        this.fillWithAir();
    }

    fillWithAir() {
        const air = this.blockManager.getBlockByName('air').id;
        this.blocks.fill(air);
    }

    getIndex(x, y, z) {
        return x + z * this.size + y * this.size * this.size;
    }

    isValidPosition(x, y, z) {
        return x >= 0 && x < this.size && y >= 0 && y < this.height && z >= 0 && z < this.size;
    }

    setBlock(x, y, z, blockId) {
        if (!this.isValidPosition(x, y, z)) return;
        this.blocks[this.getIndex(x, y, z)] = blockId;
    }

    getBlock(x, y, z) {
        if (!this.isValidPosition(x, y, z)) {
            return this.blockManager.getBlockByName('air');
        }

        const id = this.blocks[this.getIndex(x, y, z)];
        return this.blockManager.getBlock(id);
    }

    buildMesh(world) {
        if (this.mesh) {
            world.scene.remove(this.mesh);
            this.mesh = null;
        }

        const geometryBuckets = new Map();

        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.height; y += 1) {
                for (let z = 0; z < this.size; z += 1) {
                    const block = this.getBlock(x, y, z);
                    if (!block.solid) continue;

                    const worldX = x + this.chunkX * this.size;
                    const worldZ = z + this.chunkZ * this.size;

                    for (const face of FACES) {
                        const neighborBlock = world.getBlockAt(
                            worldX + face.offset[0],
                            y + face.offset[1],
                            worldZ + face.offset[2]
                        );

                        if (neighborBlock && neighborBlock.solid) {
                            continue;
                        }

                        const faceGeometry = new THREE.PlaneGeometry(1, 1);
                        faceGeometry.rotateX(face.rotation[0]);
                        faceGeometry.rotateY(face.rotation[1]);
                        faceGeometry.rotateZ(face.rotation[2]);
                        faceGeometry.translate(
                            worldX + face.translate[0] + 0.5,
                            y + face.translate[1] + 0.5,
                            worldZ + face.translate[2] + 0.5
                        );

                        const bucketKey = block.id;
                        if (!geometryBuckets.has(bucketKey)) {
                            geometryBuckets.set(bucketKey, []);
                        }
                        geometryBuckets.get(bucketKey).push(faceGeometry);
                    }
                }
            }
        }

        const group = new THREE.Group();

        geometryBuckets.forEach((geometries, blockId) => {
            const mergedGeometry = mergeGeometries(geometries, false);
            mergedGeometry.computeVertexNormals();
            const block = this.blockManager.getBlock(blockId);
            const mesh = new THREE.Mesh(mergedGeometry, block.material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
        });

        this.mesh = group;
        world.scene.add(this.mesh);
    }
}
