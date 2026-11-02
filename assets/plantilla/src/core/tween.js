// Interpolaciones mínimas con promesas, avanzadas desde el bucle principal.
const active = new Set();
let reduced = false;

export function setReducedMotion(v) { reduced = v; }
export function isReduced() { return reduced; }

export function tween(dur, update, easeFn = (t) => t) {
  return new Promise((resolve) => {
    if (reduced || dur <= 0) { update(1); resolve(); return; }
    active.add({ t: 0, dur, update, easeFn, resolve });
  });
}

export const wait = (s) => tween(s, () => {});

export function stepTweens(dt) {
  for (const a of [...active]) {
    a.t = Math.min(a.dur, a.t + dt);
    a.update(a.easeFn(a.t / a.dur));
    if (a.t >= a.dur) { active.delete(a); a.resolve(); }
  }
}
