// Pliego 7 · Intensidad (Mercalli modificada): el mismo sismo se siente distinto según distancia, suelo y construcción.
import * as THREE from 'three';
import { h } from '../core/page.js';
import { inkMesh, glowMaterial, penLine, C } from '../core/ink.js';

const DEPTH = 30; // km
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const DESC = (i) => (i <= 1 ? 'sólo instrumentos' : i <= 3 ? 'apenas perceptible' : i <= 5 ? 'se siente claramente' : i <= 7 ? 'muebles se mueven, daños leves' : i <= 9 ? 'daños serios, grietas' : 'destrucción');
const COLORS = ['#7aa7d6', '#7aa7d6', '#7aa7d6', '#8cc084', '#c9c75a', '#f0b44a', '#f08a3a', '#e2443a', '#b8282a', '#8e1d3b', '#6b1340', '#4d0d33', '#3a0a26'];
// estimación didáctica (no una ley oficial): I ≈ 1,45 M − 2,4 log10(R) + 0,5 (+1,2 en suelo blando)
const intensity = (M, dKm, soft) => 1.45 * M - 2.4 * Math.log10(Math.hypot(dKm, DEPTH)) + 0.5 + (soft ? 1.2 : 0);
const SITES = [
  { id: 'A', d: 15, type: 'adobe', name: 'casa de adobe', fail: 7.5 },
  { id: 'B', d: 50, type: 'brick', name: 'casa de albañilería', fail: 8.5 },
  { id: 'C', d: 120, type: 'tower', name: 'edificio de hormigón armado', fail: 9.6 },
  { id: 'D', d: 250, type: 'adobe', name: 'casa de adobe', fail: 7.5 },
];
const xOf = (d) => -0.33 + 0.72 * (Math.log10(d / 8) / Math.log10(300 / 8));

