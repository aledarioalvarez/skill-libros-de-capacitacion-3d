// El libro: tapas de tela con letras doradas, bloques de páginas, una hoja que se da vuelta
// y dos páginas HTML reales (CSS3D) apoyadas sobre el papel.
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { canvasTex } from './scene.js';
import { tween } from './tween.js';
import { ease } from './ink.js';
import CFG from '../libro.config.js';

export const PW = 1.0; // ancho de página (unidades de mundo)
export const PH = 1.34; // alto de página
export const DOM_W = 800; // ancho de la página HTML en px
export const DOM_H = Math.round((DOM_W * PH) / PW);
const BT = 0.014; // grosor de tapa
const SH = 0.034; // grosor del bloque de hojas de cada lado
export const H0 = BT + SH; // altura de la superficie de las páginas
const OVER = 0.025; // la tapa sobresale de las hojas
const COVER = CFG.colorTapa;
const GOLD = CFG.colorOro;

function paperTex(gutterRight) {
  return canvasTex(1024, 1372, (g, w, h) => {
    g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h);
    const img = g.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 6;
      img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n - 1;
    }
    g.putImageData(img, 0, 0);
    // sombra del lomo: el papel se curva hacia la costura
    const gx = gutterRight ? w : 0;
    const grd = g.createLinearGradient(gx, 0, gutterRight ? w - 150 : 150, 0);
    grd.addColorStop(0, 'rgba(70,55,35,0.30)');
    grd.addColorStop(0.35, 'rgba(70,55,35,0.08)');
    grd.addColorStop(1, 'rgba(70,55,35,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
}

function edgeTex() {
  return canvasTex(64, 512, (g, w, h) => {
    g.fillStyle = '#efe7d6'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(120,100,70,${0.08 + Math.random() * 0.1})`; g.fillRect(0, y, w, 1); }
  });
}

// texto y ornamento dorados de la tapa (se dibujan dos veces: en color y como máscara del brillo metálico)
function drawCover(g, w, h, ink) {
  g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 3;
  g.strokeRect(60, 60, w - 120, h - 120);
  g.lineWidth = 1.2; g.strokeRect(74, 74, w - 148, h - 148);
  g.textAlign = 'center';
  // líneas del título: las palabras cortas (y, de, la…) van pequeñas y en cursiva
  let y = 300;
  for (const line of CFG.tapa) {
    const small = line.length <= 3;
    const size = small ? 64 : Math.min(112, Math.floor(1500 / Math.max(6, line.length)));
    g.font = small ? 'italic 400 64px "Source Serif 4 Variable", Georgia, serif' : `600 ${size}px "Source Serif 4 Variable", Georgia, serif`;
    g.fillText(line, w / 2, y);
    y += small ? 90 : size + 8;
  }
  g.font = '400 34px "Source Serif 4 Variable", Georgia, serif';
  g.fillText(CFG.subtitulo, w / 2, y + 20);
  const y0 = Math.max(820, y + 220);
  g.lineWidth = 3; g.beginPath();
  if (CFG.ornamento === 'sismograma') {
    for (let x = 150; x <= w - 150; x += 2) {
      const u = (x - 150) / (w - 300);
      let a = 0;
      if (u > 0.18) a += 14 * Math.exp(-(((u - 0.2) * 30) ** 2) * 0.1) * Math.sin(u * 900);
      if (u > 0.4) a += 70 * Math.exp(-(((u - 0.5) * 9) ** 2)) * Math.sin(u * 420);
      if (u > 0.6) a += 40 * Math.exp(-(((u - 0.72) * 6) ** 2)) * Math.sin(u * 160);
      x === 150 ? g.moveTo(x, y0 - a) : g.lineTo(x, y0 - a);
    }
    g.stroke();
  } else if (CFG.ornamento === 'onda') {
    for (let x = 150; x <= w - 150; x += 2) {
      const u = (x - 150) / (w - 300);
      const a = 40 * Math.sin(u * Math.PI * 6) * Math.sin(u * Math.PI);
      x === 150 ? g.moveTo(x, y0 - a) : g.lineTo(x, y0 - a);
    }
    g.stroke();
  }
  g.font = 'italic 400 30px "Source Serif 4 Variable", Georgia, serif';
  g.fillText(`${CFG.unidad} · ${CFG.pregunta}`, w / 2, h - 170, w - 220);
}

function clothTex(color, withTitle) {
  return canvasTex(1024, 1372, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    // trama de tela
    for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.04})`; g.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 2) { g.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`; g.fillRect(x, 0, 1, h); }
    if (withTitle) drawCover(g, w, h, GOLD);
  });
}

// metalness: sólo donde hay oro (máscara blanca sobre negro)
function foilMask() {
  return canvasTex(1024, 1372, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    drawCover(g, w, h, '#fff');
  }, { srgb: false });
}

export function createBook(stage) {
  const { scene } = stage;
  const group = new THREE.Group();
  scene.add(group);

  const cloth = new THREE.MeshStandardMaterial({ map: clothTex(COVER, false), roughness: 0.85 });
  const coverMap = clothTex(COVER, true);
  const foil = foilMask();
  const coverMat = new THREE.MeshStandardMaterial({ map: coverMap, roughness: 0.8, metalness: 0, metalnessMap: foil });
  coverMat.onBeforeCompile = (s) => {
    // el oro brilla más y es menos rugoso que la tela
    s.fragmentShader = s.fragmentShader.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, 0.32, texture2D(metalnessMap, vMetalnessMapUv).r);`);
  };
  coverMat.metalness = 1; // modulado por metalnessMap (0 en la tela)
  const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTex(), roughness: 0.9 });
  const paperL = new THREE.MeshStandardMaterial({ map: paperTex(true), roughness: 0.95 });
  const paperR = new THREE.MeshStandardMaterial({ map: paperTex(false), roughness: 0.95 });

  function half(isLeft) {
    const g = new THREE.Group();
    const s = isLeft ? -1 : 1;
    const board = new THREE.Mesh(new THREE.BoxGeometry(PW + OVER, BT, PH + 2 * OVER), cloth);
    board.position.set(s * (PW + OVER) / 2, BT / 2, 0);
    const blockGeo = new THREE.BoxGeometry(PW - 0.006, SH, PH);
    const block = new THREE.Mesh(blockGeo, [edgeMat, edgeMat, isLeft ? paperL : paperR, edgeMat, edgeMat, edgeMat]);
    block.position.set(s * (PW / 2 + 0.003), BT + SH / 2, 0);
    for (const m of [board, block]) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
    return { g, board };
  }

  // mitad derecha fija
  const right = half(false);
  group.add(right.g);
  // mitad izquierda: gira sobre el lomo (pivote a la altura de las páginas)
  const leftPivot = new THREE.Group();
  leftPivot.position.set(0, H0, 0);
  const left = half(true);
  left.g.position.y = -H0;
  leftPivot.add(left.g);
  group.add(leftPivot);
  // portada: un plano sobre la cara exterior de la tapa izquierda, orientado para leerse con el libro cerrado
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(PW + OVER, PH + 2 * OVER), coverMat);
  cover.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, -1, 0)));
  cover.position.set(-(PW + OVER) / 2, -0.0005, 0);
  left.g.add(cover);
  // lomo
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(BT * 0.9, BT * 0.9, PH + 2 * OVER, 16, 1, false, 0, Math.PI), cloth);
  spine.rotation.x = Math.PI / 2;
  spine.position.y = BT * 0.5;
  group.add(spine);
  // cinta marcapáginas
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.002, 0.34), new THREE.MeshStandardMaterial({ color: '#1f3561', roughness: 0.6 }));
  ribbon.position.set(0.012, 0.002, PH / 2 + 0.16);
  ribbon.castShadow = true;
  group.add(ribbon);

  // anclas para los dibujos (origen = centro de cada página, y hacia arriba desde el papel)
  const rightAnchor = new THREE.Group();
  rightAnchor.position.set(PW / 2 + 0.003, H0, 0);
  group.add(rightAnchor);
  const leftAnchor = new THREE.Group();
  leftAnchor.position.set(-PW / 2 - 0.003, H0, 0);
  group.add(leftAnchor);

  // hoja que se da vuelta: papel en ambas caras, con renglones grises insinuando texto
  const leafTex = canvasTex(512, 686, (g, w, h) => {
    g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(40,40,50,0.18)';
    for (let y = 90; y < h - 60; y += 18) g.fillRect(48, y, (w - 96) * (0.7 + 0.3 * Math.random()), 5);
  });
  const SEG = 32;
  const leafGeo = new THREE.PlaneGeometry(PW, PH, SEG, 1);
  const leaf = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ map: leafTex, roughness: 0.95, side: THREE.DoubleSide }));
  leaf.castShadow = true;
  leaf.visible = false;
  group.add(leaf);
  function poseLeaf(p, dir) {
    // p: 0 (sobre la derecha) → 1 (sobre la izquierda). El borde libre se adelanta y la hoja se curva.
    const th = p * Math.PI;
    const pos = leafGeo.attributes.position;
    const curl = 0.75 * Math.sin(th) * dir;
    const pts = [];
    let x = 0, y = 0;
    for (let i = 0; i <= SEG; i++) {
      const u = i / SEG;
      pts.push([x, y]);
      const phi = Math.min(Math.PI, Math.max(0, th + curl * Math.pow(u, 1.4)));
      x += (PW / SEG) * Math.cos(phi);
      y += (PW / SEG) * Math.sin(phi);
    }
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i <= SEG; i++) {
        const k = j * (SEG + 1) + i;
        pos.setXYZ(k, pts[i][0], H0 + 0.002 + pts[i][1], (j === 0 ? -1 : 1) * PH / 2);
      }
    }
    pos.needsUpdate = true;
    leafGeo.computeVertexNormals();
  }

  // páginas HTML
  const mk = (cls) => {
    const el = document.createElement('div');
    el.className = `page ${cls}`;
    el.style.width = `${DOM_W}px`;
    el.style.height = `${DOM_H}px`;
    const o = new CSS3DObject(el);
    o.scale.setScalar(PW / DOM_W);
    o.rotation.x = -Math.PI / 2;
    scene.add(o);
    return o;
  };
  const cssLeft = mk('left');
  cssLeft.position.set(-PW / 2 - 0.003, H0 + 0.0008, 0);
  const cssRight = mk('right');
  cssRight.position.set(PW / 2 + 0.003, H0 + 0.0008, 0);

  let isOpen = false;
  function setOpenAmount(a) {
    leftPivot.rotation.z = -Math.PI * (1 - a);
  }
  setOpenAmount(0);
  cssLeft.visible = cssRight.visible = false;

  function fadePages(to, dur = 0.25) {
    const els = [cssLeft.element, cssRight.element];
    const from = parseFloat(els[0].style.opacity || '1');
    return tween(dur, (t) => els.forEach((e) => (e.style.opacity = String(from + (to - from) * t))));
  }

  return {
    group, rightAnchor, leftAnchor, cssLeft, cssRight,
    get isOpen() { return isOpen; },
    async open() {
      if (isOpen) return;
      cssLeft.element.style.opacity = cssRight.element.style.opacity = '0';
      await tween(1.4, setOpenAmount, ease.inOut);
      isOpen = true;
      cssLeft.visible = cssRight.visible = true;
      await fadePages(1, 0.35);
    },
    /** dir = +1 avanza (la hoja va de derecha a izquierda), −1 retrocede. onMid cambia el contenido. */
    async turn(dir, onMid) {
      await fadePages(0, 0.18);
      leaf.visible = true;
      poseLeaf(dir > 0 ? 0 : 1, dir);
      await tween(0.75, (t) => poseLeaf(dir > 0 ? t : 1 - t, dir), ease.inOut);
      leaf.visible = false;
      await onMid?.();
      await fadePages(1, 0.3);
    },
    fadePages,
  };
}
