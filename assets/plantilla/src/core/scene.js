// Escritorio, luz de ventana, cámara y los tres renderizadores (WebGL + páginas HTML en 3D + rótulos).
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { KEY_DIR } from './ink.js';

function canvasTex(w, h, draw, { srgb = true, repeat } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

// madera clara de veta larga, dibujada a mano en un canvas (sin imágenes externas)
function woodTexture() {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#d9cbb3'; g.fillRect(0, 0, w, h);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) {
      const y = rnd() * h, a = 0.025 + rnd() * 0.06;
      g.strokeStyle = rnd() > 0.5 ? `rgba(120,90,55,${a})` : `rgba(255,248,235,${a})`;
      g.lineWidth = 1 + rnd() * 3;
      g.beginPath();
      for (let x = -10; x <= w + 10; x += 16) {
        const yy = y + Math.sin(x * 0.004 + i) * 6 + Math.sin(x * 0.013 + i * 3) * 2;
        x < 0 ? g.moveTo(x, yy) : g.lineTo(x, yy);
      }
      g.stroke();
    }
    // tablas
    g.strokeStyle = 'rgba(90,65,40,0.25)'; g.lineWidth = 2;
    for (let y = 0; y < h; y += 256) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }, { repeat: [3, 3] });
}

// paño de escritorio con fibra fina
function feltTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#93aaa3'; g.fillRect(0, 0, w, h);
    const img = g.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
  }, { repeat: [4, 4] });
}

export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;
  renderer.domElement.id = 'c';
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', 'Libro abierto en 3D. Usa las flechas del teclado para cambiar de página.');
  container.appendChild(renderer.domElement);

  const css3d = new CSS3DRenderer();
  css3d.domElement.className = 'css3d';
  container.appendChild(css3d.domElement);
  const css2d = new CSS2DRenderer();
  css2d.domElement.className = 'css2d';
  container.appendChild(css2d.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c9bda9');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.05, 50);
  camera.position.set(0.5, 2, 1.5); // nunca en el origen: OrbitControls se inicializa con NaN si cámara y objetivo coinciden
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.9;
  controls.maxDistance = 5.2;
  controls.minPolarAngle = 0.05;
  controls.maxPolarAngle = 1.2;
  controls.screenSpacePanning = true;

  // escritorio y paño
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.75 }));
  desk.rotation.x = -Math.PI / 2;
  desk.position.y = -0.004;
  desk.receiveShadow = true;
  scene.add(desk);
  const felt = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.004, 2.3), new THREE.MeshStandardMaterial({ map: feltTexture(), roughness: 1 }));
  felt.position.set(0, -0.002, 0.05);
  felt.receiveShadow = true;
  scene.add(felt);

  // luz de ventana (principal, con sombras) + cielo y rebote cálido
  const hemi = new THREE.HemisphereLight('#f3efe6', '#7d6a55', 0.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff6e8', 2.3);
  key.position.copy(KEY_DIR).multiplyScalar(4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -2; key.shadow.camera.right = 2;
  key.shadow.camera.top = 2; key.shadow.camera.bottom = -2;
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 10;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.01;
  key.shadow.radius = 4;
  scene.add(key);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    css3d.setSize(w, h);
    css2d.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  return { renderer, css3d, css2d, scene, camera, controls, key, canvasTex };
}

export { canvasTex };
