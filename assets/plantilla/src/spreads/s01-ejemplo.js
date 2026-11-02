// Pliego de EJEMPLO: muestra todas las piezas del motor en un caso simple (caída libre y rebote).
// Cópialo como punto de partida de cada pliego nuevo y reemplaza contenido, modelo 3D y lógica.
import * as THREE from 'three';
import { h } from '../core/page.js';
import { inkMesh, penLine, glowMaterial, C, setLinePoints } from '../core/ink.js';

const G = 9.8;
const SC = 0.17; // unidades de dibujo por metro
const BASE_Y = 0.04;
const fmt = (x, d = 2) => x.toFixed(d).replace('.', ',');

export default {
  id: 'ejemplo', // también nombra el audio (src/audio/ejemplo.mp3) y su guion en narracion/guiones.json
  kicker: 'Lección 1 · Pliego 1', // el índice usa lo que está antes del "·"
  title: 'Caer y rebotar', // aparece en la cápsula, el índice y la pestaña
  stamp: 'ejemplo', // id del sello; omítelo si el pliego no tiene desafío
  scale: 0.9, // escala del dibujo sobre la página (0.7 – 1)
  left: () => `
    ${h.head('Lección 1 · Movimiento', 'Caer y rebotar')}
    <p>Al soltar un objeto, la gravedad lo acelera: cada segundo su rapidez aumenta unos 9,8 m/s. Por eso el tiempo de caída <b>no</b> crece en proporción a la altura.</p>
    ${h.key('<div class="eq">t = √(2h / g)</div><small>Si la altura se cuadruplica, el tiempo solo se duplica.</small>')}
    ${h.predict('ejemplo', 'Si sueltas la pelota desde el doble de altura, ¿cuánto tarda en caer?', [
      { t: 'El doble de tiempo.' },
      { t: 'Un poco más: unas 1,4 veces.', ok: true },
      { t: 'Lo mismo.' },
    ], '<p>t crece con la raíz de la altura: √2 ≈ 1,41. Compruébalo con el modelo.</p>')}
    ${h.folio(2)}`,
  right: () => `
    <div class="stage-space"></div>
    ${h.fig('1', 'Una pelota sobre un soporte graduado (alturas en metros).')}
    ${h.test(`
      ${h.slider('h', 'Altura', 0.2, 2, 0.05, 1, ' m')}
      <div class="row">${h.btn('drop', 'Soltar', 'hot')} ${h.btn('reset', 'Reiniciar')}</div>
      ${h.readout('msg', 'Elige una altura y suelta la pelota.')}`)}
    ${h.challenge('ejemplo', '<p>Ajusta la altura para que la pelota tarde <b>0,5 s</b> en llegar al suelo.</p>')}
    ${h.folio(3)}`,

  mount(ctx) {
    const { root } = ctx;
    const Z = -0.3;
    const base = inkMesh(new THREE.BoxGeometry(0.5, 0.04, 0.3), { tint: '#b9a27f', tintAmt: 0.4 });
    base.position.set(0, 0.02, Z);
    const post = inkMesh(new THREE.BoxGeometry(0.02, 0.36, 0.02), { tint: '#7d6a55', tintAmt: 0.4 });
    post.position.set(-0.15, BASE_Y + 0.18, Z - 0.08);
    root.add(base, post);
    // marcas de la regla cada 0,5 m
    for (let m = 0; m <= 2; m += 0.5) {
      const y = BASE_Y + m * SC;
      root.add(penLine([new THREE.Vector3(-0.14, y, Z - 0.07), new THREE.Vector3(-0.11, y, Z - 0.07)], { width: 1.4 }));
      const l = ctx.label(`${fmt(m, 1)} m`, new THREE.Vector3(-0.16, y, Z - 0.07), { side: 'left', cls: 'nodot' });
      l.show(true);
      root.add(l);
    }
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.025, 24, 16), glowMaterial(C.energy, 1));
    ball.castShadow = true;
    root.add(ball);
    const trail = penLine([new THREE.Vector3(), new THREE.Vector3(0.001, 0, 0)], { color: C.energy, width: 2, dashed: true, dashSize: 0.008, gapSize: 0.006 });
    root.add(trail);
    const lBall = ctx.label('', new THREE.Vector3(), { side: 'right', color: C.hot });
    root.add(lBall);

    let hgt = 1, t = -1, y = 0, v = 0, firstHit = null;
    const place = () => { ball.position.set(0, BASE_Y + 0.025 + y * SC, Z); lBall.position.copy(ball.position).x += 0.04; };
    const reset = () => { t = -1; y = hgt; v = 0; firstHit = null; place(); lBall.show(false); setLinePoints(trail, [ball.position.clone(), ball.position.clone().add(new THREE.Vector3(0.0001, 0, 0))]); };
    reset();
    ctx.slider('h', (val) => { hgt = val; reset(); });
    ctx.act('reset', reset);
    ctx.act('drop', () => { reset(); t = 0; ctx.ro('msg', 'Cayendo…'); });
    // tocar la pelota muestra su rapidez (ejemplo de selección en 3D)
    ctx.pick([ball], () => { lBall.setText(`${fmt(Math.abs(v), 1)} m/s`); lBall.show(true); });

    return {
      update(dt) {
        if (t < 0) return;
        t += dt;
        v -= G * dt;
        y += v * dt;
        if (y <= 0) {
          y = 0;
          if (firstHit == null) {
            firstHit = t;
            const ideal = Math.sqrt((2 * hgt) / G);
            ctx.sound.answer(true);
            ctx.ro('msg', `Tardó <b>${fmt(firstHit)} s</b> (la fórmula da ${fmt(ideal)} s).`);
            if (Math.abs(firstHit - 0.5) < 0.03) ctx.award('ejemplo');
          }
          v = -v * 0.6; // rebote: pierde parte de la energía
          if (Math.abs(v) < 0.3) { v = 0; t = -1; }
        }
        place();
        setLinePoints(trail, [new THREE.Vector3(0, BASE_Y + 0.025 + hgt * SC, Z), ball.position.clone()]);
      },
    };
  },
};
