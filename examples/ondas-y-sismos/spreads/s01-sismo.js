// Pliego 1 · ¿Qué es un sismo? Tensión elástica entre placas, ruptura, hipocentro y epicentro.
import * as THREE from 'three';
import { h } from '../core/page.js';
import { inkMesh, inkMaterial, penLine, penSegments, glowMaterial, arrow, C, clamp01, setLinePoints } from '../core/ink.js';

const D = 0.42; // profundidad del bloque (eje z)
const ZC = -0.3; // centro del bloque sobre la página
const FRONT = D / 2 + 0.002;
// traza de la falla en el corte: desde la fosa hasta el borde derecho
const F0 = new THREE.Vector2(-0.1, 0.24), F1 = new THREE.Vector2(0.38, 0.04);
const HYPO_S = 0.45; // dónde empieza la ruptura (fracción de la falla)
const HYPO = F0.clone().lerp(F1, HYPO_S);
const TOP_Y = 0.3;

function prism(points, opts) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -D / 2);
  return inkMesh(g, opts);
}

function helixPoints(a, b, turns, radius, n = 160) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  dir.normalize();
  const side = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
  const up = new THREE.Vector3(0, 0, 1);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, th = u * turns * Math.PI * 2;
    const r = radius * Math.min(1, Math.min(u, 1 - u) * 12);
    pts.push(a.clone().addScaledVector(dir, u * len).addScaledVector(side, Math.cos(th) * r).addScaledVector(up, Math.sin(th) * r));
  }
  return pts;
}

