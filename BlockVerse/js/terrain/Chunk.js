import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const FACES = [
    { offset: [0, 1, 0], rotation: [ -Math.PI / 2, 0, 0 ], translate: [0, 1, 0] },
    { offset: [0, -1, 0], rotation: [ Math.PI / 2, 0, 0 ], translate: [0, 0, 0] },
    { offset: [0, 0, 1], rotation: [0, 0, 0], translate: [0, 0, 1] },
    { offset: [0, 0, -1], rotation: [0, Math.PI, 0], translate: [0, 0, 0] },
    { offset: [1, 0, 0], rotation: [0, -Math.PI / 2, 0], translate: [1, 0, 0] },
    { offset: [-1, 0, 0], rotation: [0, Math.PI / 2, 0], translate: [0, 0, 0] }
];

export default class Chunk {
    constructor(chunkX, chunkZ, blockManager, size = 16, height = 128) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.size = size;
        this.height = height;
        this.blockManager = blockManager;
        this.blocks = new Uint16Array(size * size * height);
        this.mesh = null;
        this.material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });

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

    disposeMesh() {
        if (!this.mesh) return;
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
            }
        });
        this.mesh = null;
    }

    createFaceGeometry(face, color) {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const vertexCount = geometry.attributes.position.count;
        const colorArray = new Float32Array(vertexCount * 3);
        for (let i = 0; i < vertexCount; i += 1) {
            colorArray[i * 3 + 0] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        geometry.rotateX(face.rotation[0]);
        geometry.rotateY(face.rotation[1]);
        geometry.rotateZ(face.rotation[2]);
        return geometry;
    }

    buildMesh(world) {
        if (this.mesh) {
            world.scene.remove(this.mesh);
            this.disposeMesh();
        }

        const geometryList = [];

        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.height; y += 1) {
                for (let z = 0; z < this.size; z += 1) {
                    const block = this.getBlock(x, y, z);
                    if (!block.solid) continue;

                    const worldX = x + this.chunkX * this.size;
                    const worldZ = z + this.chunkZ * this.size;
                    const blockColor = new THREE.Color(block.color);

                    for (const face of FACES) {
                        const neighborBlock = world.getBlockAt(
                            worldX + face.offset[0],
                            y + face.offset[1],
                            worldZ + face.offset[2]
                        );

                        if (neighborBlock && neighborBlock.solid && !neighborBlock.transparent) {
                            continue;
                        }

                        const faceGeometry = this.createFaceGeometry(face, blockColor);
                        faceGeometry.translate(
                            worldX + face.translate[0] + 0.5,
                            y + face.translate[1] + 0.5,
                            worldZ + face.translate[2] + 0.5
                        );
                        geometryList.push(faceGeometry);
                    }
                }
            }
        }

        if (geometryList.length === 0) {
            this.mesh = null;
            return;
        }

        const mergedGeometry = mergeGeometries(geometryList, false);
        mergedGeometry.computeVertexNormals();

        this.mesh = new THREE.Mesh(mergedGeometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        world.scene.add(this.mesh);
    }
}
