// Pliego 8 · Tsunamis: v = √(g·h); al llegar a aguas bajas se frena y crece. Evacuar a zona alta.
import * as THREE from 'three';
import { h } from '../core/page.js';
import { inkMesh, glowMaterial, penLine, C, setLinePoints } from '../core/ink.js';

const G = 9.81;
const KM = 175; // largo del corte, km
const X0 = -0.45, X1 = 0.45;
const SEA_Y = 0.2; // nivel del mar en el dibujo
const VSC = 0.0035; // unidades de dibujo por metro (sobre el nivel del mar)
const Z0 = -0.46, Z1 = -0.22;
const xOf = (km) => X0 + (X1 - X0) * (km / KM);
// profundidad del mar (m) y altura de la tierra (m) a lo largo del corte
function depth(km) {
  if (km < 20) return 6000;
  if (km < 60) return 6000 - 2000 * ((km - 20) / 40);
  if (km < 110) return 4000 - 3800 * Math.pow((km - 60) / 50, 0.8);
  if (km < 150) return 200 * (1 - (km - 110) / 40);
  return 0;
}
function land(km) {
  if (km < 150) return 0;
  if (km < 160) return 5 * ((km - 150) / 10);
  if (km < 163) return 5;
  if (km < 169) return 5 + 37 * ((km - 163) / 6);
  return 42 + (km - 169) * 0.5;
}
const seafloorY = (km) => (km < 150 ? SEA_Y - 0.18 * Math.sqrt(depth(km) / 6000) : SEA_Y + land(km) * VSC);
const N = 220;
const KMs = Array.from({ length: N + 1 }, (_, i) => (i / N) * KM);
// tiempo de viaje desde la fosa (s), integrando dt = dx / √(g·h)
const TT = [0];
for (let i = 1; i <= N; i++) {
  const km = KMs[i];
  if (km >= 150) { TT.push(TT[i - 1]); continue; }
  const hh = Math.max(8, (depth(km) + depth(KMs[i - 1])) / 2);
  TT.push(TT[i - 1] + ((KMs[i] - KMs[i - 1]) * 1000) / Math.sqrt(G * hh));
}
const T_SHORE = TT[Math.round((150 / KM) * N) - 1];
const SIGMA = 150; // s, ancho del pulso en el tiempo
const A0 = 1.0; // m en aguas de 4000 m
const RUNUP = 9; // m de inundación en la costa
const SIM = 150; // s de tsunami por s real (≈ 15 s hasta la costa)
const SPOTS = {
  beach: { km: 152, label: 'playa', y: () => land(152) },
  house: { km: 158, label: '2.º piso (3 m)', y: () => land(158) + 3 },
  hill: { km: 171, label: 'cerro (sobre 30 m)', y: () => land(171) },
};

