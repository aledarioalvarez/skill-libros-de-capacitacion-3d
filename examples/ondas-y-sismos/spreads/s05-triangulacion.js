// Pliego 5 · ¿Dónde fue? Tres estaciones, tres círculos, un epicentro.
import * as THREE from 'three';
import { h } from '../core/page.js';
import { inkMesh, inkMaterial, penSegments, glowMaterial, C } from '../core/ink.js';
import { canvasTex } from '../core/scene.js';

// mapa de Chile central: equirectangular alrededor de 33,5° S, 72° O
const LAT0 = -33.5, LON0 = -72.2;
const KX = 111.32 * Math.cos((33.5 * Math.PI) / 180), KZ = 110.6; // km por grado
const S = 0.00058; // unidades de dibujo por km
const MAP_W = 0.5, MAP_D = 0.62, MAP_Z = -0.3, MAP_Y = 0.03;
const toXZ = (lat, lon) => ({ x: (lon - LON0) * KX * S, z: MAP_Z - (lat - LAT0) * KZ * S });
const kmBetween = (a, b) => Math.hypot((a.lon - b.lon) * KX, (a.lat - b.lat) * KZ);
// costa aproximada (lat, lon) de norte a sur
const COAST = [[-28.7, -71.3], [-29.5, -71.35], [-30.2, -71.5], [-31, -71.65], [-31.9, -71.52], [-32.6, -71.45], [-33.0, -71.7], [-33.6, -71.65], [-34.1, -71.95], [-34.8, -72.1], [-35.4, -72.45], [-36.0, -72.8], [-36.6, -73.0], [-37.1, -73.2], [-37.6, -73.65], [-38.4, -73.45]];
const STATIONS = [
  { name: 'La Serena', lat: -29.9, lon: -71.25 },
  { name: 'Santiago', lat: -33.45, lon: -70.66 },
  { name: 'Concepción', lat: -36.83, lon: -73.05 },
];
const coastLonAt = (lat) => {
  for (let i = 0; i < COAST.length - 1; i++) {
    const [a, b] = [COAST[i], COAST[i + 1]];
    if (lat <= a[0] && lat >= b[0]) return a[1] + (b[1] - a[1]) * ((lat - a[0]) / (b[0] - a[0]));
  }
  return -72;
};

