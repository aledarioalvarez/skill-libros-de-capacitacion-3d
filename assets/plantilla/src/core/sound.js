// Sonidos sintetizados con WebAudio (sin archivos): hoja, clic, retumbo, sello y aciertos.
import { progress } from './progress.js';

let ctx = null;
let master = null;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noiseBuffer(sec, brown = false) {
  const c = ac();
  const n = Math.floor(c.sampleRate * sec);
  const b = c.createBuffer(1, n, c.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  return b;
}

function env(g, t0, a, peak, d) {
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
}

const on = () => !progress.get().muted && ac();

export const sound = {
  unlock() { ac(); },
  click() {
    if (!on()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = 1400;
    env(g, t, 0.002, 0.12, 0.04);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.06);
  },
  turn() {
    if (!on()) return;
    const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuffer(0.6);
    f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.35);
    env(g, t, 0.08, 0.22, 0.45);
    s.connect(f).connect(g).connect(master); s.start(t);
  },
  rumble(dur = 2, strength = 1) {
    if (!on()) return;
    const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuffer(dur + 0.5, true);
    f.type = 'lowpass'; f.frequency.value = 140;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9 * strength, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + dur + 0.4);
  },
  stamp() {
    if (!on()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.15);
    env(g, t, 0.003, 0.6, 0.2);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.3);
    [523.25, 659.25, 783.99].forEach((fq, i) => {
      const oo = ctx.createOscillator(), gg = ctx.createGain();
      oo.type = 'sine'; oo.frequency.value = fq;
      env(gg, t + 0.12 + i * 0.07, 0.01, 0.12, 0.35);
      oo.connect(gg).connect(master); oo.start(t + 0.1 + i * 0.07); oo.stop(t + 0.7 + i * 0.07);
    });
  },
  answer(ok) {
    if (!on()) return;
    const t = ctx.currentTime;
    (ok ? [659.25, 987.77] : [220, 196]).forEach((fq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = ok ? 'sine' : 'triangle'; o.frequency.value = fq;
      env(g, t + i * 0.09, 0.01, 0.14, 0.25);
      o.connect(g).connect(master); o.start(t + i * 0.09); o.stop(t + 0.4 + i * 0.09);
    });
  },
  splash() {
    if (!on()) return;
    const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuffer(2.2);
    f.type = 'lowpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2500, t + 0.8);
    env(g, t, 0.5, 0.35, 1.5);
    s.connect(f).connect(g).connect(master); s.start(t);
  },
};