export default {
  id: 'sismo',
  kicker: 'Lección 5 · Pliego 1',
  title: '¿Qué es un sismo?',
  stamp: 'sismo',
  scale: 0.92,
  left: () => `
    ${h.head('Lección 5 · Los sismos y el interior de la Tierra', '¿Qué es un sismo?')}
    <p>Un <b>sismo</b> es una vibración de la corteza terrestre. En Chile, la mayoría nace donde la <b>placa de Nazca</b> se mete bajo la <b>placa Sudamericana</b>, a unos 6 a 7 cm por año.</p>
    <p>Las placas no se deslizan suavemente: quedan trabadas. Las rocas se deforman como un elástico que se estira y acumulan <b>energía elástica</b>. Cuando la tensión supera la resistencia de la roca, la zona se rompe de golpe: esa es el <b>área de ruptura</b>.</p>
    ${h.key(`<p style="margin:0">El <b>hipocentro</b> o foco es el punto donde comienza la ruptura, bajo la superficie. El <b>epicentro</b> es el punto de la superficie justo encima del foco: su proyección vertical.</p>
      <div class="eq" style="font-size:22px">energía elástica → energía de las ondas sísmicas (+ calor y sonido)</div>`)}
    ${h.predict('sismo', 'Las placas se empujan durante siglos sin moverse. ¿Qué pasa con la energía mientras tanto?', [
      { t: 'Se pierde poco a poco como calor.' },
      { t: 'Se acumula como energía elástica en las rocas.', ok: true },
      { t: 'No hay energía hasta el momento del sismo.' },
    ], `<p>Como un elástico que retuerces (la actividad de la página 60 del texto), la roca guarda la energía mientras se deforma. En la ruptura, esa energía se libera en segundos y viaja en forma de <b>ondas sísmicas</b>.</p>`)}
    ${h.folio(2)}`,
  right: () => `
    <div class="stage-space"></div>
    ${h.fig('1', 'Corte de la zona de subducción frente a Chile (sin escala). El resorte es un <b>modelo</b> de la energía elástica guardada en las rocas.')}
    ${h.test(`
      <p>Mantén presionado <b>Acumular tensión</b> y luego libera la energía.</p>
      <div class="row">${h.btn('charge', 'Acumular tensión')} ${h.btn('release', '¡Liberar!', 'hot')} ${h.btn('reset', 'Reiniciar')}</div>
      <div class="row" style="gap:10px"><span style="font-size:16px">Energía elástica</span><div class="meter" style="flex:1"><i></i></div></div>
      ${h.readout('msg', 'Las placas convergen y la roca empieza a deformarse…')}`)}
    ${h.challenge('sismo', '<p>Después del sismo, <b>toca en la superficie el epicentro</b>: el punto justo encima del hipocentro.</p>')}
    ${h.folio(3)}`,

  mount(ctx) {
    const { root } = ctx;
    // el bloque se inclina hacia atrás sobre una cuña, como una tarjeta desplegable, para mostrar el corte
    const TILT = -0.42;
    const pivot = new THREE.Group();
    pivot.position.z = ZC - D / 2 - 0.05;
    pivot.rotation.x = TILT;
    root.add(pivot);
    const g = new THREE.Group();
    g.position.z = D / 2;
    pivot.add(g);
    {
      const zf = D * Math.cos(TILT), yf = -D * Math.sin(TILT);
      const sh = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(zf, 0), new THREE.Vector2(zf, yf)]);
      const wg = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false });
      wg.rotateY(-Math.PI / 2);
      wg.translate(0.3, 0, 0);
      const wedge = inkMesh(wg, { tint: '#d8c9a8', tintAmt: 0.35 });
      wedge.position.z = ZC - D / 2 - 0.05;
      root.add(wedge);
    }

    // placas y océano
    const oceanic = prism([[-0.38, 0], [0.38, 0], [0.38, 0.04], [F0.x, F0.y], [-0.38, 0.24]], { tint: '#6f86a6', tintAmt: 0.32 });
    const contPts = [[F0.x, F0.y], [F1.x, F1.y], [0.38, TOP_Y], [0.0, TOP_Y], [-0.05, 0.285]];
    const continental = prism(contPts, { tint: '#c4925e', tintAmt: 0.3 });
    const water = prism([[-0.38, 0.24], [F0.x, F0.y], [-0.05, 0.283], [-0.38, 0.283]], { tint: C.water, tintAmt: 0.55, opacity: 0.55, shade: 0.4, castShadow: false });
    const contWrap = new THREE.Group();
    contWrap.add(continental);
    g.add(oceanic, contWrap, water);
    // Andes
    [[0.16, 0.06, 0.05, 0.05], [0.24, 0.09, 0.06, -0.08], [0.31, 0.07, 0.05, 0.1], [0.2, 0.05, 0.04, 0.13], [0.29, 0.06, 0.045, -0.15]].forEach(([x, hgt, r, z]) => {
      const m = inkMesh(new THREE.ConeGeometry(r, hgt, 18), { tint: '#9c7a55', tintAmt: 0.25 });
      m.position.set(x, TOP_Y + hgt / 2, z);
      contWrap.add(m);
    });

    // flecha de convergencia (Nazca → este)
    const push = arrow(new THREE.Vector3(-0.34, 0.12, FRONT + 0.01), new THREE.Vector3(-0.2, 0.12, FRONT + 0.01), { color: '#3b4f72', radius: 0.006, head: 0.03 });
    g.add(push);

    // resorte = modelo de la energía elástica
    const A = new THREE.Vector3(-0.2, 0.13, FRONT + 0.03), B = new THREE.Vector3(0.24, 0.2, FRONT + 0.03);
    const spring = penLine(helixPoints(A, B, 9, 0.022), { color: C.energy, width: 3 });
    g.add(spring);
    const springEnd = (tau) => A.clone().lerp(B, 0.42 * tau); // el extremo oceánico avanza al comprimir

    // ruptura: segmento de falla, hipocentro, ondas, epicentro
    const faultLine = penLine([new THREE.Vector3(F0.x, F0.y, FRONT), new THREE.Vector3(F1.x, F1.y, FRONT)], { color: '#22262f', width: 2.2, dashed: true, dashSize: 0.012, gapSize: 0.008 });
    g.add(faultLine);
    const rup0 = F0.clone().lerp(F1, 0.22), rup1 = F0.clone().lerp(F1, 0.72);
    const rupture = penLine([new THREE.Vector3(rup0.x, rup0.y, FRONT + 0.002), new THREE.Vector3(rup1.x, rup1.y, FRONT + 0.002)], { color: C.hot, width: 6 });
    rupture.visible = false;
    g.add(rupture);
    const hypo = new THREE.Mesh(new THREE.SphereGeometry(0.013, 20, 14), glowMaterial(C.hot, 1));
    hypo.position.set(HYPO.x, HYPO.y, FRONT + 0.004);
    hypo.visible = false;
    g.add(hypo);
    const RINGS = 3, SEG = 96;
    const waveSets = { P: penSegments(RINGS * SEG, { color: C.P, width: 2.4 }), S: penSegments(RINGS * SEG, { color: C.S, width: 2.4 }) };
    const waves = new THREE.Group();
    waves.add(waveSets.P, waveSets.S);
    waves.visible = false;
    g.add(waves);
    const epi = new THREE.Group();
    const epiStar = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.04, 5), glowMaterial(C.hot, 1));
    epiStar.rotation.x = Math.PI;
    epiStar.position.y = 0.02;
    epi.add(epiStar);
    epi.position.set(HYPO.x, TOP_Y, FRONT - 0.02);
    epi.visible = false;
    g.add(epi);
    const plumb = penLine([new THREE.Vector3(HYPO.x, HYPO.y, FRONT + 0.004), new THREE.Vector3(HYPO.x, TOP_Y, FRONT + 0.004)], { color: C.hot, width: 1.8, dashed: true, dashSize: 0.01, gapSize: 0.007 });
    plumb.visible = false;
    g.add(plumb);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 10), glowMaterial('#22262f', 1));
    pin.visible = false;
    g.add(pin);

    // rótulos
    const L = (text, pos, o) => { const l = ctx.label(text, o); l.position.copy(pos); g.add(l); return l; };
    const lNazca = L('Placa de Nazca', new THREE.Vector3(-0.3, 0.05, FRONT), { side: 'left' });
    const lSud = L('Placa Sudamericana', new THREE.Vector3(0.24, 0.24, FRONT), { side: 'center', cls: 'nodot' });
    const lOcean = L('Océano Pacífico', new THREE.Vector3(-0.3, 0.285, -0.05), { side: 'left', cls: 'nodot' });
    const lFosa = L('fosa', new THREE.Vector3(F0.x, F0.y, FRONT), { side: 'left' });
    const lHypo = L('Hipocentro (foco)', hypo.position.clone().add(new THREE.Vector3(-0.01, -0.03, 0)), { side: 'left', color: C.hot, cls: 'big' });
    const lRup = L('Área de ruptura', new THREE.Vector3(rup1.x, rup1.y - 0.01, FRONT), { side: 'right', color: C.hot });
    const lEpi = L('Epicentro', epi.position.clone().add(new THREE.Vector3(0, 0.05, 0)), { side: 'right', color: C.hot, cls: 'big' });
    const lSpring = L('energía elástica', A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, 0.05, 0)), { side: 'center', cls: 'nodot', color: '#b8641a' });
    [lNazca, lSud, lOcean, lFosa, lSpring].forEach((l) => l.show(true));
    [lHypo, lRup, lEpi].forEach((l) => l.show(false));

    // estado
    let tau = 0, charging = false, phase = 'charge', tQuake = 0, shake = 0;
    const meter = ctx.$('.meter i');
    const msg = (t) => ctx.ro('msg', t);
    const btnCharge = ctx.$('[data-act=charge]');
    const startCharge = (e) => { e.preventDefault(); if (phase === 'charge') { charging = true; ctx.sound.click(); } };
    const stopCharge = () => (charging = false);
    btnCharge.addEventListener('pointerdown', startCharge);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btnCharge.addEventListener(ev, stopCharge));
    btnCharge.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && phase === 'charge') { tau = clamp01(tau + 0.15); e.preventDefault(); } });

    function release() {
      if (phase !== 'charge') return;
      if (tau < 0.35) { msg('Todavía hay poca energía acumulada: la roca resiste. Sigue acumulando tensión.'); return; }
      phase = 'quake';
      tQuake = 0;
      shake = tau;
      ctx.sound.rumble(2.4, 0.4 + tau * 0.6);
      rupture.visible = hypo.visible = waves.visible = true;
      lHypo.show(true); lRup.show(true); lSpring.show(false); lFosa.show(false);
      msg('<b>¡Ruptura!</b> La energía se libera desde el hipocentro y viaja en todas direcciones como ondas sísmicas: las <span style="color:var(--P)">P</span> van adelante y las <span style="color:var(--S)">S</span> detrás.');
    }
    function reset() {
      phase = 'charge'; tau = 0; tQuake = 0; shake = 0;
      [rupture, hypo, waves, epi, plumb, pin].forEach((o) => (o.visible = false));
      [lHypo, lRup, lEpi].forEach((l) => l.show(false));
      lSpring.show(true); lFosa.show(true);
      contWrap.position.set(0, 0, 0);
      msg('Las placas convergen y la roca empieza a deformarse…');
    }
    ctx.act('release', release);
    ctx.act('reset', reset);

    // tocar el epicentro
    const surfaces = [continental.userData.mesh, water.userData.mesh, oceanic.userData.mesh];
    ctx.pick(surfaces, (hit) => {
      if (phase !== 'found' && phase !== 'quake' && phase !== 'after') { ctx.hint('Primero provoca el sismo: acumula tensión y libérala.'); return; }
      if (phase === 'found') return;
      const p = g.worldToLocal(hit.point.clone());
      pin.position.copy(p);
      pin.visible = true;
      const onTop = p.y > 0.23;
      if (onTop && Math.abs(p.x - HYPO.x) < 0.045) {
        phase = 'found';
        epi.visible = plumb.visible = true;
        pin.visible = false;
        lEpi.show(true);
        msg('<b>¡Exacto!</b> El epicentro está en la superficie, justo sobre el hipocentro. Por eso allí se siente con más fuerza.');
        ctx.sound.answer(true);
        ctx.award('sismo');
      } else {
        ctx.sound.answer(false);
        msg(onTop ? 'Ese punto no está justo encima del foco. Busca la vertical que sube desde el hipocentro.' : 'El epicentro está <b>en la superficie</b>, no en el interior.');
      }
    });

    const segs = new Float32Array(RINGS * SEG * 6);
    const SPEED = { P: 0.3, S: 0.17 };
    return {
      update(dt, t) {
        if (phase === 'charge') {
          if (charging) tau = clamp01(tau + dt * 0.45);
          if (tau >= 1 && charging) { charging = false; msg('La roca está al límite: ¡libérala!'); }
        } else if (tau > 0) {
          tau = Math.max(0, tau - dt * 3);
        }
        meter.style.width = `${(tau * 100).toFixed(0)}%`;
        // resorte comprimido y más brillante con la tensión
        setLinePoints(spring, helixPoints(springEnd(tau), B, 9, 0.022 * (1 + tau * 0.25)));
        spring.material.color.set(C.energy).lerp(new THREE.Color(C.hot), tau);
        spring.material.linewidth = 2.4 + tau * 2.5;
        push.position.x = -0.34 + 0.03 * Math.sin(t * 1.5);

        if (phase === 'quake' || phase === 'after' || phase === 'found') {
          tQuake += dt;
          // la placa continental salta hacia arriba por la falla y vuelve parcialmente
          const j = Math.min(1, tQuake * 8);
          const back = Math.exp(-tQuake * 2);
          const dir = new THREE.Vector2().subVectors(F0, F1).normalize();
          contWrap.position.set(dir.x * 0.012 * j * (0.4 + 0.6 * back), dir.y * 0.012 * j * (0.4 + 0.6 * back), 0);
          shake *= Math.exp(-dt * 1.6);
          g.position.x = Math.sin(t * 61) * 0.004 * shake;
          g.position.y = Math.sin(t * 47) * 0.002 * shake;
          hypo.scale.setScalar(1 + 0.3 * Math.sin(t * 9));
          // frentes de onda en el corte, recortados al bloque
          ['P', 'S'].forEach((kind, w) => {
            let k = 0;
            for (let r = 0; r < RINGS; r++) {
              const rad = ((tQuake * SPEED[kind] + r * 0.09) % 0.6);
              for (let i = 0; i < SEG; i++) {
                const a0 = (i / SEG) * Math.PI * 2, a1 = ((i + 1) / SEG) * Math.PI * 2;
                const x0 = HYPO.x + Math.cos(a0) * rad, y0 = HYPO.y + Math.sin(a0) * rad;
                const x1 = HYPO.x + Math.cos(a1) * rad, y1 = HYPO.y + Math.sin(a1) * rad;
                const inside = (x, y) => x > -0.38 && x < 0.38 && y > 0.002 && y < (x < -0.05 ? 0.283 : TOP_Y);
                const o = k * 6;
                if (inside(x0, y0) && inside(x1, y1) && tQuake < 4.5) {
                  segs[o] = x0; segs[o + 1] = y0; segs[o + 2] = FRONT + 0.003 + w * 0.001;
                  segs[o + 3] = x1; segs[o + 4] = y1; segs[o + 5] = FRONT + 0.003 + w * 0.001;
                } else segs.fill(0, o, o + 6);
                k++;
              }
            }
            waveSets[kind].userData.write(segs);
          });
          if (tQuake > 4.5 && phase === 'quake') {
            phase = 'after';
            msg('Ahora encuentra el <b>epicentro</b>: tócalo en la superficie del dibujo.');
          }
        }
      },
      dispose() {},
    };
  },
};
