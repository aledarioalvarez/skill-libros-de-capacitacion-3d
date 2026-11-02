// Pliego 3 · Lo que las ondas revelan del interior de la Tierra: trayectorias P y S, zonas de sombra, modelos.
import * as THREE from 'three';
import { h } from '../core/page.js';
import { inkMesh, inkMaterial, penLine, glowMaterial, C } from '../core/ink.js';
import { fan, R_EARTH, R_CMB, R_ICB } from '../physics/rays.js';

const R = 0.27; // radio del dibujo
const k = R / R_EARTH;
const DEPTH = 40; // km
const LAYERS = {
  estatico: [
    { r: 1, r2: 0.972, col: '#a9825a', name: 'Corteza', note: '5 a 70 km · roca sólida' },
    { r: 0.972, r2: R_CMB / R_EARTH, col: '#df9f5c', name: 'Manto', note: 'hasta 2900 km · roca' },
    { r: R_CMB / R_EARTH, r2: R_ICB / R_EARTH, col: '#e9743a', name: 'Núcleo', note: 'hierro y níquel' },
    { r: R_ICB / R_EARTH, r2: 0, col: '#f2c94c', name: '', note: '' },
  ],
  dinamico: [
    { r: 1, r2: 0.972, col: '#8b6d4f', name: 'Litosfera', note: 'rígida, hasta ~100 km' },
    { r: 0.972, r2: 0.896, col: '#d4824a', name: 'Astenosfera', note: 'plástica: fluye muy lento' },
    { r: 0.896, r2: R_CMB / R_EARTH, col: '#e6ae72', name: 'Mesosfera', note: 'sólida y rígida' },
    { r: R_CMB / R_EARTH, r2: R_ICB / R_EARTH, col: '#ec7d3e', name: 'Endosfera: núcleo externo', note: 'líquido' },
    { r: R_ICB / R_EARTH, r2: 0, col: '#f4cf55', name: 'núcleo interno', note: 'sólido' },
  ],
};

