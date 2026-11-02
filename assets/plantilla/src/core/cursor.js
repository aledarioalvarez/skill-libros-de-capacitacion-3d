// Cursor guía: acompaña la narración y "hace" lo que la voz invita a hacer, sin disparar la acción real.
// Llega al botón justo cuando la voz lo nombra (tiempos medidos en narracion/cues.json).
import cuesData from '../../narracion/cues.json';
import { isReduced } from './tween.js';

const TRAVEL = 0.9; // s de viaje hasta el botón
const ACT = { click: 0.7, press: 1.6, drag: 1.4, 'drag-left': 1.4, point: 1.6 };

const el = document.createElement('div');
el.className = 'guide';
el.setAttribute('aria-hidden', 'true');
el.innerHTML = `
  <div class="g-shadow"></div>
  <svg class="g-arrow" viewBox="0 0 40 52" width="40" height="52">
    <defs>
      <linearGradient id="gFace" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#f1ece2"/><stop offset="1" stop-color="#cfc6b6"/></linearGradient>
      <linearGradient id="gEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f4c"/><stop offset="1" stop-color="#14171d"/></linearGradient>
    </defs>
    <path d="M5 4 L5 41 L14 32.5 L20.5 47 L27 44 L20.5 30 L33 30 Z" fill="#7f7768" transform="translate(2.2 2.2)"/>
    <path d="M5 4 L5 41 L14 32.5 L20.5 47 L27 44 L20.5 30 L33 30 Z" fill="url(#gFace)" stroke="url(#gEdge)" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M8 10 L8 33" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
  </svg>
  <div class="g-ring"></div>`;
document.body.appendChild(el);

const pos = { x: -100, y: -100 };
let shown = false;
let id = null, i = 0, phase = 'idle', from = null, moveStart = 0, actStart = 0, target = null, lastT = 0;

function place(x, y) {
  pos.x = x; pos.y = y;
  el.style.transform = `translate(${x}px, ${y}px)`;
}
function show(v) {
  if (shown === v) return;
  shown = v;
  el.classList.toggle('on', v);
}
function aim(t, accion, progress = 0) {
  const r = t.getBoundingClientRect();
  if (!r.width) return null;
  if (t.type === 'range') {
    const min = +t.min, max = +t.max, v = +t.value;
    const u = (v - min) / (max - min);
    const du = accion === 'drag-left' ? -0.3 : 0.25;
    const x = r.left + r.width * Math.min(0.97, Math.max(0.03, u + du * progress));
    return { x, y: r.top + r.height / 2 };
  }
  return { x: r.left + Math.min(r.width * 0.5, 60), y: r.top + r.height * 0.55 };
}
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

function ripple() {
  const rp = document.createElement('div');
  rp.className = 'g-ripple';
  rp.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  document.body.appendChild(rp);
  setTimeout(() => rp.remove(), 700);
}

export const guide = {
  start(newId) { id = newId; i = 0; phase = 'idle'; target?.classList.remove('sim-press'); target = null; },
  stop() { show(false); target?.classList.remove('sim-press'); target = null; id = null; },
  /** t = segundo actual del audio de la narración `id`. */
  update(t, ended) {
    if (!id) return;
    const cues = cuesData[id] || [];
    lastT = t;
    if (i >= cues.length) {
      if (shown && (ended || t > (cues.at(-1)?.t1 ?? 0) + 2.5)) show(false);
      return;
    }
    const c = cues[i];
    const node = document.querySelector(c.target.startsWith('[data-u') ? c.target : `.page ${c.target}`);
    if (!node) { i++; return; }
    const travel = isReduced() ? 0.01 : TRAVEL;
    if (phase === 'idle' && t >= c.t1 - travel - 0.1) {
      target = node;
      const to = aim(node, c.accion);
      if (!to) { i++; return; }
      // si recién aparece, entra desde abajo a la derecha del botón
      from = shown ? { ...pos } : { x: to.x + 140, y: to.y + 120 };
      if (!shown) place(from.x, from.y);
      show(true);
      moveStart = t;
      phase = 'move';
    }
    if (phase === 'move') {
      const to = aim(target, c.accion);
      if (!to) { phase = 'idle'; i++; return; }
      const u = Math.min(1, (t - moveStart) / travel);
      const e = ease(u);
      // trayectoria levemente curva, como una mano
      const lift = Math.sin(e * Math.PI) * -28;
      place(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e + lift);
      if (u >= 1 && t >= c.t1 - 0.12) {
        phase = 'act';
        actStart = t;
        if (c.accion !== 'point') { el.classList.add('down'); target.classList.add('sim-press'); }
        if (c.accion === 'click') ripple();
        if (c.accion === 'point') el.classList.add('pointing');
      }
    }
    if (phase === 'act') {
      const k = (t - actStart) / ACT[c.accion];
      if (c.accion.startsWith('drag')) { const p = aim(target, c.accion, ease(Math.min(1, k * 1.25))); if (p) place(p.x, p.y); }
      if (c.accion === 'click' && k > 0.28) { el.classList.remove('down'); target.classList.remove('sim-press'); }
      if (k >= 1) {
        el.classList.remove('down', 'pointing');
        target.classList.remove('sim-press');
        if (c.accion === 'press') ripple();
        phase = 'idle';
        i++;
      }
    }
  },
  get time() { return lastT; },
};