export default {
  id: 'intensidad',
  kicker: 'Lección 6 · Pliego 7',
  title: 'Intensidad: lo que se siente',
  stamp: 'intensidad',
  scale: 0.98,
  left: () => `
    ${h.head('Lección 6 · La intensidad de un sismo', 'Un sismo, muchas intensidades')}
    <p>La <b>intensidad</b> mide los <b>efectos</b> de un sismo en un lugar: lo que sienten las personas y lo que les pasa al terreno y a las construcciones. Se usa la escala de <b>Mercalli modificada</b>, de I a XII, en números romanos.</p>
    <p>Un sismo tiene <b>una</b> magnitud, pero <b>muchas</b> intensidades. La intensidad depende de la <b>distancia</b> al epicentro, la <b>profundidad</b> del foco, el <b>tipo de suelo</b> (los suelos blandos amplifican el movimiento) y la <b>calidad de las construcciones</b>.</p>
    <table class="tw">
      <tr><th>Grado</th><th>Efectos (resumen)</th></tr>
      <tr><td>I</td><td>Sólo lo registran los instrumentos.</td></tr>
      <tr><td>II–III</td><td>Apenas perceptible.</td></tr>
      <tr><td>IV–V</td><td>Se percibe con claridad; objetos livianos se desplazan.</td></tr>
      <tr><td>VI–VII</td><td>Se mueven muebles pesados; construcciones ligeras sufren daños.</td></tr>
      <tr><td>VIII–IX</td><td>Daños serios; grietas en el suelo.</td></tr>
      <tr><td>X–XII</td><td>Destrucción; derrumbes, caen puentes; puede cambiar el paisaje.</td></tr>
    </table>
    ${h.predict('intensidad', 'El mismo sismo llega a cuatro ciudades. ¿Tienen todas la misma intensidad?', [
      { t: 'Sí, porque la magnitud es una sola.' },
      { t: 'No: depende de la distancia, el suelo y las construcciones.', ok: true },
      { t: 'Sólo cambia si hay tsunami.' },
    ], `<p>La magnitud describe la energía en el origen; la intensidad, los efectos en cada lugar. Chile tiene normas de construcción sismorresistente (NCh433) para que los edificios resistan sismos fuertes sin colapsar.</p>`)}
    ${h.folio(14)}`,
  right: () => `
    <div class="stage-space" style="height:470px"></div>
    ${h.fig('7', 'Cuatro lugares a distintas distancias del epicentro (escala de distancias comprimida). Foco a 30 km de profundidad.')}
    ${h.test(`
      ${h.slider('m', 'Magnitud', 5, 9.5, 0.1, 8.0)}
      <div class="row">${h.btn('quake', 'Sismo', 'hot')} <span style="font-size:16px">Suelo blando en:</span> ${SITES.map((s) => h.btn(`soft-${s.id}`, s.id)).join(' ')}</div>
      ${h.readout('msg', 'Elige la magnitud y provoca el sismo.')}`)}
    ${h.challenge('intensidad', '<p>Logra que la casa <b>D</b> (la más lejana) sienta una intensidad <b>mayor</b> que el edificio <b>C</b>. Pista: ¿qué cambia la intensidad además de la distancia?</p>')}
    ${h.folio(15)}`,

  mount(ctx) {
    const { root } = ctx;
    const ZC = -0.32;
    const ground = inkMesh(new THREE.BoxGeometry(0.88, 0.03, 0.3), { tint: '#b9a27f', tintAmt: 0.35 });
    ground.position.set(0, 0.015, ZC);
    root.add(ground);
    // epicentro
    const epi = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.04, 5), glowMaterial(C.hot, 1));
    epi.rotation.x = Math.PI;
    epi.position.set(-0.4, 0.05, ZC);
    root.add(epi);
    const lEpi = ctx.label('epicentro', new THREE.Vector3(-0.4, 0.08, ZC), { side: 'center', cls: 'nodot', color: C.hot });
    lEpi.show(true); root.add(lEpi);
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const pts = [];
      for (let a = 0; a <= 64; a++) pts.push(new THREE.Vector3(Math.cos((a / 64) * Math.PI * 2), 0, Math.sin((a / 64) * Math.PI * 2)));
      const r = penLine(pts, { color: C.hot, width: 2, opacity: 0.8 });
      r.position.set(-0.4, 0.032, ZC);
      r.visible = false;
      root.add(r);
      rings.push(r);
    }

    const sites = SITES.map((s) => {
      const x = xOf(s.d);
      const g = new THREE.Group();
      g.position.set(x, 0.03, ZC);
      root.add(g);
      const soil = inkMesh(new THREE.BoxGeometry(0.11, 0.004, 0.16), { tint: '#d9b26a', tintAmt: 0.75, shade: 0.5 });
      soil.position.y = 0.002;
      soil.visible = false;
      g.add(soil);
      const bld = new THREE.Group();
      g.add(bld);
      if (s.type === 'tower') {
        const t = inkMesh(new THREE.BoxGeometry(0.06, 0.17, 0.06), { tint: '#c9ccd2', tintAmt: 0.45 });
        t.position.y = 0.085;
        bld.add(t);
        for (let f = 1; f < 6; f++) bld.add(penLine([new THREE.Vector3(-0.03, f * 0.028, 0.0305), new THREE.Vector3(0.03, f * 0.028, 0.0305)], { width: 1 }));
      } else {
        const body = inkMesh(new THREE.BoxGeometry(0.07, 0.045, 0.06), { tint: s.type === 'adobe' ? '#d9b98a' : '#c4704f', tintAmt: 0.5 });
        body.position.y = 0.0225;
        const roof = inkMesh(new THREE.ConeGeometry(0.055, 0.035, 4), { tint: '#7a4b35', tintAmt: 0.55 });
        roof.position.y = 0.062; roof.rotation.y = Math.PI / 4; roof.scale.z = 0.8;
        bld.add(body, roof);
      }
      const crack = penLine([new THREE.Vector3(-0.01, 0.04, 0.032), new THREE.Vector3(0.0, 0.025, 0.032), new THREE.Vector3(-0.006, 0.015, 0.032), new THREE.Vector3(0.008, 0.0, 0.032)], { width: 2.2 });
      crack.visible = false;
      bld.add(crack);
      const dist = ctx.label(`${s.id} · ${s.d} km`, new THREE.Vector3(x, 0.035, ZC + 0.13), { side: 'center', cls: 'nodot' });
      dist.show(true); root.add(dist);
      const tag = ctx.label('', new THREE.Vector3(x, s.type === 'tower' ? 0.25 : 0.14, ZC), { side: 'center', cls: 'tag' });
      tag.show(false); root.add(tag);
      return { ...s, g, bld, soil, crack, tag, soft: false, I: 0, amp: 0 };
    });

    let M = 8, t = -1;
    ctx.slider('m', (v) => (M = v));
    sites.forEach((s) => ctx.act(`soft-${s.id}`, (e, b) => {
      s.soft = !s.soft;
      b.classList.toggle('on', s.soft);
      s.soil.visible = s.soft;
    }));
    ctx.act('quake', () => {
      t = 0;
      ctx.sound.rumble(3, Math.min(1, (M - 4) / 5));
      sites.forEach((s) => {
        s.I = intensity(M, s.d, s.soft);
        s.amp = Math.min(0.02, 0.0025 * Math.pow(10, (s.I - 5) / 4.5));
        s.broken = false;
        s.bld.rotation.set(0, 0, 0); s.bld.position.set(0, 0, 0); s.crack.visible = false;
        s.tag.show(false);
      });
    });
    return {
      update(dt, tt) {
        if (t < 0) return;
        t += dt;
        rings.forEach((r, i) => {
          const rr = ((t * 0.35 + i * 0.12) % 0.9);
          r.visible = t < 4;
          r.scale.setScalar(Math.max(0.001, rr));
          r.material.opacity = 0.8 * (1 - rr / 0.9);
        });
        let all = true;
        for (const s of sites) {
          const arrive = (s.d / 250) * 1.6; // la onda llega antes a lo cercano
          const u = t - arrive;
          if (u < 0) { all = false; continue; }
          const env = Math.exp(-u / 1.4) * (1 - Math.exp(-u * 6));
          if (!s.broken) {
            s.bld.position.x = Math.sin(tt * 38 + s.d) * s.amp * env;
            s.bld.rotation.z = Math.sin(tt * 31 + s.d) * s.amp * 4 * env;
            if (s.I >= s.fail && u > 0.6) {
              s.broken = true;
              s.crack.visible = true;
              ctx.sound.answer(false);
            }
          } else {
            // daño: se inclina y se hunde un poco
            s.bld.rotation.z += (0.28 - s.bld.rotation.z) * Math.min(1, dt * 3);
            s.bld.position.y += (-0.008 - s.bld.position.y) * Math.min(1, dt * 3);
          }
          const I = Math.max(1, Math.min(12, Math.round(s.I)));
          if (!s.tag.visible) {
            s.tag.setText(ROMAN[I]);
            s.tag.element.style.setProperty('--lc', COLORS[I]);
            s.tag.show(true);
          }
          if (u < 2.5) all = false;
        }
        if (all && t > 0) {
          t = -1;
          const [, , c, d] = sites;
          const lines = sites.map((s) => { const I = Math.max(1, Math.min(12, Math.round(s.I))); return `<b>${s.id} ${ROMAN[I]}</b> ${DESC(I)}${s.soft ? ' (suelo blando)' : ''}${s.broken ? ', con daños' : ''}`; }).join(' · ');
          ctx.ro('msg', `Magnitud ${M.toFixed(1).replace('.', ',')} → ${lines}`);
          if (d.I > c.I) {
            ctx.ro('msg', `${lines}<br><b>¡Lo lograste!</b> El suelo blando amplifica las ondas: la casa D, aunque está más lejos, sintió más que el edificio C.`);
            ctx.award('intensidad');
          }
        }
      },
    };
  },
};
