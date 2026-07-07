import * as THREE from 'three';
import BlockManager from './blocks/BlockManager.js';
import { registerDefaultBlocks } from './blocks/BlockTypes.js';
import World from './terrain/World.js';

// ============================================================================
// 🎮 BLOCKVERSE - Arquitetura Principal do Jogo
// ============================================================================

// Estado global do jogo
const gameState = {
    isGameStarted: false,
    isGameRunning: false,
    deltaTime: 0,
    clock: new THREE.Clock(),
    frameCount: 0
};

// Referências globais
let scene, camera, renderer;
let player, controls;
let blockManager, world;

// ============================================================================
// 1️⃣ INICIALIZAR CENA
// ============================================================================

function initScene() {
    // Criar cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 1000);

    // Criar câmera (FPS)
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.7, 5); // Altura dos olhos de uma pessoa
    camera.lookAt(0, 1.7, 0);

    // Criar renderizador
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.pixelRatio = window.devicePixelRatio;

    // Adicionar iluminação
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(30, 50, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    initWorld();

    console.log('✅ Cena inicializada com sucesso!');
}

function initWorld() {
    blockManager = new BlockManager();
    registerDefaultBlocks(blockManager);

    world = new World(blockManager, 16, 128, 2, 4);
    world.setScene(scene);
    world.generateTerrain(2, scene);
}

// ============================================================================
// 2️⃣ INICIALIZAR PLAYER
// ============================================================================

function initPlayer() {
    const surfaceY = world.getSurfaceHeight(0, 0);
    const spawnY = surfaceY + 1 + 1.7 + 0.01;
    player = {
        position: new THREE.Vector3(0, spawnY, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        isOnGround: false,
        speed: 0.15, // Unidades por frame
        jumpForce: 0.25,
        gravity: -0.02,
        groundFriction: 0.8,
        airFriction: 0.95,
        radius: 0.35,
        eyeHeight: 1.7
    };

    // Atualizar posição da câmera para posição do player
    camera.position.copy(player.position);
}

// ============================================================================
// 3️⃣ INICIALIZAR CONTROLES
// ============================================================================

function initControls() {
    // Sistema de entrada
    const keys = {
        'w': false,
        'a': false,
        's': false,
        'd': false,
        ' ': false
    };

    // Listeners para teclado
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys) {
            keys[key] = true;
            e.preventDefault();
        }

        // ENTER para iniciar
        if (e.code === 'Enter' && !gameState.isGameStarted) {
            startGame();
        }

        // ESC para sair do pointer lock
        if (e.code === 'Escape') {
            if (document.pointerLockElement === renderer.domElement) {
                document.exitPointerLock();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key in keys) {
            keys[key] = false;
            e.preventDefault();
        }
    });

    // Movimento do mouse para olhar
    let mouseX = 0;
    let mouseY = 0;
    let eulerOrder = new THREE.Euler(0, 0, 0, 'YXZ');

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === renderer.domElement) {
            mouseX -= e.movementX * 0.003; // Sensibilidade de mouse
            mouseY -= e.movementY * 0.003;

            // Limitar rotação vertical (não virar de cabeça para baixo demais)
            mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseY));

            // Aplicar rotação à câmera
            eulerOrder.setFromQuaternion(camera.quaternion);
            eulerOrder.order = 'YXZ';
            eulerOrder.rotationOrder = 'YXZ';
            eulerOrder.y = mouseX;
            eulerOrder.x = mouseY;
            camera.quaternion.setFromEuler(eulerOrder);
        }
    });

    // Ativar Pointer Lock ao clicar
    renderer.domElement.addEventListener('click', () => {
        if (gameState.isGameRunning && document.pointerLockElement !== renderer.domElement) {
            renderer.domElement.requestPointerLock();
        }
    });

    // Armazenar referência aos controles
    controls = {
        keys,
        mouseX,
        mouseY,
        eulerOrder
    };

    console.log('✅ Controles inicializados!');
    console.log('🎮 Controles: WASD para mover, Mouse para olhar');
    console.log('🖱️ Clique para capturar o mouse (Pointer Lock)');
    console.log('🔚 ESC para liberar o mouse');
}

// ============================================================================
// 4️⃣ INICIAR JOGO
// ============================================================================

function startGame() {
    gameState.isGameStarted = true;
    gameState.isGameRunning = true;

    // Esconder menu
    const menu = document.getElementById('menu');
    if (menu) {
        menu.style.display = 'none';
    }

    // Tentar capturar o mouse
    renderer.domElement.requestPointerLock();

    console.log('🎮 Jogo iniciado!');
    console.log('🎯 Clique no canvas para capturar o mouse');
}

// ============================================================================
// 5️⃣ ATUALIZAR PLAYER
// ============================================================================

