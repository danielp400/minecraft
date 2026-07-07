import * as THREE from 'three';

// ============================================================================
// 🎮 BLOCKVERSE - Arquitetura Principal do Jogo
// ============================================================================

// Estado global do jogo
const gameState = {
    isGameStarted: false,
    isGameRunning: false,
    deltaTime: 0,
    clock: new THREE.Clock()
};

// Referências globais
let scene, camera, renderer;
let player, controls;

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
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
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

    // Criar plano base (chão)
    const groundGeometry = new THREE.BoxGeometry(200, 1, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2d8a3d });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    ground.position.y = 0;
    scene.add(ground);

    // Adicionar algumas estruturas simples
    addTestStructures();

    console.log('✅ Cena inicializada com sucesso!');
}

// ============================================================================
// 2️⃣ INICIALIZAR PLAYER
// ============================================================================

function initPlayer() {
    // Criar objeto do jogador
    player = {
        position: new THREE.Vector3(0, 1.7, 10),
        velocity: new THREE.Vector3(0, 0, 0),
        isOnGround: false,
        speed: 0.15, // Unidades por frame
        jumpForce: 0.25,
        gravity: -0.02,
        groundFriction: 0.8,
        airFriction: 0.95
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

    // Detecção de colisão com chão
    if (camera.position.y <= 1.7) {
        player.velocity.y = 0;
        player.isOnGround = true;

        // Pulo (espaço)
        if (controls.keys[' ']) {
            player.velocity.y = player.jumpForce;
            player.isOnGround = false;
        }
    } else {
        player.isOnGround = false;
    }

    // Aplicar atrito
    const frictionFactor = player.isOnGround ? player.groundFriction : player.airFriction;
    player.velocity.x *= frictionFactor;
    player.velocity.z *= frictionFactor;

    // Atualizar posição do player
    player.position.addScaledVector(player.velocity, 1);

    // Limites do mundo
    player.position.clamp(new THREE.Vector3(-100, 0, -100), new THREE.Vector3(100, 50, 100));

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