export default {
  id: 'tsunami',
  kicker: 'Lección 6 · Pliego 8',
  title: 'Tsunamis',
  stamp: 'tsunami',
  scale: 0.98,
  left: () => `
    ${h.head('Lección 6 · ¿Qué consecuencias tienen los sismos?', 'Tsunamis: una onda que cruza océanos')}
    <p>Cuando el epicentro está en el mar o cerca de la costa, el fondo marino puede levantarse de golpe y empujar toda la columna de agua: se forma un <b>tsunami</b>, un tren de olas que puede cruzar el océano Pacífico (el de 1960 llegó a Japón).</p>
    ${h.key(`<div class="eq">v = √(g · h)</div><small>En aguas de h = 4000 m: v = √(9,8 × 4000) ≈ 198 m/s ≈ <b>713 km/h</b>, como un avión. Al llegar a aguas poco profundas, el tsunami se frena, su longitud de onda se acorta y su <b>altura crece</b>.</small>`)}
    <p><b>Si el sismo es tan fuerte que cuesta mantenerse en pie, y estás en la costa, evacúa de inmediato</b>, sin esperar la alarma:</p>
    <ul style="margin:0 0 10px 0;padding-left:22px;font-size:19.5px">
      <li>camina rápido a una zona alta, sobre 30 m;</li>
      <li>no uses el auto: bloquea las vías;</li>
      <li>no bajes hasta que las autoridades (SHOA y SENAPRED) levanten la alerta: pueden venir varias olas.</li>
    </ul>
    ${h.predict('tsunami', 'En alta mar, un tsunami…', [
      { t: 'es una ola gigante de 30 m que se ve desde los barcos.' },
      { t: 'casi no se nota (a lo más 1 m), pero viaja a unos 700–800 km/h.', ok: true },
      { t: 'viaja lento, como una ola común.' },
    ], `<p>En el océano profundo, su altura casi no se distingue del oleaje, pero su energía abarca toda la profundidad del agua. Cerca de la costa esa energía se concentra en poca agua: la ola crece y puede entrar kilómetros tierra adentro.</p>`)}
    ${h.folio(16)}`,
  right: () => `
    <div class="stage-space" style="height:470px"></div>
    ${h.fig('8', 'Corte del mar frente a una costa (distancias horizontales comprimidas, alturas muy exageradas).')}
    ${h.test(`
      <div class="row">${h.btn('quake', 'Sismo en la fosa', 'hot')} ${h.readout('clock', '')}</div>
      <p style="margin:6px 0 4px">¿A dónde evacúas?</p>
      <div class="row">${h.btn('go-beach', 'Me quedo en la playa')} ${h.btn('go-house', 'Subo al 2.º piso')} ${h.btn('go-hill', 'Camino al cerro')}</div>
      ${h.readout('msg', 'Provoca el sismo y decide rápido a dónde ir.')}`)}
    ${h.challenge('tsunami', '<p>Llega a un lugar seguro <b>antes</b> de que el tsunami alcance la costa.</p>')}
    ${h.folio(17)}`,

  mount(ctx) {
    const { root } = ctx;
    // fondo marino y tierra: un sólido extruido a partir del perfil
    const shapePts = [new THREE.Vector2(X0, 0)];
    KMs.forEach((km) => shapePts.push(new THREE.Vector2(xOf(km), seafloorY(km))));
    shapePts.push(new THREE.Vector2(X1, 0));
    const floorGeo = new THREE.ExtrudeGeometry(new THREE.Shape(shapePts), { depth: Z1 - Z0, bevelEnabled: false });
    floorGeo.translate(0, 0, Z0);
    const floor = inkMesh(floorGeo, { tint: '#b9a27f', tintAmt: 0.45, angle: 35 });
    root.add(floor);
    // bloque que se levanta en la fosa
    const uplift = inkMesh(new THREE.BoxGeometry(xOf(30) - xOf(8), 0.02, Z1 - Z0), { tint: '#9c7a55', tintAmt: 0.5 });
    uplift.position.set((xOf(8) + xOf(30)) / 2, seafloorY(15) - 0.01, (Z0 + Z1) / 2);
    root.add(uplift);
    // casas y cerro
    const house = inkMesh(new THREE.BoxGeometry(0.03, 6 * VSC * 1.8, 0.05), { tint: '#d9b98a', tintAmt: 0.5 });
    house.position.set(xOf(158), SEA_Y + land(158) * VSC + 6 * VSC * 0.9, (Z0 + Z1) / 2);
    root.add(house);
    const town = inkMesh(new THREE.BoxGeometry(0.02, 4 * VSC * 1.8, 0.03), { tint: '#e6d2a8', tintAmt: 0.5 });
    town.position.set(xOf(161), SEA_Y + land(161) * VSC + 4 * VSC * 0.9, Z0 + 0.06);
    root.add(town);
    const safe = penLine([new THREE.Vector3(xOf(167), SEA_Y + 30 * VSC, Z1 + 0.002), new THREE.Vector3(X1, SEA_Y + 30 * VSC, Z1 + 0.002)], { color: '#2a7a4a', width: 2, dashed: true, dashSize: 0.01, gapSize: 0.006 });
    root.add(safe);
    const lSafe = ctx.label('cota 30 m: zona segura', new THREE.Vector3(X1, SEA_Y + 30 * VSC + 0.01, Z1), { side: 'left', color: '#2a7a4a' });
    lSafe.show(true); root.add(lSafe);

    // agua: superficie (franja) + cara frontal, recalculadas cada cuadro
    const surfGeo = new THREE.PlaneGeometry(1, 1, N, 1);
    const waterMat = new THREE.MeshStandardMaterial({ color: '#5d9bd6', transparent: true, opacity: 0.62, roughness: 0.2, metalness: 0, side: THREE.DoubleSide });
    const surface = new THREE.Mesh(surfGeo, waterMat);
    root.add(surface);
    const frontGeo = new THREE.BufferGeometry();
    const fpos = new Float32Array((N + 1) * 2 * 3);
    frontGeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
    const fidx = [];
    for (let i = 0; i < N; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; fidx.push(a, c, b, b, c, d); }
    frontGeo.setIndex(fidx);
    const front = new THREE.Mesh(frontGeo, new THREE.MeshBasicMaterial({ color: '#7fb1e0', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
    root.add(front);
    const line = penLine([new THREE.Vector3(), new THREE.Vector3(0.001, 0, 0)], { color: '#1d4f8f', width: 2 });
    root.add(line);
    const crestLbl = ctx.label('', new THREE.Vector3(), { side: 'center', cls: 'tag', color: C.S });
    root.add(crestLbl); crestLbl.show(false);
    const lFosa = ctx.label('fosa', new THREE.Vector3(xOf(14), seafloorY(14), Z1), { side: 'right' });
    lFosa.show(true); root.add(lFosa);

    // persona
    const person = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.014, 4, 8), glowMaterial('#1f2430', 1));
    body.position.y = 0.013;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 10, 8), glowMaterial('#1f2430', 1));
    head.position.y = 0.032;
    person.add(body, head);
    root.add(person);
    let spot = 'beach', personKm = 152, personY = land(152);
    const placePerson = () => person.position.set(xOf(personKm), SEA_Y + personY * VSC, Z1 - 0.03);
    placePerson();

    let t = -1, decided = null, outcome = false;
    const eta = (i, tt) => {
      const km = KMs[i];
      if (km >= 150) return 0;
      const hh = Math.max(10, depth(km));
      const amp = A0 * Math.pow(4000 / hh, 0.25);
      const u = (tt - TT[i]) / SIGMA;
      return amp * Math.exp(-u * u) * Math.sin(Math.min(Math.PI, Math.max(0, (u + 1.6) * 1.05)));
    };
    const flood = (tt) => {
      const u = (tt - T_SHORE) / (SIGMA * 1.4);
      return u < -1.5 ? 0 : RUNUP * Math.exp(-u * u) * (u < 0 ? 1 : Math.exp(-u * 0.3));
    };
    function go(where) {
      if (outcome) return;
      decided = where;
      spot = where;
      ctx.ro('msg', where === 'hill' ? 'Caminas hacia el cerro, por la vía de evacuación…' : where === 'house' ? 'Subes al segundo piso de una casa cercana a la playa…' : 'Te quedas mirando el mar…');
    }
    ctx.act('go-beach', () => go('beach'));
    ctx.act('go-house', () => go('house'));
    ctx.act('go-hill', () => go('hill'));
    ctx.act('quake', () => {
      t = 0; decided = null; outcome = false; spot = 'beach'; personKm = 152; personY = land(152); placePerson();
      ctx.sound.rumble(3, 0.9);
      ctx.ro('msg', 'Un sismo muy fuerte en la fosa levantó el fondo del mar. <b>Te cuesta mantenerte en pie.</b> ¿Qué haces?');
    });

    return {
      update(dt, tt) {
        const time = t < 0 ? 0 : t;
        if (t >= 0) t += dt * SIM;
        // fondo levantándose al inicio
        uplift.position.y = seafloorY(15) - 0.01 + (t >= 0 ? Math.min(1, t / 40) * 0.012 : 0);
        // superficie del mar con oleaje de fondo
        const pos = surfGeo.attributes.position;
        const fl = flood(time);
        const pts = [];
        let crestI = -1, crestV = 0.15;
        for (let i = 0; i <= N; i++) {
          const km = KMs[i];
          const x = xOf(km);
          let y;
          if (km < 150) {
            const e = t >= 0 ? eta(i, time) : 0;
            if (e > crestV) { crestV = e; crestI = i; }
            y = SEA_Y + e * VSC * 3 + Math.sin(km * 0.9 + tt * 2) * 0.0012; // ola exagerada ×3 para verla
          } else {
            y = Math.max(seafloorY(km), SEA_Y + fl * VSC);
            if (fl * VSC <= (seafloorY(km) - SEA_Y)) y = seafloorY(km) - 0.0004; // seco
          }
          pos.setXYZ(i, x, y, Z0);
          pos.setXYZ(i + N + 1, x, y, Z1);
          fpos.set([x, seafloorY(km) - (km < 150 ? 0 : 0.0004), Z1 + 0.001, x, y, Z1 + 0.001], i * 6);
          pts.push(new THREE.Vector3(x, y, Z1 + 0.002));
        }
        pos.needsUpdate = true;
        surfGeo.computeVertexNormals();
        frontGeo.attributes.position.needsUpdate = true;
        setLinePoints(line, pts);
        if (crestI > 0 && t >= 0) {
          const km = KMs[crestI];
          const v = Math.sqrt(G * Math.max(10, depth(km))) * 3.6;
          crestLbl.setText(`${Math.round(v)} km/h · ${crestV.toFixed(1).replace('.', ',')} m`);
          crestLbl.position.set(xOf(km), SEA_Y + crestV * VSC * 3 + 0.04, Z1);
          crestLbl.show(true);
        } else crestLbl.show(false);
        if (t >= 0) ctx.ro('clock', `t = ${Math.floor(time / 60)} min ${String(Math.floor(time % 60)).padStart(2, '0')} s`);
        // la persona camina (≈ 1,4 m/s en el modelo, acelerado)
        if (decided) {
          const target = SPOTS[decided];
          const dir = Math.sign(target.km - personKm);
          personKm += dir * Math.min(Math.abs(target.km - personKm), dt * 3.0); // el tramo de tierra está muy comprimido en el dibujo
          const ground = land(personKm);
          personY = Math.abs(target.km - personKm) < 0.05 ? target.y() : ground;
          placePerson();
          person.position.y += Math.abs(Math.sin(tt * 12)) * 0.003 * (Math.abs(target.km - personKm) > 0.05 ? 1 : 0);
        }
        // resultado: cuando la inundación alcanza su máximo
        if (!outcome && t > 0 && time > T_SHORE + SIGMA * 0.8) {
          outcome = true;
          const waterAt = fl;
          const safeNow = personY > waterAt + 0.5;
          ctx.sound.splash();
          if (safeNow && decided === 'hill' && personY >= 30) {
            ctx.ro('msg', `<b>¡A salvo!</b> El agua subió unos ${RUNUP} m sobre el nivel del mar e inundó la zona baja. Desde la cota 30 m lo viste pasar. Recuerda: pueden venir más olas.`);
            ctx.award('tsunami');
          } else if (decided === 'house') {
            ctx.ro('msg', `El agua alcanzó ~${RUNUP} m: el segundo piso de una casa baja <b>no basta</b>. La evacuación vertical sólo es una opción en edificios altos preparados, cuando no alcanzas a llegar a zona alta.`);
          } else if (decided === 'hill' && !safeNow) {
            ctx.ro('msg', 'No alcanzaste a llegar al cerro: hay que salir <b>de inmediato</b>, apenas termina el sismo. Inténtalo otra vez.');
          } else if (decided === 'hill') {
            ctx.ro('msg', 'Te salvaste por poco, pero aún no llegabas a la cota 30 m. Sal <b>apenas termine el sismo</b>.');
          } else {
            ctx.ro('msg', 'El tsunami inundó la playa. Aunque en alta mar casi no se veía, cerca de la costa creció y entró tierra adentro. Inténtalo otra vez.');
          }
          ctx.sound.answer(safeNow && decided === 'hill' && personY >= 30);
        }
      },
    };
  },
};
