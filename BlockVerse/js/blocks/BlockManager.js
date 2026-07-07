import * as THREE from 'three';
import Block from './Block.js';

export default class BlockManager {
    constructor() {
        this.blocks = new Map();
        this.blocksByName = new Map();
    }

    registerBlock(blockDefinition) {
        const block = new Block(blockDefinition);
        const material = new THREE.MeshLambertMaterial({
            color: block.color,
            transparent: block.transparent,
            opacity: block.transparent ? 0.3 : 1,
            depthWrite: !block.transparent
        });

        block.material = material;
        this.blocks.set(block.id, block);
        this.blocksByName.set(block.name.toLowerCase(), block);
        return block;
    }

    getBlock(blockId) {
        return this.blocks.get(blockId) || this.getBlockByName('air');
    }

    getBlockByName(name) {
        return this.blocksByName.get(name.toLowerCase());
    }
}
