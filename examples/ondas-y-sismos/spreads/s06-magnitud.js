// Pliego 6 · Magnitud: la energía liberada crece unas 32 veces por cada grado.
import * as THREE from 'three';
import { h } from '../core/page.js';
import { inkMesh, C } from '../core/ink.js';

const energyJ = (M) => Math.pow(10, 1.5 * M + 4.8); // relación de Gutenberg–Richter para la energía radiada
const MAXSIDE = 0.3;
const fmtE = (e) => {
  const ex = Math.floor(Math.log10(e)), m = e / Math.pow(10, ex);
  return `${m.toFixed(1).replace('.', ',')} × 10<sup>${ex}</sup> J`;
};
const fmtN = (x) => (x >= 100 ? Math.round(x).toLocaleString('es-CL') : x.toFixed(x >= 10 ? 0 : 1).replace('.', ','));
const PRESETS = [
  ['Valdivia 1960', 9.5], ['Maule 2010', 8.8], ['Illapel 2015', 8.3], ['Iquique 2014', 8.2], ['Sismo que apenas se siente', 4.0],
];

export default {
  id: 'magnitud',
  kicker: 'Lección 6 · Pliego 6',
  title: 'Magnitud: la energía liberada',
  stamp: 'magnitud',
  scale: 1,
  left: () => `
    ${h.head('Lección 6 · ¿Cómo se mide un sismo?', 'Magnitud: cuánta energía se liberó')}
    <p>La <b>magnitud</b> mide la energía que libera el sismo en su origen: es un solo número por sismo. Hoy se usa la escala de <b>magnitud de momento (M<sub>w</sub>)</b>, porque la antigua escala de Richter (M<sub>L</sub>) “se satura” en los sismos muy grandes.</p>
    <p>Las escalas de magnitud son <b>logarítmicas</b>: cada grado más significa unas <b>32 veces más energía</b> (y 10 veces más amplitud en el sismograma).</p>
    ${h.key(`<div class="eq">+1 grado → ×32 energía &nbsp;·&nbsp; +2 grados → ×1000</div><small>32 × 32 ≈ 1000. Por eso un sismo 8 no es “el doble” de uno 4: libera ¡un millón de veces más energía!</small>`)}
    <table class="tw">
      <tr><th>Sismo</th><th>M<sub>w</sub></th><th>Nota</th></tr>
      <tr><td>Valdivia 1960</td><td>9,5</td><td>el mayor registrado en la historia</td></tr>
      <tr><td>Alaska 1964</td><td>9,2</td><td></td></tr>
      <tr><td>Tōhoku, Japón 2011</td><td>9,0</td><td>gran tsunami</td></tr>
      <tr><td>Maule, Chile 2010</td><td>8,8</td><td>el más devastador en Chile desde 1960</td></tr>
    </table>
    ${h.predict('magnitud', 'Un sismo de magnitud 8, comparado con uno de magnitud 6, libera…', [
      { t: 'el doble de energía.' },
      { t: 'unas 100 veces más energía.' },
      { t: 'unas 1000 veces más energía.', ok: true },
    ], `<p>Son 2 grados: 32 × 32 ≈ 1000. Si confundes energía con amplitud del sismograma, dirías 100 (10 × 10): la amplitud crece 10 veces por grado; la energía, ~32.</p>`)}
    ${h.folio(12)}`,
  right: () => `
    <div class="stage-space" style="height:470px"></div>
    ${h.fig('6', 'Cada cubo representa la energía de un sismo: su <b>volumen</b> es proporcional a la energía.')}
    ${h.test(`
      ${h.slider('ma', 'Sismo A', 4, 9.5, 0.1, 9.5)}
      ${h.slider('mb', 'Sismo B', 4, 9.5, 0.1, 8.8)}
      <div class="row">${PRESETS.map(([n, m], i) => `<button class="b" data-preset="${i}" style="font-size:14.5px;padding:4px 10px">${n} (${String(m).replace('.', ',')})</button>`).join('')}</div>
      ${h.readout('ratio', '')}`)}
    ${h.challenge('magnitud', `<p>¿Cuántas veces más energía liberó Valdivia 1960 (9,5) que Maule 2010 (8,8)?</p><div class="row">${h.btn('q-2', 'Unas 2 veces')} ${h.btn('q-11', 'Unas 11 veces')} ${h.btn('q-100', 'Unas 100 veces')}</div>`)}
    ${h.folio(13)}`,

  mount(ctx) {
    const { root } = ctx;
    const mk = (x, tint) => {
      const g = new THREE.Group();
      g.position.set(x, 0, -0.33);
      const cube = inkMesh(new THREE.BoxGeometry(1, 1, 1), { tint, tintAmt: 0.55, glow: 0.05 });
      g.add(cube);
      root.add(g);
      const lbl = ctx.label('', new THREE.Vector3(x, 0, -0.33), { side: 'center', cls: 'tag', color: '#1f2430' });
      lbl.show(true);
      root.add(lbl);
      return { g, cube, lbl, side: 0, target: 0 };
    };
    const A = mk(-0.19, C.energy), B = mk(0.2, '#e2443a');
    let ma = 9.5, mb = 8.8;
    function sync() {
      const mx = Math.max(ma, mb);
      // lado ∝ energía^(1/3) = 10^(0.5·M)
      A.target = MAXSIDE * Math.pow(10, 0.5 * (ma - mx));
      B.target = MAXSIDE * Math.pow(10, 0.5 * (mb - mx));
      A.lbl.setText(`M ${ma.toFixed(1).replace('.', ',')}`);
      B.lbl.setText(`M ${mb.toFixed(1).replace('.', ',')}`);
      const big = ma >= mb ? ['A', ma, mb] : ['B', mb, ma];
      const r = energyJ(big[1]) / energyJ(big[2]);
      ctx.ro('ratio', `A: ${fmtE(energyJ(ma))} · B: ${fmtE(energyJ(mb))}<br>El sismo ${big[0]} liberó <b>${fmtN(r)} veces</b> más energía (diferencia de ${(big[1] - big[2]).toFixed(1).replace('.', ',')} grados).`);
    }
    const sa = ctx.slider('ma', (v) => { ma = v; sync(); });
    const sb = ctx.slider('mb', (v) => { mb = v; sync(); });
    let which = 0;
    ctx.$$('[data-preset]').forEach((b) => b.addEventListener('click', () => {
      const [n, m] = PRESETS[+b.dataset.preset];
      ctx.sound.click();
      if (which === 0) { ma = m; sa.value = m; ctx.out('ma', String(m).replace('.', ',')); } else { mb = m; sb.value = m; ctx.out('mb', String(m).replace('.', ',')); }
      ctx.hint(`${n} → sismo ${which === 0 ? 'A' : 'B'}`, 1600);
      which = 1 - which;
      sync();
    }));
    const ans = (ok, t) => { ctx.sound.answer(ok); ctx.ro('ratio', t); if (ok) ctx.award('magnitud'); };
    ctx.act('q-2', () => ans(false, 'Recuerda que la escala no es lineal: 0,7 grados ya multiplica la energía varias veces. Prueba poniendo 9,5 y 8,8 en los cubos.'));
    ctx.act('q-100', () => ans(false, '100 veces correspondería a ~1,3 grados de diferencia. Aquí son 0,7 grados.'));
    ctx.act('q-11', () => ans(true, '<b>¡Correcto!</b> 10<sup>1,5 × 0,7</sup> ≈ 11. Valdivia liberó unas 11 veces más energía que el terremoto del Maule.'));
    sync();
    return {
      update(dt, t) {
        for (const c of [A, B]) {
          c.side += (c.target - c.side) * Math.min(1, dt * 6);
          const s = Math.max(0.0015, c.side);
          c.cube.scale.setScalar(s);
          c.cube.position.y = s / 2;
          c.lbl.position.y = s + 0.035;
          c.cube.userData.mesh.material.uniforms.uGlow.value = 0.05 + 0.04 * Math.sin(t * 3);
        }
      },
    };
  },
};
