import * as THREE from 'three';

// Criar cena, câmera e renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('game'),
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.pixelRatio = window.devicePixelRatio;

// Iluminação
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(20, 50, 20);
directionalLight.castShadow = true;
scene.add(directionalLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Criar plano base
const plane = new THREE.Mesh(
    new THREE.BoxGeometry(100, 1, 100),
    new THREE.MeshLambertMaterial({ color: 0x3cb043 })
);
plane.receiveShadow = true;
scene.add(plane);

// Controlar início do jogo
let started = false;

window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' && !started) {
        started = true;
        document.getElementById('menu').style.display = 'none';
        animate();
    }
});

// Loop de animação
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Ajustar câmera e renderizador ao redimensionar
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('✅ BlockVerse carregado com sucesso!');
console.log('📝 Three.js versão:', THREE.REVISION);
console.log('🎮 Pressione ENTER para começar!');