// Pliego 2 · Ondas P, S, Love y Rayleigh: cómo se mueve cada partícula del medio.
import * as THREE from 'three';
import { h } from '../core/page.js';
import { inkMesh, penSegments, penLine, glowMaterial, arrow, C, setLinePoints } from '../core/ink.js';

const NX = 22, NY = 5, NZ = 3;
const X0 = -0.42, X1 = 0.42, YB = 0.03, YT = 0.25, Z0 = -0.5, Z1 = -0.18;
const A = 0.022, LAMBDA = 0.34, K = (2 * Math.PI) / LAMBDA;
// rapideces relativas en el dibujo (en la corteza: P ≈ 6 km/s, S ≈ 3,5 km/s, Love ≈ 3,2 km/s, Rayleigh ≈ 3 km/s)
const SPEED = { P: 0.26, S: 0.15, L: 0.135, R: 0.125 };
const INFO = {
  P: '<b style="color:var(--P)">Onda P</b> (primaria) · interna · <b>longitudinal</b>: cada partícula va y viene en la misma dirección en que avanza la onda, comprimiendo y estirando el medio. ≈ 6 km/s en la corteza. Viaja en sólidos, líquidos y gases.',
  S: '<b style="color:var(--S)">Onda S</b> (secundaria) · interna · <b>transversal</b>: las partículas se mueven perpendicular al avance. ≈ 3,5 km/s. <b>No viaja en líquidos.</b>',
  L: '<b style="color:var(--L)">Onda Love</b> · superficial · transversal <b>horizontal</b>: sacude el suelo de lado a lado. Se debilita con la profundidad.',
  R: '<b style="color:var(--R)">Onda Rayleigh</b> · superficial · las partículas giran en <b>elipses</b>, como el oleaje. Es la más lenta y se debilita con la profundidad.',
};

function disp(kind, x, y, t, out) {
  const ph = K * x - K * SPEED[kind] * t;
  const depth = YT - y;
  out.set(0, 0, 0);
  if (kind === 'P') out.x = A * 0.9 * Math.sin(ph);
  else if (kind === 'S') out.y = A * Math.sin(ph);
  else if (kind === 'L') out.z = A * 1.1 * Math.sin(ph) * Math.exp(-depth / 0.08);
  else if (kind === 'R') { const d = Math.exp(-depth / 0.09); out.x = -0.6 * A * Math.cos(ph) * d; out.y = A * Math.sin(ph) * d; }
  return out;
}

