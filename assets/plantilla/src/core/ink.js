// El "dibujo a tinta" de los diagramas: superficies de papel sombreadas con trama de grabado
// (hatching en el espacio del objeto) y contornos de pluma con grosor constante en pantalla.
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

export const INK = new THREE.Color('#22262f');
export const PAPER = new THREE.Color('#f4eee2');
export const KEY_DIR = new THREE.Vector3(-0.45, 0.8, 0.4).normalize();

// paleta de colores con significado (úsala también en el texto de las páginas: var(--P), var(--S)…)
export const C = {
  P: '#2f6fd6', // ondas P: azul
  S: '#e0602a', // ondas S: naranja
  L: '#2f9a6a', // ondas Love: verde
  R: '#9b4fc4', // ondas Rayleigh: violeta
  energy: '#f29a2e',
  hot: '#e2443a',
  water: '#4c8fd0',
};

const vert = /* glsl */ `
varying vec3 vW; varying vec3 vN; varying vec3 vObj;
#include <clipping_planes_pars_vertex>
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz; vObj = position;
  // normal correcta aun con escala no uniforme (el dibujo "se levanta" escalando en y)
  vN = normalize((vec4(normal, 0.0) * inverse(modelMatrix)).xyz);
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}`;

const frag = /* glsl */ `
uniform vec3 uInk, uPaper, uTint, uL; uniform float uTintAmt, uOpacity, uDensity, uShade, uGlow;
varying vec3 vW; varying vec3 vN; varying vec3 vObj;
#include <clipping_planes_pars_fragment>
// una familia de líneas paralelas; cuando se juntan a menos de ~2 px se funden en su tono medio (sin moiré)
float lines(float f, float w) {
  float fw = max(fwidth(f), 1e-4);
  float d = abs(fract(f) - 0.5);
  float l = 1.0 - smoothstep(w - fw, w + fw, d);
  return mix(l, w * 2.0, smoothstep(0.3, 0.7, fw));
}
void main() {
  #include <clipping_planes_fragment>
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  float lit = clamp(dot(n, normalize(uL)) * 0.5 + 0.5, 0.0, 1.0);
  float dark = clamp((1.0 - lit) * uShade, 0.0, 1.0);
  float h1 = lines(dot(vW, normalize(vec3(1.0, 0.35, 0.6))) * uDensity, 0.14);
  float h2 = lines(dot(vW, normalize(vec3(-0.7, 0.3, 1.0))) * uDensity, 0.12);
  float h3 = lines(dot(vW, normalize(vec3(0.2, 1.0, -0.5))) * uDensity * 1.3, 0.1);
  float m = h1 * smoothstep(0.22, 0.34, dark) + h2 * smoothstep(0.42, 0.55, dark) + h3 * smoothstep(0.62, 0.75, dark);
  vec3 base = mix(uPaper, uTint, uTintAmt);
  vec3 col = mix(base, uInk, clamp(m, 0.0, 1.0) * 0.78);
  col += uTint * uGlow; // brillo de energía
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}`;

/** Material de tinta con trama. tint: color de acuarela suave; tintAmt 0..1. */
export function inkMaterial({ tint = '#ffffff', tintAmt = 0, shade = 1, density = 110, opacity = 1, side = THREE.FrontSide, glow = 0 } = {}) {
  const m = new THREE.ShaderMaterial({
    uniforms: {
      uInk: { value: INK.clone() },
      uPaper: { value: PAPER.clone() },
      uTint: { value: new THREE.Color(tint) },
      uTintAmt: { value: tintAmt },
      uL: { value: KEY_DIR.clone() },
      uOpacity: { value: opacity },
      uDensity: { value: density },
      uShade: { value: shade },
      uGlow: { value: glow },
    },
    vertexShader: vert,
    fragmentShader: frag,
    transparent: opacity < 1,
    side,
    clipping: true,
    extensions: {},
  });
  return m;
}

/** Material de línea de pluma (grosor en píxeles de pantalla). */
export function penMaterial({ color = INK, width = 1.6, opacity = 1, dashed = false, dashSize = 0.01, gapSize = 0.008 } = {}) {
  const m = new LineMaterial({ color: new THREE.Color(color), linewidth: width, transparent: opacity < 1, opacity, dashed, dashSize, gapSize, worldUnits: false });
  if (dashed) m.defines.USE_DASH = '';
  return m;
}

/** Contornos de un geometry (aristas marcadas + silueta aproximada por umbral de ángulo). */
export function edges(geometry, { angle = 28, width = 1.5, color = INK, opacity = 1 } = {}) {
  const eg = new THREE.EdgesGeometry(geometry, angle);
  const g = new LineSegmentsGeometry().setPositions(eg.attributes.position.array);
  eg.dispose();
  const l = new LineSegments2(g, penMaterial({ width, color, opacity }));
  l.renderOrder = 2;
  return l;
}

/** Malla de tinta = superficie con trama + contornos. */
export function inkMesh(geometry, opts = {}) {
  const g = new THREE.Group();
  const mesh = new THREE.Mesh(geometry, opts.material || inkMaterial(opts));
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = false;
  g.add(mesh);
  if (opts.outline !== false) g.add(edges(geometry, { angle: opts.angle ?? 28, width: opts.lineWidth ?? 1.5 }));
  g.userData.mesh = mesh;
  return g;
}

/** Polilínea de pluma a partir de puntos Vector3. */
export function penLine(points, opts = {}) {
  const g = new LineGeometry();
  g.setPositions(points.flatMap((p) => [p.x, p.y, p.z]));
  const l = new Line2(g, penMaterial(opts));
  if (opts.dashed) l.computeLineDistances();
  l.renderOrder = 3;
  return l;
}

/** Segmentos de pluma (pares de puntos), útil para retículas que se actualizan cada cuadro. */
export function penSegments(count, opts = {}) {
  const g = new LineSegmentsGeometry();
  g.setPositions(new Float32Array(count * 6));
  const l = new LineSegments2(g, penMaterial(opts));
  l.frustumCulled = false;
  l.renderOrder = 3;
  // acceso directo al arreglo para escribir posiciones sin recrear buffers
  l.userData.write = (arr) => {
    const ib = g.attributes.instanceStart.data;
    ib.array.set(arr);
    ib.needsUpdate = true;
  };
  return l;
}

/** Actualiza una Line2 existente con nuevos puntos (mismo o distinto largo). */
export function setLinePoints(line, points) {
  const arr = [];
  for (const p of points) arr.push(p.x, p.y, p.z);
  if (arr.length < 6) arr.push(...arr.slice(0, 3), ...arr.slice(0, 3));
  line.geometry.dispose();
  line.geometry = new LineGeometry();
  line.geometry.setPositions(arr);
  if (line.material.dashed) line.computeLineDistances();
}

/** Material "luminoso" para energía y ondas: color plano saturado, sin tono-mapeo. */
export function glowMaterial(color, opacity = 0.9) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity, toneMapped: false, depthWrite: opacity >= 1 });
}

/** Flecha de tinta en el plano: shaft + punta (en 3D, como tubo fino). */
export function arrow(from, to, { color = INK, radius = 0.005, head = 0.025 } = {}) {
  const g = new THREE.Group();
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  dir.normalize();
  const mat = typeof color === 'string' || color.isColor ? glowMaterial(color, 1) : color;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, Math.max(0.001, len - head), 10), mat);
  shaft.position.y = (len - head) / 2;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(radius * 2.6, head, 14), mat);
  tip.position.y = len - head / 2;
  g.add(shaft, tip);
  g.position.copy(from);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return g;
}

export const ease = {
  outBack: (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
};

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