function mapTexture() {
  const W = 1000, H = Math.round((W * MAP_D) / MAP_W);
  return canvasTex(W, H, (g) => {
    const px = (lat, lon) => { const p = toXZ(lat, lon); return [((p.x + MAP_W / 2) / MAP_W) * W, ((p.z - MAP_Z + MAP_D / 2) / MAP_D) * H]; };
    g.fillStyle = '#f4eee2'; g.fillRect(0, 0, W, H);
    // océano (al oeste de la costa)
    g.beginPath();
    g.moveTo(0, 0);
    COAST.forEach(([la, lo], i) => { const [x, y] = px(la, lo); if (i === 0) g.lineTo(x, 0); g.lineTo(x, y); });
    g.lineTo(px(...COAST[COAST.length - 1])[0], H); g.lineTo(0, H); g.closePath();
    g.fillStyle = '#cfe0ef'; g.fill();
    g.save(); g.clip();
    g.strokeStyle = 'rgba(47,111,214,0.18)'; g.lineWidth = 2;
    for (let y = 10; y < H; y += 16) { g.beginPath(); for (let x = 0; x < W; x += 12) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 2); g.stroke(); }
    g.restore();
    // costa
    g.strokeStyle = '#1f2430'; g.lineWidth = 3.5; g.beginPath();
    COAST.forEach(([la, lo], i) => { const [x, y] = px(la, lo); i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke();
    // cordillera
    g.strokeStyle = 'rgba(80,60,40,0.55)'; g.lineWidth = 2;
    for (let la = -28.8; la > -38.3; la -= 0.28) {
      const [x, y] = px(la, -70.2 + Math.sin(la * 3) * 0.15);
      g.beginPath(); g.moveTo(x - 14, y + 8); g.lineTo(x, y - 8); g.lineTo(x + 14, y + 8); g.stroke();
    }
    // grilla lat/lon
    g.strokeStyle = 'rgba(31,36,48,0.15)'; g.lineWidth = 1.5; g.fillStyle = 'rgba(31,36,48,0.55)'; g.font = '22px Source Serif 4 Variable, Georgia';
    for (let la = -29; la >= -38; la -= 1) { const [, y] = px(la, LON0); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.fillText(`${-la}° S`, W - 70, y - 4); }
    for (let lo = -76; lo <= -69; lo += 1) { const [x] = px(LAT0, lo); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    g.fillStyle = 'rgba(31,36,48,0.6)'; g.font = 'italic 30px Source Serif 4 Variable, Georgia';
    g.fillText('Océano Pacífico', 40, H * 0.55);
    g.fillText('Argentina', W - 170, H * 0.3);
    // escala 100 km
    const len = (100 * S / MAP_W) * W;
    g.fillStyle = '#1f2430'; g.fillRect(40, H - 50, len, 6); g.font = '24px Source Serif 4 Variable, Georgia'; g.fillText('100 km', 40, H - 60);
    g.font = 'bold 26px Source Serif 4 Variable, Georgia'; g.fillText('N ↑', 40, 50);
  });
}

export default {
  id: 'triangulacion',
  kicker: 'Lección 6 · Pliego 5',
  title: '¿Dónde fue? Localizar el epicentro',
  stamp: 'triangulacion',
  scale: 1,
  left: () => `
    ${h.head('Lección 6 · Triangulación', '¿Dónde fue el sismo?')}
    <p>Una sola estación sabe <b>a qué distancia</b> ocurrió el sismo (por t<sub>S</sub> − t<sub>P</sub>), pero no <b>en qué dirección</b>: el epicentro puede estar en cualquier punto de un círculo con ese radio.</p>
    <p>Con dos estaciones, los círculos se cruzan en dos puntos. Con <b>tres estaciones</b>, sólo queda un punto común: el epicentro. Este método se llama <b>triangulación</b>.</p>
    ${h.key(`<b>Pasos</b><br>1. Lee t<sub>S</sub> − t<sub>P</sub> en cada estación.<br>2. Calcula la distancia: d ≈ 8 km/s × (t<sub>S</sub> − t<sub>P</sub>).<br>3. Traza un círculo de ese radio alrededor de cada estación.<br>4. El epicentro está donde se cruzan los tres.`)}
    ${h.note('En Chile, el Centro Sismológico Nacional (Universidad de Chile) usa cientos de estaciones y computadores, pero la idea es la misma.')}
    ${h.predict('triangulacion', '¿Cuántas estaciones necesitas, como mínimo, para ubicar un epicentro en un mapa?', [
      { t: 'Una basta, si es muy precisa.' },
      { t: 'Dos.' },
      { t: 'Tres.', ok: true },
    ], `<p>Una estación da un círculo; dos dan dos puntos posibles; la tercera decide cuál de los dos es. Para conocer también la <b>profundidad</b> del foco, se necesitan más estaciones.</p>`)}
    ${h.folio(10)}`,
  right: () => `
    <div class="stage-space" style="height:470px"></div>
    ${h.fig('5', 'Mapa de Chile central (costa simplificada). Las estaciones registran el mismo sismo.')}
    ${h.test(`
      <div class="row">${h.btn('new', 'Nuevo sismo', 'hot')} ${h.readout('sp', '')}</div>
      ${STATIONS.map((s, i) => h.slider(`r${i}`, `Radio ${s.name}`, 0, 900, 5, 0, ' km')).join('')}
      ${h.readout('msg', 'Pulsa «Nuevo sismo» y lee los tiempos S − P de cada estación.')}`)}
    ${h.challenge('triangulacion', `<p>Ajusta los tres radios (d = 8 × t<sub>S−P</sub>) y luego <b>toca el mapa</b> donde se cruzan. ${h.btn('help', 'Ayuda')}</p>`)}
    ${h.folio(11)}`,

  mount(ctx) {
    const { root } = ctx;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(MAP_W, MAP_Y, MAP_D), [
      inkMaterial({ tint: '#d8c9a8', tintAmt: 0.5 }), inkMaterial({ tint: '#d8c9a8', tintAmt: 0.5 }),
      new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.9 }),
      inkMaterial({ tint: '#d8c9a8', tintAmt: 0.5 }), inkMaterial({ tint: '#d8c9a8', tintAmt: 0.5 }), inkMaterial({ tint: '#d8c9a8', tintAmt: 0.5 }),
    ]);
    slab.position.set(0, MAP_Y / 2, MAP_Z);
    slab.castShadow = true; slab.receiveShadow = true;
    root.add(slab);
    const top = MAP_Y + 0.001;
    // estaciones: torrecitas
    const circles = [];
    STATIONS.forEach((s, i) => {
      const p = toXZ(s.lat, s.lon);
      const tw = inkMesh(new THREE.ConeGeometry(0.016, 0.07, 3), { tint: '#3d4a6b', tintAmt: 0.5 });
      tw.position.set(p.x, top + 0.035, p.z);
      root.add(tw);
      const l = ctx.label(s.name, new THREE.Vector3(p.x, top + 0.075, p.z), { side: i === 2 ? 'left' : 'right', cls: 'tag', color: '#3d4a6b' });
      l.show(true);
      root.add(l);
      s.label = l;
      const c = penSegments(128, { color: [C.P, C.S, C.L][i], width: 2.6 });
      c.visible = false;
      root.add(c);
      circles.push(c);
    });
    const epi = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.035, 5), glowMaterial(C.hot, 1));
    epi.rotation.x = Math.PI;
    epi.visible = false;
    root.add(epi);
    const guess = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.03, 16), glowMaterial('#1f2430', 1));
    guess.visible = false;
    root.add(guess);
    const lEpi = ctx.label('epicentro real', new THREE.Vector3(), { side: 'right', color: C.hot, cls: 'big' });
    root.add(lEpi); lEpi.show(false);

    let quake = null, helped = false;
    const radius = [0, 0, 0];
    const segBuf = new Float32Array(128 * 6);
    const inMap = (x, z) => Math.abs(x) <= MAP_W / 2 && Math.abs(z - MAP_Z) <= MAP_D / 2;
    function drawCircle(i) {
      const s = STATIONS[i], p = toXZ(s.lat, s.lon), r = radius[i] * S;
      // sólo los tramos que caen dentro del mapa
      for (let a = 0; a < 128; a++) {
        const a0 = (a / 128) * Math.PI * 2, a1 = ((a + 1) / 128) * Math.PI * 2;
        const x0 = p.x + Math.cos(a0) * r, z0 = p.z + Math.sin(a0) * r, x1 = p.x + Math.cos(a1) * r, z1 = p.z + Math.sin(a1) * r;
        if (inMap(x0, z0) && inMap(x1, z1)) segBuf.set([x0, top + 0.002, z0, x1, top + 0.002, z1], a * 6);
        else segBuf.fill(0, a * 6, a * 6 + 6);
      }
      circles[i].userData.write(segBuf);
      circles[i].visible = r > 0;
    }
    STATIONS.forEach((s, i) => ctx.slider(`r${i}`, (v) => { radius[i] = v; drawCircle(i); }));

    function newQuake() {
      const lat = -30.5 - Math.random() * 6;
      const lon = coastLonAt(lat) - 0.15 - Math.random() * 0.9;
      quake = { lat, lon };
      quake.sp = STATIONS.map((s) => Math.round((kmBetween(s, quake) / 8.4) * 2) / 2);
      helped = false;
      epi.visible = guess.visible = false;
      lEpi.show(false);
      STATIONS.forEach((s, i) => { radius[i] = 0; ctx.$(`[data-sl="r${i}"]`).value = 0; ctx.out(`r${i}`, '0 km'); drawCircle(i); s.label.setText(`${s.name} · S−P = ${String(quake.sp[i]).replace('.', ',')} s`); });
      ctx.ro('sp', '');
      ctx.ro('msg', 'Calcula cada radio: <b>d = 8 × (t<sub>S</sub> − t<sub>P</sub>)</b>. Ej.: 30 s → 240 km.');
      ctx.sound.rumble(1.2, 0.35);
    }
    ctx.act('new', newQuake);
    ctx.act('help', () => {
      if (!quake) { ctx.hint('Primero pulsa «Nuevo sismo».'); return; }
      helped = true;
      STATIONS.forEach((s, i) => { radius[i] = Math.round(quake.sp[i] * 8); ctx.$(`[data-sl="r${i}"]`).value = radius[i]; ctx.out(`r${i}`, `${radius[i]} km`); drawCircle(i); });
      ctx.ro('msg', 'Dibujé los círculos con d = 8 × (S − P). ¿Dónde se cruzan? Toca ese punto del mapa.');
    });
    ctx.pick([slab], (hit) => {
      if (!quake) { ctx.hint('Primero pulsa «Nuevo sismo».'); return; }
      const p = root.worldToLocal(hit.point.clone());
      guess.position.set(p.x, top + 0.015, p.z);
      guess.visible = true;
      const lon = LON0 + p.x / (KX * S), lat = LAT0 - (p.z - MAP_Z) / (KZ * S);
      const err = kmBetween({ lat, lon }, quake);
      const tp = toXZ(quake.lat, quake.lon);
      const drawn = radius.every((r) => r > 0);
      if (err < 60 && drawn) {
        epi.position.set(tp.x, top + 0.02, tp.z); epi.visible = true;
        lEpi.position.set(tp.x, top + 0.04, tp.z); lEpi.show(true);
        ctx.sound.answer(true);
        ctx.ro('msg', `<b>¡Lo encontraste!</b> Tu punto quedó a ${Math.round(err)} km del epicentro real (${(-quake.lat).toFixed(1).replace('.', ',')}° S, ${(-quake.lon).toFixed(1).replace('.', ',')}° O), frente a la costa.`);
        ctx.award('triangulacion');
      } else {
        ctx.sound.answer(false);
        ctx.ro('msg', drawn ? `Tu punto está a ~${Math.round(err)} km del epicentro. Busca el lugar donde se cruzan <b>los tres</b> círculos.` : 'Primero ajusta los tres radios (o usa «Ayuda»), luego toca el cruce.');
      }
    });
    return { update() {} };
  },
};
