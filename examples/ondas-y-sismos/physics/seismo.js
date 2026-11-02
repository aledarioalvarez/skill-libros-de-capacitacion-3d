// Señal sintética de un sismograma: llegadas P, S y superficiales según la distancia al epicentro.
export const VP = 6.0; // km/s, corteza
export const VS = 3.5;
export const VSURF = 3.1;
// distancia ≈ k · (tS − tP), con k = 1 / (1/VS − 1/VP) ≈ 8,4 km/s; en clase se usa la regla de 8 km por segundo
export const K_SP = 1 / (1 / VS - 1 / VP);

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Devuelve { tP, tS, tSurf, at(t) } con t en segundos desde el origen del sismo. */
export function makeQuake(distanceKm, { seed = 3, size = 1 } = {}) {
  const tP = distanceKm / VP, tS = distanceKm / VS, tSurf = distanceKm / VSURF + 2;
  const r = rng(seed);
  const parts = [];
  // cada fase = suma de algunas sinusoides con envolvente
  const add = (t0, amp, dur, f0, n) => {
    for (let i = 0; i < n; i++) parts.push({ t0, amp: amp * (0.6 + 0.4 * r()), dur, f: f0 * (0.7 + 0.6 * r()), ph: r() * 6.28 });
  };
  const att = Math.max(0.25, Math.min(1.2, 120 / (distanceKm + 60))) * size;
  add(tP, 0.22 * att, 7, 3.2, 4);
  add(tS, 0.55 * att, 11, 1.7, 4);
  add(tSurf, 0.95 * att, 16, 0.75, 3);
  const noise = [];
  for (let i = 0; i < 6; i++) noise.push({ f: 2 + r() * 6, ph: r() * 6.28 });
  return {
    tP, tS, tSurf,
    at(t) {
      let v = 0;
      for (const p of parts) {
        const u = t - p.t0;
        if (u < 0) continue;
        const env = (1 - Math.exp(-u * 4)) * Math.exp(-u / p.dur) ;
        v += p.amp * env * Math.sin(6.283 * p.f * u + p.ph);
      }
      for (const n of noise) v += 0.012 * Math.sin(6.283 * n.f * t + n.ph);
      return v;
    },
  };
}
