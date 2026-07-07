export function registerDefaultBlocks(manager) {
    manager.registerBlock({
        id: 0,
        name: 'Air',
        type: 'air',
        resistance: 0,
        transparent: true,
        solid: false,
        texture: 'air',
        color: 0x87ceeb
    });

    manager.registerBlock({
        id: 1,
        name: 'Grama',
        type: 'natural',
        resistance: 1.5,
        transparent: false,
        solid: true,
        texture: 'grass',
        color: 0x4caf50
    });

    manager.registerBlock({
        id: 2,
        name: 'Terra',
        type: 'natural',
        resistance: 1.0,
        transparent: false,
        solid: true,
        texture: 'dirt',
        color: 0x8b5a2b
    });

    manager.registerBlock({
        id: 3,
        name: 'Pedra',
        type: 'natural',
        resistance: 5.0,
        transparent: false,
        solid: true,
        texture: 'stone',
        color: 0x7d7d7d
    });
}
