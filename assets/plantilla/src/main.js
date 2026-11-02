import './style.css';
import * as THREE from 'three';
import { createStage } from './core/scene.js';
import { createBook, PW, PH } from './core/book.js';
import { createUI } from './core/ui.js';
import { bindPage } from './core/page.js';
import { label } from './core/labels.js';
import { progress } from './core/progress.js';
import { sound } from './core/sound.js';
import { narration } from './core/narration.js';
import { tween, stepTweens, setReducedMotion } from './core/tween.js';
import { ease } from './core/ink.js';
import { spreads } from './spreads/index.js';
import CFG from './libro.config.js';

const loader = document.getElementById('loader');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
setReducedMotion(reduced);

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch { return false; }
}

async function start() {
  if (!webglOK()) { document.body.classList.add('nogl'); loader.classList.add('done'); return; }
  try { await Promise.all([document.fonts.load('600 40px "Source Serif 4 Variable"'), document.fonts.load('400 20px "Caveat"')]); } catch { /* fuentes del sistema */ }

  const stage = createStage(document.getElementById('app'));
  const { renderer, css3d, css2d, scene, camera, controls } = stage;
  const book = createBook(stage);

  // ---------- cámara: encuadres ----------
  const views = {
    closed: { target: new THREE.Vector3(0.52, 0, 0.08), w: 1.5, h: 1.75, elev: 1.12 },
    book: { target: new THREE.Vector3(0, 0.03, 0.02), w: 2.3, h: 1.5, elev: 0.95 },
    read: { target: new THREE.Vector3(-0.5, 0.04, 0.0), w: 1.08, h: 1.4, elev: 1.25 },
    right: { target: new THREE.Vector3(0.5, 0.08, -0.12), w: 1.1, h: 1.25, elev: 0.95 },
  };
  function viewPose(v) {
    const vf = THREE.MathUtils.degToRad(camera.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    // la cápsula ocupa ~90 px abajo: se deja margen
    const dist = Math.max((v.w / 2) / Math.tan(hf / 2), (v.h * Math.sin(v.elev) / 2) / Math.tan(vf / 2) * 1.12) * 1.04;
    const pos = v.target.clone().add(new THREE.Vector3(0, Math.sin(v.elev), Math.cos(v.elev)).multiplyScalar(dist));
    return { pos, target: v.target.clone() };
  }
  let viewName = 'closed';
  function goView(name, dur = 1.1) {
    viewName = name;
    const p = viewPose(views[name]);
    const p0 = camera.position.clone(), t0 = controls.target.clone();
    return tween(dur, (t) => {
      camera.position.lerpVectors(p0, p.pos, t);
      controls.target.lerpVectors(t0, p.target, t);
    }, ease.inOut);
  }
  { const p = viewPose(views.closed); camera.position.copy(p.pos); controls.target.copy(p.target); }
  window.addEventListener('resize', () => goView(viewName, 0.01));

  // ---------- pliegos ----------
  let cur = -1;
  let live = null; // { spread, root, api, pickables }
  let busy = false;
  const ui = createUI({
    spreads,
    onGo: (i) => go(i),
    onPrev: () => go(cur - 1),
    onNext: () => go(cur + 1),
    onView: () => { ui.setRead(false); goView('book'); },
    onRead: (on) => goView(on ? 'read' : 'book'),
    onNarr: (on) => { narration.setAuto(on); if (on && live) narration.play(live.spread.id); else narration.stop(); },
  });
  narration.onBlocked(() => ui.hint('Toca la pantalla para escuchar la narración', 5000));
  narration.onChange((id, playing) => {
    document.querySelectorAll('[data-listen]').forEach((b) => {
      const on = playing && b.dataset.listen === id;
      b.classList.toggle('on', on);
      b.innerHTML = on ? '<span class="li-ic">❚❚</span> Pausa' : '<span class="li-ic">▶</span> Escuchar';
    });
  });

  function dispose(obj) {
    obj.traverse((o) => {
      o.geometry?.dispose?.();
      const m = o.material;
      (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => { mm.map?.dispose?.(); mm.dispose?.(); });
    });
  }

  async function unmount() {
    narration.stop();
    if (!live) return;
    const l = live;
    live = null;
    l.api?.stop?.();
    // los rótulos CSS2D viven en el DOM: el evento 'removed' sólo llega al grupo quitado, no a sus hijos,
    // así que se borran aquí para que no queden flotando sobre el pliego siguiente
    l.root.traverse((o) => { if (o.isCSS2DObject) { o.visible = false; o.element.remove(); } });
    await tween(0.35, (t) => l.root.scale.setY(Math.max(0.001, 1 - t)), ease.inOut);
    l.api?.dispose?.();
    l.root.parent?.remove(l.root);
    dispose(l.root);
  }

  function mount(i) {
    const s = spreads[i];
    const L = book.cssLeft.element, R = book.cssRight.element;
    const info = { spreads, config: CFG };
    L.innerHTML = s.left(info);
    R.innerHTML = s.right(info);
    if (narration.has(s.id)) {
      const b = document.createElement('button');
      b.className = 'listen';
      b.dataset.listen = s.id;
      b.setAttribute('aria-label', 'Escuchar la narración de este pliego');
      b.innerHTML = '<span class="li-ic">▶</span> Escuchar';
      b.addEventListener('click', () => { sound.unlock(); narration.toggle(s.id); });
      L.appendChild(b);
      if (narration.auto) setTimeout(() => { if (live?.spread === s) narration.play(s.id); }, 400);
    }
    L.dataset.spread = R.dataset.spread = s.id;
    const lift = new THREE.Group();
    lift.scale.y = 0.001;
    book.rightAnchor.add(lift);
    // el dibujo se diseña en coordenadas de página; cada pliego puede ajustar su escala
    const root = new THREE.Group();
    root.scale.setScalar(s.scale ?? 0.8);
    lift.add(root);
    const pickables = [];
    const bound = [bindPage(L), bindPage(R)];
    const ctx = {
      THREE, root, camera, scene, renderer, spreads, config: CFG,
      left: L, right: R,
      $: (sel) => R.querySelector(sel) || L.querySelector(sel),
      $$: (sel) => [...R.querySelectorAll(sel), ...L.querySelectorAll(sel)],
      act(name, fn) { ctx.$$(`[data-act="${name}"]`).forEach((b) => b.addEventListener('click', (e) => { sound.click(); fn(e, b); })); },
      slider(name, fn) { const el = ctx.$(`[data-sl="${name}"]`); el.addEventListener('input', () => fn(+el.value, el)); return el; },
      out(name, text) { const o = ctx.$(`[data-out="${name}"]`); if (o) { o.dataset.custom = '1'; o.innerHTML = text; } },
      ro(name, html) { const o = ctx.$(`[data-ro="${name}"]`); if (o) o.innerHTML = html; },
      award(id) { const ok = bound.some((b) => b.award(id)); if (ok) ui.hint('¡Sello conseguido!'); return ok; },
      label,
      sound,
      hint: (t, ms) => ui.hint(t, ms),
      pick(objects, fn) { pickables.push({ objects, fn }); },
      go,
    };
    const api = s.mount ? s.mount(ctx) : null;
    live = { spread: s, root: lift, api, pickables };
    tween(0.9, (t) => lift.scale.setY(Math.max(0.001, t)), ease.outBack).then(() => api?.lifted?.());
    document.title = `${s.title} · ${CFG.titulo}`;
    announce(`${s.kicker ? s.kicker + '. ' : ''}${s.title}`);
  }

  async function go(i, { instant = false, fromOpen = false } = {}) {
    // con el libro cerrado (flecha de la cápsula, índice, teclado), primero se abre la tapa
    if (!book.isOpen && !fromOpen) { if (i >= 0 && i < spreads.length) openBook(i); return; }
    if (busy || i < 0 || i >= spreads.length || i === cur) return;
    busy = true;
    ui.closeSheet();
    const dir = i > cur ? 1 : -1;
    const first = cur < 0;
    cur = i;
    ui.setCurrent(i);
    progress.setPage(i);
    history.replaceState(null, '', `#p${i}`);
    if (!first && !instant) {
      sound.turn();
      const unm = unmount();
      await book.turn(dir, async () => { await unm; mount(i); });
    } else {
      await unmount();
      mount(i);
    }
    busy = false;
  }

  // ---------- abrir ----------
  const startAt = (() => {
    const m = location.hash.match(/^#p(\d+)/);
    if (m) return Math.min(spreads.length - 1, +m[1]);
    return null;
  })();
  let opening = false;
  async function openBook(at) {
    if (opening || book.isOpen) return;
    opening = true;
    ui.openCta(false);
    sound.unlock();
    sound.turn();
    goView('book', 1.6);
    await book.open();
    await go(at ?? 0, { instant: true, fromOpen: true });
  }
  const saved = progress.get().page;
  if (startAt != null) {
    openBook(startAt);
  } else {
    ui.openCta(true, () => openBook(saved > 0 ? saved : 0));
    document.querySelector('.open-cta').textContent = saved > 0 ? `Seguir leyendo · ${spreads[saved].title}` : 'Abrir el libro';
  }
  // tocar la portada también abre
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!book.isOpen) { if (cur < 0 && !busy && document.querySelector('.open-cta') && !document.querySelector('.open-cta').hidden) document.querySelector('.open-cta').click(); return; }
    if (!live) return;
    for (const p of live.pickables) {
      const hit = ray.intersectObjects(p.objects.filter((o) => o.visible !== false), true)[0];
      if (hit) { p.fn(hit, e); break; }
    }
  });

  // enlaces directos (#p3) también con la página ya abierta
  window.addEventListener('hashchange', () => {
    const m = location.hash.match(/^#p(\d+)/);
    if (!m) return;
    const i = Math.min(spreads.length - 1, +m[1]);
    if (book.isOpen) go(i); else openBook(i);
  });

  // teclado
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    if (!book.isOpen) { if (e.key === 'Enter' || e.key === 'ArrowRight') document.querySelector('.open-cta')?.click(); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') go(cur + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(cur - 1);
    if (e.key === 'Escape') ui.closeSheet();
  });

  // aviso para lectores de pantalla
  const live2 = document.getElementById('a11yLive');
  function announce(t) { live2.textContent = t; }

  // ---------- bucle ----------
  const clock = new THREE.Clock();
  let t = 0;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(0.05, clock.getDelta());
    t += dt;
    stepTweens(dt);
    controls.update();
    live?.api?.update?.(dt, t);
    renderer.render(scene, camera);
    css3d.render(scene, camera);
    css2d.render(scene, camera);
  });
  loader.classList.add('done');
  // depuración desde la consola
  window.__libro = { go, spreads, scene, camera, book, get live() { return live; } };
}

start();
