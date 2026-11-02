// Narración de cada pliego (voz generada con Gemini TTS, incrustada en el archivo).
// Si falta el audio de un pliego, simplemente no aparece su botón.
import { progress } from './progress.js';
import guiones from '../../narracion/guiones.json';
import { guide } from './cursor.js';

// el elemento al que invita cada narración: se destaca cuando termina el audio
const CTA = Object.fromEntries(guiones.map((g) => [g.id, g.cta]));

const files = import.meta.glob('../audio/*.mp3', { eager: true, query: '?url', import: 'default' });
const urls = Object.fromEntries(Object.entries(files).map(([p, u]) => [p.match(/([^/]+)\.mp3$/)[1], u]));

let audio = null;
let current = null;
const listeners = new Set();
const blockedListeners = new Set();
const emit = () => listeners.forEach((f) => f(current, !!audio && !audio.paused));

function highlight(id) {
  const sel = CTA[id];
  if (!sel) return;
  const el = document.querySelector(`.page ${sel}`);
  if (!el) return;
  el.classList.remove('cta-pulse');
  void el.offsetWidth; // reinicia la animación
  el.classList.add('cta-pulse');
  setTimeout(() => el.classList.remove('cta-pulse'), 6000);
}

export const narration = {
  has: (id) => !!urls[id],
  get auto() { return !!progress.get().autoNarr; },
  setAuto(v) { progress.setAutoNarr(v); },
  onChange: (f) => listeners.add(f),
  onBlocked: (f) => blockedListeners.add(f),
  isPlaying: (id) => current === id && audio && !audio.paused,
  play(id) {
    if (!urls[id]) return;
    if (current !== id || !audio) {
      this.stop();
      audio = new Audio(urls[id]);
      current = id;
      guide.start(id);
      // el cursor guía sigue el reloj del audio: si se pausa la voz, el cursor también espera
      const a = audio;
      const tick = () => {
        if (audio !== a) return;
        guide.update(a.currentTime, a.ended);
        if (!a.ended) requestAnimationFrame(tick);
      };
      a.addEventListener('play', () => requestAnimationFrame(tick));
      audio.addEventListener('ended', () => { emit(); highlight(id); guide.update(audio?.duration || 999, true); });
      audio.addEventListener('pause', emit);
      audio.addEventListener('play', emit);
    }
    audio.play().catch(() => {
      // el navegador bloqueó el autoplay (p. ej. al abrir un enlace directo sin haber tocado la página):
      // se reproduce apenas la persona toque, haga clic o presione una tecla
      emit();
      blockedListeners.forEach((f) => f(id));
      const resume = () => { if (current === id && audio) audio.play().catch(() => {}); };
      ['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, resume, { once: true, capture: true }));
    });
  },
  toggle(id) { if (this.isPlaying(id)) audio.pause(); else this.play(id); },
  stop() {
    guide.stop();
    if (audio) { audio.pause(); audio.src = ''; }
    audio = null;
    current = null;
    emit();
  },
};