export default {
  id: 'interior',
  kicker: 'Lección 5 · Pliego 3',
  title: 'Lo que las ondas revelan del interior de la Tierra',
  stamp: 'interior',
  scale: 0.74,
  left: () => `
    ${h.head('Lección 5 · ¿Cómo las ondas sísmicas han permitido conocer el interior de la Tierra?', 'Una radiografía hecha con sismos')}
    <p>Nadie ha perforado más de 13 km. Todo lo que sabemos del interior viene de cómo viajan las ondas P y S: su <b>rapidez</b> cambia según el material, y al pasar de una capa a otra se <b>refractan</b> (se desvían).</p>
    <table class="tw">
      <tr><th>Año</th><th>Quién</th><th>Qué descubrió con las ondas</th></tr>
      <tr><td>1909</td><td>Andrija Mohorovičić</td><td>Un límite entre corteza y manto donde las ondas P se aceleran: el <b>moho</b>.</td></tr>
      <tr><td>1914</td><td>Beno Gutenberg</td><td>Un <b>núcleo</b> a ~2900 km que crea una zona de sombra.</td></tr>
      <tr><td>1936</td><td>Inge Lehmann</td><td>Ondas P débiles dentro de la zona de sombra: hay un <b>núcleo interno sólido</b>.</td></tr>
    </table>
    ${h.key(`<b>Modelo estático</b> (composición química): corteza, manto y núcleo.<br><b>Modelo dinámico</b> (comportamiento mecánico): litosfera, astenosfera, mesosfera y endosfera.`)}
    ${h.predict('interior', 'Si la Tierra fuera igual por dentro, las ondas irían en línea recta y llegarían a todo el planeta. ¿Qué registran en realidad las estaciones?', [
      { t: 'Ondas en todas partes, igual que en una Tierra homogénea.' },
      { t: 'Zonas de sombra: lugares donde no llegan ondas S, y una franja sin ondas P directas.', ok: true },
      { t: 'Las ondas nunca salen del manto.' },
    ], `<p>Las ondas se curvan porque la rapidez aumenta con la profundidad, y se quiebran en el núcleo. Más allá de ~104° del epicentro <b>no llegan ondas S</b>: el núcleo externo es líquido. Entre ~104° y ~140° casi no llegan ondas P.</p>`)}
    ${h.folio(6)}`,
  right: () => `
    <div class="stage-space"></div>
    ${h.fig('3', 'Corte de la Tierra (capas a escala, salvo la corteza, engrosada para verla). Trayectorias calculadas con la ley de Snell en un modelo de rapidez por capas.')}
    ${h.test(`
      <div class="row">${h.btn('quake', 'Lanzar sismo', 'hot')} ${h.btn('P', 'Ondas P', 'P on')} ${h.btn('S', 'Ondas S', 'S on')} ${h.btn('homo', 'Tierra real')} ${h.btn('model', 'Modelo estático')}</div>
      ${h.readout('msg', 'Lanza un sismo y observa dónde llegan las ondas a la superficie.')}`)}
    ${h.challenge('interior', `<p>Las ondas S no atraviesan el núcleo externo. ¿Qué nos dice eso?</p><div class="row">${h.btn('a-solid', 'Es sólido')} ${h.btn('a-liquid', 'Es líquido')} ${h.btn('a-empty', 'Está vacío')}</div>`)}
    ${h.folio(7)}`,

  mount(ctx) {
    const { root } = ctx;
    // la Tierra en un atril, inclinada hacia el lector
    const stand = new THREE.Group();
    stand.position.set(0, 0, -0.27);
    root.add(stand);
    const baseMesh = inkMesh(new THREE.CylinderGeometry(0.14, 0.17, 0.03, 40), { tint: '#7d6a55', tintAmt: 0.35 });
    baseMesh.position.y = 0.015;
    const post = inkMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 12), { tint: '#7d6a55', tintAmt: 0.35 });
    post.position.y = 0.06;
    stand.add(baseMesh, post);
    const earth = new THREE.Group();
    earth.position.y = 0.08 + R;
    earth.rotation.x = -0.38;
    stand.add(earth);
    // medio globo trasero (la parte de afuera)
    const shell = inkMesh(new THREE.SphereGeometry(R, 56, 28, Math.PI, Math.PI, 0, Math.PI), { tint: '#7fa3c9', tintAmt: 0.45, side: THREE.DoubleSide });
    earth.add(shell);

    // capas en la cara del corte
    const face = new THREE.Group();
    earth.add(face);
    const layerLabels = [];
    function buildLayers(model) {
      face.clear();
      layerLabels.forEach((l) => l.parent?.remove(l));
      layerLabels.length = 0;
      LAYERS[model].forEach((L, i) => {
        const geo = L.r2 > 0 ? new THREE.RingGeometry(L.r2 * R, L.r * R, 96, 1) : new THREE.CircleGeometry(L.r * R, 96);
        const m = new THREE.Mesh(geo, inkMaterial({ tint: L.col, tintAmt: 0.62, shade: 0.35 }));
        m.position.z = 0.0005 * i;
        face.add(m);
        const circ = [];
        for (let a = 0; a <= 96; a++) circ.push(new THREE.Vector3(Math.cos((a / 96) * Math.PI * 2) * L.r * R, Math.sin((a / 96) * Math.PI * 2) * L.r * R, 0.003));
        face.add(penLine(circ, { width: 1.3 }));
        if (L.name) {
          // rótulo a la izquierda (las trayectorias ocupan sobre todo la derecha)
          const rr = L.r2 > 0 ? (L.r + L.r2) / 2 : L.r * 0.5;
          const ang = Math.PI * (0.78 + i * 0.07);
          const lbl = ctx.label(L.name.replace('Endosfera: núcleo externo', 'Endosfera'), new THREE.Vector3(Math.cos(ang) * rr * R, Math.sin(ang) * rr * R, 0.004), { side: 'left' });
          lbl.show(true);
          earth.add(lbl);
          layerLabels.push(lbl);
        }
      });
    }
    let model = 'estatico';
    buildLayers(model);

    // foco
    const focus = new THREE.Mesh(new THREE.SphereGeometry(0.008, 16, 12), glowMaterial(C.hot, 1));
    focus.position.set(0, (R_EARTH - DEPTH) * k, 0.006);
    earth.add(focus);
    const lFocus = ctx.label('sismo', focus.position.clone().add(new THREE.Vector3(0, 0.02, 0)), { side: 'center', cls: 'nodot', color: C.hot });
    lFocus.show(true);
    earth.add(lFocus);

    // trayectorias: dos lados simétricos; se dibujan avanzando según el tiempo de viaje real
    const sets = { P: new THREE.Group(), S: new THREE.Group() };
    earth.add(sets.P, sets.S);
    const fronts = { P: [], S: [] };
    let homogeneous = false;
    function buildRays() {
      for (const kind of ['P', 'S']) {
        sets[kind].clear();
        fronts[kind] = [];
        const rays = fan(kind, { count: 30, depth: DEPTH, homogeneous, ds: 20 });
        for (const ray of rays) {
          for (const side of [1, -1]) {
            const pts = ray.points.map((p) => new THREE.Vector3(side * p.x * k, p.y * k, kind === 'P' ? 0.007 : 0.008));
            const line = penLine(pts, { color: C[kind], width: 1.4, opacity: 0.85, dashed: true, dashSize: 0, gapSize: 100 });
            line.material.dashSize = 0.00001;
            sets[kind].add(line);
            // distancia acumulada por tiempo, para revelar la línea al ritmo de la onda
            const dist = [0];
            for (let i = 1; i < pts.length; i++) dist.push(dist[i - 1] + pts[i].distanceTo(pts[i - 1]));
            const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 6), glowMaterial(C[kind], 1));
            dot.visible = false;
            sets[kind].add(dot);
            fronts[kind].push({ line, dot, pts, dist, times: ray.points.map((p) => p.t), end: ray.end, delta: ray.delta });
          }
        }
      }
    }
    buildRays();

    // zonas de sombra en el borde
    const arc = (d0, d1, col, rr) => {
      const pts = [];
      for (let i = 0; i <= 40; i++) { const a = THREE.MathUtils.degToRad(d0 + (d1 - d0) * (i / 40)); pts.push(new THREE.Vector3(Math.sin(a) * rr, Math.cos(a) * rr, 0.01)); }
      return penLine(pts, { color: col, width: 6 });
    };
    const shadows = new THREE.Group();
    const sP = [arc(103, 142, C.P, R + 0.012), arc(-103, -142, C.P, R + 0.012)];
    const sS = [arc(104, 256, C.S, R + 0.024)];
    shadows.add(...sP, ...sS);
    shadows.visible = false;
    earth.add(shadows);
    const lShP = ctx.label('sin ondas P directas', new THREE.Vector3(Math.sin(2.1) * (R + 0.03), Math.cos(2.1) * (R + 0.03), 0.01), { side: 'right', color: C.P });
    const lShS = ctx.label('sin ondas S', new THREE.Vector3(0, -(R + 0.04), 0.01), { side: 'center', color: C.S, cls: 'big' });
    earth.add(lShP, lShS);
    lShP.show(false); lShS.show(false);

    const show = { P: true, S: true };
    let t = -1, ranWithS = false, answered = false;
    const T_SCALE = 1 / 210; // s de simulación por s reales (≈ 20 min de viaje en ~6 s)
    const msg = (s) => ctx.ro('msg', s);
    function setShadows() {
      const real = !homogeneous;
      shadows.visible = t > 0 && real;
      sP.forEach((l) => (l.visible = show.P));
      sS.forEach((l) => (l.visible = show.S));
      lShP.show(shadows.visible && show.P);
      lShS.show(shadows.visible && show.S);
    }
    ctx.act('quake', () => {
      t = 0;
      ctx.sound.rumble(1.6, 0.5);
      if (show.S) ranWithS = true;
      Object.values(fronts).flat().forEach((f) => { f.line.material.dashSize = 0.00001; f.dot.visible = true; });
      shadows.visible = false; lShP.show(false); lShS.show(false);
      msg(homogeneous ? 'En una Tierra homogénea las ondas viajan en línea recta y llegan a todo el planeta.' : 'Las ondas se curvan (la rapidez aumenta con la profundidad) y se quiebran al entrar al núcleo…');
    });
    ['P', 'S'].forEach((kind) => ctx.act(kind, (e, b) => {
      show[kind] = !show[kind];
      b.classList.toggle('on', show[kind]);
      sets[kind].visible = show[kind];
      setShadows();
    }));
    ctx.act('homo', (e, b) => {
      homogeneous = !homogeneous;
      b.textContent = homogeneous ? 'Tierra homogénea' : 'Tierra real';
      b.classList.toggle('on', homogeneous);
      face.visible = !homogeneous;
      layerLabels.forEach((l) => l.show(!homogeneous));
      shell.userData.mesh.material.uniforms.uTint.value.set(homogeneous ? '#b9a27f' : '#7fa3c9');
      buildRays();
      sets.P.visible = show.P; sets.S.visible = show.S;
      t = -1;
      setShadows();
      msg(homogeneous ? 'Imagina una Tierra hecha del mismo material por dentro. Lanza un sismo y compara.' : 'Volvimos a la Tierra real, con capas. Lanza un sismo.');
    });
    ctx.act('model', (e, b) => {
      model = model === 'estatico' ? 'dinamico' : 'estatico';
      b.textContent = model === 'estatico' ? 'Modelo estático' : 'Modelo dinámico';
      buildLayers(model);
      face.visible = !homogeneous;
      layerLabels.forEach((l) => l.show(!homogeneous));
    });
    const answer = (ok, text) => {
      ctx.sound.answer(ok);
      msg(text);
      if (ok) {
        if (!ranWithS) { msg('¡Correcto! Para ganar el sello, lanza también un sismo con las <b>ondas S</b> activadas y observa su zona de sombra.'); answered = true; return; }
        ctx.award('interior');
      }
    };
    ctx.act('a-solid', () => answer(false, 'Si fuera sólido, las ondas S podrían atravesarlo, como atraviesan el manto. Observa dónde se detienen.'));
    ctx.act('a-empty', () => answer(false, 'Las ondas P sí cruzan el núcleo (se desvían, pero pasan): hay materia ahí.'));
    ctx.act('a-liquid', () => answer(true, '<b>¡Exacto!</b> Un líquido no resiste el corte, así que las ondas S no se propagan en él. Por eso, desde 1914 sabemos que el núcleo externo es líquido.'));

    return {
      update(dt) {
        if (t < 0) return;
        t += dt;
        const ts = t / T_SCALE;
        let allDone = true;
        for (const kind of ['P', 'S']) {
          for (const f of fronts[kind]) {
            const { times, dist, pts } = f;
            const last = times.length - 1;
            if (ts >= times[last]) {
              f.line.material.dashSize = dist[last] + 1;
              f.dot.visible = f.end === 'stopped' && kind === 'S';
              if (f.dot.visible) f.dot.position.copy(pts[last]);
              continue;
            }
            allDone = false;
            let i = 1;
            while (i < last && times[i] < ts) i++;
            const u = (ts - times[i - 1]) / Math.max(1e-6, times[i] - times[i - 1]);
            f.line.material.dashSize = dist[i - 1] + (dist[i] - dist[i - 1]) * u;
            f.dot.position.lerpVectors(pts[i - 1], pts[i], u);
          }
        }
        if (allDone && t > 0.5 && !shadows.visible) {
          setShadows();
          if (!homogeneous) msg(`Las ondas S se detienen en el núcleo externo (puntos naranjos). Mira el borde: hay <b>zonas de sombra</b> donde las estaciones no registran ondas${show.S ? ' S' : ''}${show.P ? ' o casi no registran P' : ''}.`);
          if (answered && ranWithS) ctx.award('interior');
        }
      },
    };
  },
};
