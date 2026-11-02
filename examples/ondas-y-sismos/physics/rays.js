// Trazado de rayos sísmicos en una Tierra de capas esféricas (corte 2D por el foco).
// Modelo de rapidez simplificado inspirado en PREM: lineal por tramos, en km/s.
// Unidades: km y s. El foco está en el eje +y, a `depth` km bajo la superficie.

export const R_EARTH = 6371;
export const R_CMB = 3480; // límite manto–núcleo (Gutenberg)
export const R_ICB = 1220; // límite núcleo externo–interno (Lehmann)

const lerp = (a, b, t) => a + (b - a) * t;

// rapidez según radio; homogeneous = Tierra "igual por dentro"
export function speed(kind, r, homogeneous = false) {
  if (homogeneous) return kind === 'P' ? 10 : 5.6;
  if (r > R_CMB) {
    const t = (r - R_CMB) / (R_EARTH - R_CMB); // 0 en el núcleo, 1 en superficie
    const q = t * t; // aumenta más rápido cerca de la superficie, como en el manto real
    return kind === 'P' ? lerp(13.7, 8.0, q) : lerp(7.3, 4.5, q);
  }
  if (r > R_ICB) {
    if (kind === 'S') return 0; // un líquido no resiste la deformación lateral
    return lerp(10.3, 8.0, (r - R_ICB) / (R_CMB - R_ICB));
  }
  return kind === 'P' ? lerp(11.3, 11.0, r / R_ICB) : 3.6;
}

const layerOf = (r) => (r > R_CMB ? 0 : r > R_ICB ? 1 : 2);

/**
 * Traza un rayo desde el foco con ángulo de salida `takeoff` (radianes, medido desde la vertical
 * hacia abajo, positivo hacia +x). Devuelve { points:[{x,y,t}], end:'surface'|'stopped',
 * delta (distancia epicentral en grados), time }.
 */
export function traceRay(kind, takeoff, { depth = 30, homogeneous = false, ds = 8 } = {}) {
  let x = 0, y = R_EARTH - depth;
  let dx = Math.sin(takeoff), dy = -Math.cos(takeoff);
  let t = 0;
  const pts = [{ x, y, t }];
  let r = Math.hypot(x, y);
  let layer = layerOf(r);
  for (let i = 0; i < 6000; i++) {
    const v = speed(kind, r, homogeneous);
    // ecuación del rayo: d(n·d)/ds = ∇n, con n = 1/v (lentitud)
    const h = 1;
    const n = 1 / v;
    if (!homogeneous) {
      const vp = speed(kind, r + h, homogeneous), vm = speed(kind, Math.max(0, r - h), homogeneous);
      if (vp > 0 && vm > 0 && layerOf(r + h) === layer && layerOf(Math.max(0, r - h)) === layer) {
        const dn = (1 / vp - 1 / vm) / (2 * h);
        const ux = x / r, uy = y / r;
        let px = n * dx + dn * ux * ds, py = n * dy + dn * uy * ds;
        const m = Math.hypot(px, py);
        dx = px / m; dy = py / m;
      }
    }
    let nx = x + dx * ds, ny = y + dy * ds;
    let nr = Math.hypot(nx, ny);
    t += ds / v;
    if (nr >= R_EARTH && i > 2) {
      // llega a la superficie: recorta al radio exacto
      const k = (R_EARTH - r) / (nr - r);
      nx = x + (nx - x) * k; ny = y + (ny - y) * k;
      pts.push({ x: nx, y: ny, t });
      return { points: pts, end: 'surface', delta: Math.atan2(nx, ny) * 180 / Math.PI, time: t };
    }
    const nl = layerOf(nr);
    if (nl !== layer && !homogeneous) {
      // cruza un límite entre capas: ley de Snell con la normal radial
      const v2 = speed(kind, nr, false);
      if (v2 === 0) { pts.push({ x: nx, y: ny, t }); return { points: pts, end: 'stopped', delta: null, time: t }; }
      const ux = nx / nr, uy = ny / nr;
      const cosI = dx * ux + dy * uy; // componente radial
      const sx = dx - cosI * ux, sy = dy - cosI * uy; // componente tangencial (sin i)
      const sinI = Math.hypot(sx, sy);
      const sinT = sinI * v2 / v;
      if (sinT >= 1) {
        // reflexión total: invierte la componente radial y sigue en la misma capa
        dx = dx - 2 * cosI * ux; dy = dy - 2 * cosI * uy;
        pts.push({ x, y, t });
        continue;
      }
      const cosT = Math.sqrt(1 - sinT * sinT) * Math.sign(cosI);
      const k = sinI > 1e-9 ? sinT / sinI : 0;
      dx = sx * k + cosT * ux; dy = sy * k + cosT * uy;
      layer = nl;
    }
    x = nx; y = ny; r = nr;
    pts.push({ x, y, t });
  }
  return { points: pts, end: 'stopped', delta: null, time: t };
}

/** Abanico de rayos de un lado (el otro lado es simétrico). */
export function fan(kind, opts = {}) {
  const n = opts.count ?? 34;
  const rays = [];
  for (let i = 0; i < n; i++) {
    // más rayos cerca de la vertical, donde nacen los que cruzan el núcleo
    const u = (i + 0.5) / n;
    const takeoff = (2 + 86 * Math.pow(u, 1.15)) * Math.PI / 180;
    rays.push(traceRay(kind, takeoff, opts));
  }
  return rays;
}
