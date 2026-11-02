// Pliego 4 · El sismógrafo y el sismograma: la masa se queda quieta, el suelo (y el tambor) se mueven.
import * as THREE from 'three';
import { h } from '../core/page.js';
import { inkMesh, penLine, glowMaterial, C, setLinePoints } from '../core/ink.js';
import { makeQuake, K_SP } from '../physics/seismo.js';

const DR = 0.06; // radio del tambor
const DRUM = new THREE.Vector3(0, 0.1, -0.2);
const TH_C = -0.5; // ángulo donde la pluma toca el tambor (desde +y hacia +z)
const AMP = 0.055; // desplazamiento en el dibujo por unidad de señal
const SIM = 5; // segundos de sismo por segundo real
const fmt = (x, d = 1) => x.toFixed(d).replace('.', ',');

export default {
  id: 'sismografo',
  kicker: 'Lección 6 · Pliego 4',
  title: 'El sismógrafo y el sismograma',
  stamp: 'sismografo',
  scale: 0.95,
  left: () => `
    ${h.head('Lección 6 · ¿De qué manera se registran las ondas sísmicas?', 'Una masa que no quiere moverse')}
    <p>Un <b>sismógrafo</b> tiene una masa pesada colgando de un soporte. Cuando el suelo se mueve, el soporte y el tambor se mueven con él, pero la masa tiende a quedarse quieta por <b>inercia</b>. La pluma unida a la masa dibuja sobre el tambor la diferencia: el <b>sismograma</b>.</p>
    <p>En un sismograma llegan primero las ondas <b style="color:var(--P)">P</b>, luego las <b style="color:var(--S)">S</b> y al final las superficiales, que son las de mayor amplitud. Hoy los sismógrafos guardan la señal en forma digital.</p>
    ${h.key(`<div class="eq">d ≈ 8 km/s × (t<sub>S</sub> − t<sub>P</sub>)</div><small>Mientras más lejos está la estación, más se separan la llegada P y la llegada S. Con rapideces típicas de la corteza (P ≈ 6 km/s, S ≈ 3,5 km/s), cada segundo de diferencia equivale a unos 8 km.</small>`)}
    ${h.note('CeluLab: tu celular tiene un acelerómetro. Con una app gratuita como phyphox puedes ver su “sismograma” al golpear la mesa.')}
    ${h.predict('sismografo', 'Una estación registra las ondas P y casi de inmediato las S. ¿Qué indica eso?', [
      { t: 'Que el sismo fue muy grande.' },
      { t: 'Que la estación está cerca del epicentro.', ok: true },
      { t: 'Que la estación está muy lejos del epicentro.' },
    ], `<p>Las dos ondas salen juntas del foco. Como la P es más rápida, le saca ventaja a la S a medida que avanzan: si casi no hay diferencia, recorrieron poca distancia.</p>`)}
    ${h.folio(8)}`,
  right: () => `
    <div class="stage-space" style="height:470px"></div>
    ${h.fig('4', 'Sismógrafo de tambor. Observa la masa: casi no se mueve, mientras todo lo demás tiembla con el suelo.')}
    ${h.test(`
      ${h.slider('dist', 'Distancia al epicentro', 30, 400, 10, 120, ' km')}
      <div class="row">${h.btn('rec', 'Registrar sismo', 'hot')} ${h.btn('mystery', 'Sismo misterioso')}</div>
      <canvas class="sgram interactive" width="1280" height="240" style="width:100%;height:120px;display:block;border:1.5px solid var(--ink);border-radius:4px;background:#fffdf7"></canvas>
      ${h.readout('msg', 'Elige una distancia y registra un sismo.')}`)}
    ${h.challenge('sismografo', `<p>Registra un <b>sismo misterioso</b>, lee t<sub>S</sub> − t<sub>P</sub> en el sismograma y calcula la distancia.</p>
      <div class="row"><input class="num" type="number" min="0" max="1000" step="1" data-in="d" aria-label="Distancia estimada en km"> km ${h.btn('check', 'Comprobar')}</div>`)}
    ${h.folio(9)}`,

  mount(ctx) {
    const { root } = ctx;
    const frame = new THREE.Group(); // todo lo que se mueve con el suelo
    root.add(frame);
    const base = inkMesh(new THREE.BoxGeometry(0.62, 0.025, 0.4), { tint: '#7d6a55', tintAmt: 0.4 });
    base.position.set(0, 0.0125, -0.3);
    frame.add(base);
    // soportes del tambor
    for (const sx of [-0.25, 0.25]) {
      const s = inkMesh(new THREE.BoxGeometry(0.02, 0.09, 0.05), { tint: '#7d6a55', tintAmt: 0.35 });
      s.position.set(sx, 0.07, DRUM.z);
      frame.add(s);
    }
    const drumGroup = new THREE.Group();
    drumGroup.position.copy(DRUM);
    frame.add(drumGroup);
    const drumRot = new THREE.Group();
    drumGroup.add(drumRot);
    const cyl = new THREE.CylinderGeometry(DR, DR, 0.46, 56, 1);
    cyl.rotateZ(Math.PI / 2);
    const drum = inkMesh(cyl, { tint: '#fffaf0', tintAmt: 0.6, shade: 0.55, angle: 40 });
    drumRot.add(drum);
    // marcas de papel (para ver que gira)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      drumRot.add(penLine([new THREE.Vector3(-0.23, Math.cos(a) * (DR + 0.0006), Math.sin(a) * (DR + 0.0006)), new THREE.Vector3(-0.2, Math.cos(a) * (DR + 0.0006), Math.sin(a) * (DR + 0.0006))], { width: 1, opacity: 0.4 }));
    }
    const axle = inkMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.54, 10).rotateZ(Math.PI / 2), { tint: '#555', tintAmt: 0.5 });
    drumGroup.add(axle);
    // torre y brazo
    const post = inkMesh(new THREE.BoxGeometry(0.035, 0.36, 0.035), { tint: '#7d6a55', tintAmt: 0.35 });
    post.position.set(0, 0.205, -0.46);
    const boom = inkMesh(new THREE.BoxGeometry(0.025, 0.02, 0.15), { tint: '#7d6a55', tintAmt: 0.35 });
    boom.position.set(0, 0.375, -0.4);
    frame.add(post, boom);
    // masa, hilo y pluma: NO se mueven con el suelo
    const MASS = new THREE.Vector3(0, 0.205, -0.335);
    const mass = inkMesh(new THREE.SphereGeometry(0.045, 32, 20), { tint: '#4a4f5c', tintAmt: 0.55 });
    mass.position.copy(MASS);
    root.add(mass);
    const contact = new THREE.Vector3(0, DRUM.y + DR * Math.cos(TH_C), DRUM.z + DR * Math.sin(TH_C));
    const pen = penLine([MASS, contact], { width: 2.4 });
    root.add(pen);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.02, 10), glowMaterial(C.hot, 1));
    tip.position.copy(contact);
    tip.lookAt(MASS);
    tip.rotateX(-Math.PI / 2);
    root.add(tip);
    const wire = penLine([new THREE.Vector3(0, 0.365, -0.335), MASS], { width: 1.2 });
    root.add(wire);
    // traza en el tambor
    const trace = penLine([new THREE.Vector3(), new THREE.Vector3(0.0001, 0, 0)], { color: '#1d2a4a', width: 1.8 });
    drumRot.add(trace);
    const tracePts = [];

    const lab = (t, p, o) => { const l = ctx.label(t, p, o); l.show(true); root.add(l); return l; };
    lab('masa: se queda quieta (inercia)', MASS.clone().add(new THREE.Vector3(0.05, 0.02, 0)), { side: 'right' });
    lab('tambor que gira', new THREE.Vector3(-0.24, DRUM.y + 0.06, DRUM.z + 0.03), { side: 'left' });
    lab('pluma', contact.clone().add(new THREE.Vector3(0.02, 0.0, 0.0)), { side: 'right', color: C.hot });
    lab('base fija al suelo', new THREE.Vector3(0.3, 0.02, -0.12), { side: 'right' });

    // sismograma en papel (canvas de la página)
    const cv = ctx.$('.sgram');
    const g2 = cv.getContext('2d');
    let quake = null, rec = null, mystery = null, finished = false;
    function drawAxes(win) {
      g2.fillStyle = '#fffdf7'; g2.fillRect(0, 0, cv.width, cv.height);
      const W = cv.width, H = cv.height;
      for (let s = 0; s <= win.dur; s += 1) {
        const x = (s / win.dur) * W;
        g2.strokeStyle = s % 5 === 0 ? 'rgba(31,36,48,0.35)' : 'rgba(31,36,48,0.1)';
        g2.lineWidth = s % 5 === 0 ? 2 : 1;
        g2.beginPath(); g2.moveTo(x, 0); g2.lineTo(x, H - 30); g2.stroke();
        if (s % 5 === 0) { g2.fillStyle = 'rgba(31,36,48,0.7)'; g2.font = '22px Source Serif 4 Variable, Georgia'; g2.fillText(`${s} s`, x + 3, H - 6); }
      }
      g2.strokeStyle = 'rgba(31,36,48,0.25)'; g2.lineWidth = 1.5;
      g2.beginPath(); g2.moveTo(0, (H - 30) / 2); g2.lineTo(W, (H - 30) / 2); g2.stroke();
    }
    function plot(win, upTo) {
      const W = cv.width, H = cv.height - 30;
      g2.strokeStyle = '#1d2a4a'; g2.lineWidth = 2.2;
      g2.beginPath();
      const n = Math.floor((upTo / win.dur) * W);
      for (let x = 0; x <= n; x++) {
        const tt = win.t0 + (x / W) * win.dur;
        const y = H / 2 - quake.at(tt) * H * 0.42;
        x === 0 ? g2.moveTo(x, y) : g2.lineTo(x, y);
      }
      g2.stroke();
    }
    function marks(win) {
      const W = cv.width, H = cv.height - 30;
      [['P', quake.tP, '#2f6fd6'], ['S', quake.tS, '#e0602a']].forEach(([n, tt, col]) => {
        const x = ((tt - win.t0) / win.dur) * W;
        g2.strokeStyle = col; g2.lineWidth = 3; g2.setLineDash([8, 6]);
        g2.beginPath(); g2.moveTo(x, 4); g2.lineTo(x, H); g2.stroke(); g2.setLineDash([]);
        g2.fillStyle = col; g2.font = 'bold 28px Source Serif 4 Variable, Georgia'; g2.fillText(n, x + 6, 30);
      });
    }

    function start(d, isMystery) {
      quake = makeQuake(d, { seed: Math.floor(Math.random() * 1e6) });
      const t0 = Math.max(0, quake.tP - 4);
      const win = { t0, dur: Math.ceil(quake.tSurf + 20 - t0) };
      rec = { t: 0, win };
      finished = false;
      tracePts.length = 0;
      drumRot.rotation.x = 0;
      drawAxes(win);
      ctx.sound.rumble(Math.min(4, win.dur / SIM), 0.5);
      ctx.ro('msg', isMystery ? 'Registrando un sismo de distancia desconocida…' : `Registrando un sismo a <b>${d} km</b>…`);
    }
    const slider = ctx.slider('dist', () => {});
    ctx.act('rec', () => { mystery = null; start(+slider.value, false); });
    ctx.act('mystery', () => { mystery = Math.round(60 + Math.random() * 300); start(mystery, true); });
    ctx.act('check', () => {
      const v = parseFloat(ctx.$('[data-in=d]').value);
      if (!mystery || !finished) { ctx.hint('Primero registra un sismo misterioso completo.'); return; }
      if (!Number.isFinite(v)) { ctx.hint('Escribe tu distancia en km.'); return; }
      const err = Math.abs(v - mystery) / mystery;
      const sp = quake.tS - quake.tP;
      if (err <= 0.15) {
        ctx.sound.answer(true);
        ctx.ro('msg', `<b>¡Bien!</b> El sismo estaba a <b>${mystery} km</b>. t<sub>S</sub> − t<sub>P</sub> = ${fmt(sp)} s → 8 × ${fmt(sp)} ≈ ${Math.round(8 * sp)} km.`);
        marks(rec.win);
        ctx.award('sismografo');
      } else {
        ctx.sound.answer(false);
        ctx.ro('msg', `Aún no: tu valor difiere ${Math.round(err * 100)} %. Busca dónde empieza la primera vibración (P) y dónde aumenta claramente la amplitud (S), cuenta los segundos y multiplica por 8.`);
      }
    });
    drawAxes({ t0: 0, dur: 60 });

    return {
      update(dt) {
        if (!rec) return;
        const { win } = rec;
        if (!finished) {
          rec.t = Math.min(win.dur, rec.t + dt * SIM);
          const tt = win.t0 + rec.t;
          const gnd = quake.at(tt);
          frame.position.x = gnd * AMP;
          // la pluma marca en el ángulo de contacto; el tambor gira 0,9 vueltas durante el registro
          const phi = (rec.t / win.dur) * Math.PI * 2 * 0.9;
          drumRot.rotation.x = phi;
          const th = TH_C - phi;
          tracePts.push(new THREE.Vector3(-gnd * AMP, Math.cos(th) * (DR + 0.0012), Math.sin(th) * (DR + 0.0012)));
          if (tracePts.length > 1) setLinePoints(trace, tracePts);
          // el hilo se inclina: su extremo superior se mueve con el brazo
          setLinePoints(wire, [new THREE.Vector3(frame.position.x, 0.365, -0.335), MASS]);
          drawAxes(win); plot(win, rec.t);
          if (rec.t >= win.dur) {
            finished = true;
            frame.position.x = 0;
            setLinePoints(wire, [new THREE.Vector3(0, 0.365, -0.335), MASS]);
            if (!mystery) {
              marks(win);
              ctx.ro('msg', `Listo. P llegó a los ${fmt(quake.tP)} s y S a los ${fmt(quake.tS)} s después del sismo: diferencia <b>${fmt(quake.tS - quake.tP)} s</b> → d ≈ 8 × ${fmt(quake.tS - quake.tP)} ≈ <b>${Math.round(8 * (quake.tS - quake.tP))} km</b>.`);
            } else ctx.ro('msg', 'Sismograma listo. Lee t<sub>S</sub> − t<sub>P</sub> con la cuadrícula (cada línea es 1 s) y escribe tu distancia.');
          }
        }
      },
    };
  },
};
export { K_SP };
