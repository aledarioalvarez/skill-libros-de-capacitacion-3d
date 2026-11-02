// Rótulos manuscritos que siguen un punto 3D (CSS2D): siempre legibles, con un punto de tinta.
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export function label(text, a = {}, b) {
  // admite label(texto, opciones) y label(texto, posición, opciones)
  const pos = a && a.isVector3 ? a : null;
  const { cls = '', side = 'right', color } = (pos ? b : a) || {};
  const el = document.createElement('div');
  el.className = `lbl ${side} ${cls}`;
  el.innerHTML = `<i class="dot"></i><span>${text}</span>`;
  if (color) el.style.setProperty('--lc', color);
  const o = new CSS2DObject(el);
  o.center.set(side === 'left' ? 1 : side === 'center' ? 0.5 : 0, 0.5);
  if (pos) o.position.copy(pos);
  o.setText = (t) => (el.querySelector('span').innerHTML = t);
  o.show = (v) => { o.visible = v; el.classList.toggle('on', v); };
  return o;
}