function updatePlayer() {
    if (!gameState.isGameRunning) return;

    // Calcular direção do movimento baseado na câmera
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0; // Ignorar componente vertical
    forward.normalize();

    right.crossVectors(camera.up, forward).normalize();

    // Reset velocity horizontal (mas manter vertical)
    const currentVelocityY = player.velocity.y;
    player.velocity.set(0, currentVelocityY, 0);

    // Aplicar movimento WASD
    if (controls.keys['w']) {
        player.velocity.addScaledVector(forward, player.speed);
    }
    if (controls.keys['s']) {
        player.velocity.addScaledVector(forward, -player.speed);
    }
    if (controls.keys['d']) {
        player.velocity.addScaledVector(right, player.speed);
    }
    if (controls.keys['a']) {
        player.velocity.addScaledVector(right, -player.speed);
    }

    // Aplicar gravidade
    player.velocity.y += player.gravity;

    // Pulo (espaço)
    if (controls.keys[' '] && player.isOnGround) {
        player.velocity.y = player.jumpForce;
        player.isOnGround = false;
    }

    const frictionFactor = player.isOnGround ? player.groundFriction : player.airFriction;
    player.velocity.x *= frictionFactor;
    player.velocity.z *= frictionFactor;

    const stepPosition = player.position.clone();
    const nextPosition = player.position.clone().add(player.velocity);

    const createPlayerBox = (position) => {
        const minY = position.y - player.eyeHeight;
        const maxY = position.y;

        return new THREE.Box3(
            new THREE.Vector3(
                position.x - player.radius,
                minY,
                position.z - player.radius
            ),
            new THREE.Vector3(
                position.x + player.radius,
                maxY,
                position.z + player.radius
            )
        );
    };

    const collidesAt = (position) => {
        const box = createPlayerBox(position);
        return world.getCollidingBlocks(box).length > 0;
    };

    // Resolver movimento X
    const xPosition = player.position.clone();
    xPosition.x = nextPosition.x;
    if (!collidesAt(xPosition)) {
        player.position.x = xPosition.x;
    } else {
        player.velocity.x = 0;
    }

    // Resolver movimento Z
    const zPosition = player.position.clone();
    zPosition.z = nextPosition.z;
    if (!collidesAt(zPosition)) {
        player.position.z = zPosition.z;
    } else {
        player.velocity.z = 0;
    }

    // Resolver movimento Y
    const yPosition = player.position.clone();
    yPosition.y = nextPosition.y;
    if (!collidesAt(yPosition)) {
        player.position.y = yPosition.y;
        player.isOnGround = false;
    } else {
        if (player.velocity.y < 0) {
            const collidingBlocks = world.getCollidingBlocks(createPlayerBox(yPosition));
            const highestBlockY = collidingBlocks.reduce((maxY, block) => Math.max(maxY, block.y), -Infinity);
            const correctedY = highestBlockY + 1 + player.eyeHeight;
            player.position.y = correctedY;
            player.isOnGround = true;
        }
        player.velocity.y = 0;
    }

    // Limites do mundo
    const worldBounds = world.getBounds(1);
    player.position.clamp(worldBounds.min, worldBounds.max);

    // Atualizar câmera para acompanhar player
    camera.position.copy(player.position);
}

// ============================================================================
// 6️⃣ ADICIONAR ESTRUTURAS DE TESTE
// ============================================================================

function addTestStructures() {
    // Adicionar alguns cubos para testar movimento
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    
    for (let i = 0; i < 6; i++) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshLambertMaterial({ color: colors[i] });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.position.set(
            (i - 2.5) * 8,
            1,
            -30 - i * 5
        );
        scene.add(cube);
    }

    // Adicionar torres
    for (let x = -40; x <= 40; x += 20) {
        for (let z = -50; z <= -10; z += 20) {
            const height = Math.random() * 5 + 3;
            const tower = new THREE.Mesh(
                new THREE.BoxGeometry(2, height, 2),
                new THREE.MeshLambertMaterial({ color: 0x8b4513 })
            );
            tower.castShadow = true;
            tower.receiveShadow = true;
            tower.position.set(x, height / 2, z);
            scene.add(tower);
        }
    }
}

// ============================================================================
// 7️⃣ LOOP PRINCIPAL DE ANIMAÇÃO
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    // Calcular delta time
    gameState.deltaTime = gameState.clock.getDelta();

    // Atualizar player
    if (gameState.isGameRunning) {
        updatePlayer();
        world.update(player.position);
    }

    // Renderizar cena
    renderer.render(scene, camera);
}

// ============================================================================
// 8️⃣ REDIMENSIONAMENTO DA JANELA
// ============================================================================

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});

// ============================================================================
// 9️⃣ INICIALIZAÇÃO DO JOGO
// ============================================================================

function init() {
    console.log('='.repeat(60));
    console.log('🎮 BLOCKVERSE - Inicializando...');
    console.log('='.repeat(60));

    initScene();
    initPlayer();
    initControls();

    // Iniciar loop de animação IMEDIATAMENTE
    animate();

    console.log('✅ BlockVerse carregado com sucesso!');
    console.log('📝 Three.js versão:', THREE.REVISION);
    console.log('🎮 Pressione ENTER para começar!');
    console.log('='.repeat(60));
}

// Iniciar quando o documento carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}