export default {
  id: 'ondas',
  kicker: 'Lección 5 · Pliego 2',
  title: 'Ondas P, S, Love y Rayleigh',
  stamp: 'ondas',
  left: () => `
    ${h.head('Lección 5 · ¿Cómo se propaga la energía de un sismo?', 'Cuatro maneras de vibrar')}
    <p>La energía que se libera en el área de ruptura viaja como <b>ondas sísmicas</b>. Una onda transporta energía sin transportar materia: cada trozo de roca sólo vibra alrededor de su lugar.</p>
    <table class="tw">
      <tr><th>Onda</th><th>Viaja por</th><th>Cómo vibra el medio</th><th>Llega</th></tr>
      <tr><td><i class="sw" style="background:var(--P)"></i><b>P</b></td><td>el interior</td><td>longitudinal: compresión y estiramiento</td><td>1.ª</td></tr>
      <tr><td><i class="sw" style="background:var(--S)"></i><b>S</b></td><td>el interior (no los líquidos)</td><td>transversal: perpendicular al avance</td><td>2.ª</td></tr>
      <tr><td><i class="sw" style="background:var(--L)"></i><b>Love</b></td><td>la superficie</td><td>de lado a lado, horizontal</td><td>3.ª</td></tr>
      <tr><td><i class="sw" style="background:var(--R)"></i><b>Rayleigh</b></td><td>la superficie</td><td>en elipses, como el oleaje</td><td>4.ª</td></tr>
    </table>
    ${h.note('Las ondas superficiales son las más lentas, pero suelen causar más daño: concentran su energía justo donde están las construcciones.')}
    ${h.predict('ondas', 'Las ondas P y S salen del foco al mismo tiempo. ¿Por qué las P llegan antes?', [
      { t: 'Porque las ondas P son más grandes.' },
      { t: 'Porque la roca resiste más ser comprimida que ser deformada de lado, y “empuja de vuelta” más rápido.', ok: true },
      { t: 'Porque las ondas P salen antes del foco.' },
    ], `<p>La rapidez de una onda depende de qué tan fuerte el medio se opone a la deformación. Las rocas resisten mucho la compresión (onda P) y menos el corte lateral (onda S). Un líquido no resiste el corte: por eso <b>las ondas S no cruzan los líquidos</b>.</p>`)}
    ${h.folio(4)}`,
  right: () => `
    <div class="stage-space"></div>
    ${h.fig('2', 'Un trozo de corteza dibujado como una red de partículas. El punto rojo muestra cómo se mueve <b>una</b> partícula; la flecha negra indica hacia dónde avanza la onda.')}
    ${h.test(`
      <div class="row">${h.btn('P', 'Onda P', 'P on')} ${h.btn('S', 'Onda S', 'S')} ${h.btn('L', 'Love', 'L')} ${h.btn('R', 'Rayleigh', 'R')} ${h.btn('liquid', 'Medio: sólido')} ${h.btn('pause', 'Pausa')}</div>
      ${h.readout('info', INFO.P)}`)}
    ${h.challenge('ondas', `<p><b>¿Quién es quién?</b> Mira una onda sin color y adivina su tipo con los botones de arriba. Acierta 3 seguidas.</p><div class="row">${h.btn('mystery', 'Onda misteriosa')} <span data-ro="streak" class="readout"></span></div>`)}
    ${h.folio(5)}`,

  mount(ctx) {
    const { root } = ctx;
    const g = new THREE.Group();
    root.add(g);
    // nodos de la red en reposo
    const nodes = [];
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) for (let k = 0; k < NZ; k++) {
      nodes.push(new THREE.Vector3(X0 + (X1 - X0) * i / (NX - 1), YB + (YT - YB) * j / (NY - 1), Z0 + (Z1 - Z0) * k / (NZ - 1)));
    }
    const idx = (i, j, k) => (i * NY + j) * NZ + k;
    const pairs = [];
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) for (let k = 0; k < NZ; k++) {
      if (i < NX - 1) pairs.push([idx(i, j, k), idx(i + 1, j, k)]);
      if (j < NY - 1) pairs.push([idx(i, j, k), idx(i, j + 1, k)]);
      if (k < NZ - 1) pairs.push([idx(i, j, k), idx(i, j, k + 1)]);
    }
    const lattice = penSegments(pairs.length, { color: C.P, width: 1.15, opacity: 0.75 });
    g.add(lattice);
    // partículas de la cara frontal (puntos de tinta)
    const front = [];
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) front.push(idx(i, j, NZ - 1));
    const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0055, 10, 8), glowMaterial('#22262f', 1), front.length);
    g.add(dots);
    // base de roca bajo la red
    const base = inkMesh(new THREE.BoxGeometry(X1 - X0 + 0.04, 0.02, Z1 - Z0 + 0.04), { tint: '#8d7a62', tintAmt: 0.3 });
    base.position.set(0, 0.01, (Z0 + Z1) / 2);
    g.add(base);
    // casitas sobre la superficie
    const houses = [6, 12, 17].map((i) => {
      const hs = new THREE.Group();
      const body = inkMesh(new THREE.BoxGeometry(0.04, 0.035, 0.04), { tint: '#e8d9b5', tintAmt: 0.4 });
      body.position.y = 0.0175;
      const roof = inkMesh(new THREE.ConeGeometry(0.036, 0.03, 4), { tint: '#a8432f', tintAmt: 0.6 });
      roof.position.y = 0.05; roof.rotation.y = Math.PI / 4;
      hs.add(body, roof);
      hs.userData.node = idx(i, NY - 1, 1);
      g.add(hs);
      return hs;
    });
    // partícula testigo y su estela
    const TR = idx(11, NY - 1, NZ - 1);
    const tracer = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 12), glowMaterial(C.hot, 1));
    g.add(tracer);
    const trail = penLine([new THREE.Vector3(), new THREE.Vector3(0.001, 0, 0)], { color: C.hot, width: 2 });
    g.add(trail);
    const trailPts = [];
    // flecha de propagación
    const prop = arrow(new THREE.Vector3(-0.3, 0.06, Z1 + 0.1), new THREE.Vector3(0.12, 0.06, Z1 + 0.1), { color: '#22262f', radius: 0.005, head: 0.03 });
    g.add(prop);
    const lProp = ctx.label('la onda avanza', new THREE.Vector3(0.14, 0.06, Z1 + 0.1), { side: 'right', cls: 'nodot' });
    g.add(lProp); lProp.show(true);
    const lType = ctx.label('Onda P', new THREE.Vector3(X0, YT + 0.05, Z1), { side: 'left', cls: 'big', color: C.P });
    g.add(lType); lType.show(true);

    let kind = 'P', paused = false, liquid = false, tt = 0, mystery = null, streak = 0;
    const buttons = ['P', 'S', 'L', 'R'].map((k) => ctx.$(`[data-act="${k}"]`));
    function setKind(k) {
      kind = k;
      buttons.forEach((b) => b.classList.toggle('on', b.dataset.act === k && !mystery));
      const col = mystery ? '#22262f' : C[k];
      lattice.material.color.set(col);
      lType.setText(mystery ? '¿?' : k === 'L' ? 'Onda Love' : k === 'R' ? 'Onda Rayleigh' : `Onda ${k}`);
      lType.element.style.setProperty('--lc', col);
      trailPts.length = 0;
      if (!mystery) ctx.ro('info', liquid && k !== 'P' ? `${INFO[k]}<br><b>En un líquido esta onda no existe:</b> el líquido no resiste el corte, así que no hay nada que “devuelva” a las partículas a su lugar.` : INFO[k]);
    }
    ['P', 'S', 'L', 'R'].forEach((k) => ctx.act(k, () => {
      if (mystery) {
        const ok = k === mystery;
        streak = ok ? streak + 1 : 0;
        ctx.sound.answer(ok);
        ctx.ro('streak', ok ? `✓ ¡Sí, era ${mystery === 'L' ? 'Love' : mystery === 'R' ? 'Rayleigh' : mystery}! Racha: <b>${streak}</b>/3` : `✗ Era ${mystery === 'L' ? 'Love' : mystery === 'R' ? 'Rayleigh' : mystery}. Mira la partícula roja. Racha: 0/3`);
        const was = mystery;
        mystery = null;
        setKind(was);
        if (streak >= 3) ctx.award('ondas');
        return;
      }
      setKind(k);
    }));
    ctx.act('mystery', () => {
      if (liquid) { liquid = false; ctx.$('[data-act=liquid]').textContent = 'Medio: sólido'; }
      const opts = ['P', 'S', 'L', 'R'].filter((k) => k !== kind || Math.random() < 0.25);
      mystery = opts[Math.floor(Math.random() * opts.length)];
      setKind(mystery);
      ctx.ro('info', '¿Qué onda es? Fíjate en cómo se mueve la partícula roja respecto de la flecha. Responde con los botones de arriba.');
      ctx.ro('streak', `Racha: ${streak}/3`);
    });
    ctx.act('liquid', (e, b) => {
      liquid = !liquid;
      b.textContent = liquid ? 'Medio: líquido' : 'Medio: sólido';
      b.classList.toggle('on', liquid);
      setKind(kind);
    });
    ctx.act('pause', (e, b) => { paused = !paused; b.textContent = paused ? 'Seguir' : 'Pausa'; b.classList.toggle('on', paused); });
    setKind('P');

    const seg = new Float32Array(pairs.length * 6);
    const cur = nodes.map((n) => n.clone());
    const d = new THREE.Vector3();
    const m4 = new THREE.Matrix4();
    return {
      update(dt) {
        if (!paused) tt += dt;
        const dead = liquid && kind !== 'P';
        for (let n = 0; n < nodes.length; n++) {
          const p = nodes[n];
          if (dead) d.set(0, 0, 0); else disp(kind, p.x, p.y, tt, d);
          cur[n].copy(p).add(d);
        }
        for (let s = 0; s < pairs.length; s++) {
          const a = cur[pairs[s][0]], b = cur[pairs[s][1]], o = s * 6;
          seg[o] = a.x; seg[o + 1] = a.y; seg[o + 2] = a.z; seg[o + 3] = b.x; seg[o + 4] = b.y; seg[o + 5] = b.z;
        }
        lattice.userData.write(seg);
        lattice.material.opacity = 1;
        front.forEach((n, i) => { m4.makeTranslation(cur[n].x, cur[n].y, cur[n].z); dots.setMatrixAt(i, m4); });
        dots.instanceMatrix.needsUpdate = true;
        tracer.position.copy(cur[TR]).z += 0.004;
        if (!paused) {
          trailPts.push(tracer.position.clone());
          if (trailPts.length > 70) trailPts.shift();
          if (trailPts.length > 2) setLinePoints(trail, trailPts);
        }
        // las casas siguen al suelo y se inclinan con la pendiente
        houses.forEach((hs) => {
          const n = hs.userData.node;
          hs.position.copy(cur[n]);
          const p = nodes[n];
          const e = 0.01;
          const d1 = disp(kind, p.x + e, p.y, tt, new THREE.Vector3()), d0 = disp(kind, p.x - e, p.y, tt, new THREE.Vector3());
          hs.rotation.z = dead ? 0 : Math.atan2(d1.y - d0.y, 2 * e);
          hs.rotation.x = dead ? 0 : -Math.atan2(d1.z - d0.z, 2 * e) * 0.5;
        });
      },
    };
  },
};
