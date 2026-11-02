// Cápsula de navegación (pantalla), índice desplegable y avisos.
import { progress } from './progress.js';
import CFG from '../libro.config.js';

const icon = {
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  sound: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  view: '<svg viewBox="0 0 24 24"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  read: '<svg viewBox="0 0 24 24"><path d="M3 6c3-1 6-1 9 1 3-2 6-2 9-1v12c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 7v12"/></svg>',
  narr: '<svg viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>',
  teacher: '<svg viewBox="0 0 24 24"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c1.6 1.4 3.6 2 6 2s4.4-.6 6-2v-5"/></svg>',
};

export function createUI({ spreads, onGo, onPrev, onNext, onView, onRead, onNarr }) {
  const root = document.getElementById('ui');
  root.innerHTML = `
    <nav class="capsule" aria-label="Navegación del libro">
      <button class="ic" data-u="menu" aria-label="Índice" aria-expanded="false">${icon.menu}</button>
      <button class="ic" data-u="prev" aria-label="Página anterior">${icon.prev}</button>
      <div class="cap-title"><span class="cap-n"></span><span class="cap-t">${CFG.titulo}</span></div>
      <button class="ic" data-u="next" aria-label="Página siguiente">${icon.next}</button>
      <span class="sep"></span>
      <span class="stamps-count" title="Sellos conseguidos"><b>0</b>/<span class="tot"></span></span>
      <button class="ic" data-u="read" aria-label="Acercar para leer" aria-pressed="false">${icon.read}</button>
      <button class="ic" data-u="view" aria-label="Volver a la vista del libro">${icon.view}</button>
      <button class="ic" data-u="narr" aria-label="Narración automática al cambiar de página" aria-pressed="${progress.get().autoNarr ? 'true' : 'false'}">${icon.narr}</button>
      <button class="ic" data-u="sound" aria-label="Silenciar sonido">${icon.sound}</button>
      <a class="ic" href="docentes.html" target="_blank" rel="noopener" aria-label="Notas para docentes">${icon.teacher}</a>
    </nav>
    <div class="sheet" hidden role="dialog" aria-label="Índice">
      <h2>Índice</h2>
      <ol class="toc"></ol>
      <p class="sheet-foot"><button class="linkish" data-u="reset">Borrar mi progreso</button></p>
    </div>
    <div class="hint" hidden></div>
    <button class="open-cta" hidden>Abrir el libro</button>`;
  const $ = (s) => root.querySelector(s);
  const sheet = $('.sheet');
  const toc = $('.toc');
  const challengeCount = spreads.filter((s) => s.stamp).length;
  $('.tot').textContent = challengeCount;

  function renderToc(current) {
    toc.innerHTML = spreads.map((s, i) => `
      <li><button data-go="${i}" class="${i === current ? 'cur' : ''}">
        <span class="tn">${s.kicker || ''}</span><span class="tt">${s.title}</span>
        ${s.stamp ? `<span class="ts ${progress.hasStamp(s.stamp) ? 'got' : ''}" aria-label="${progress.hasStamp(s.stamp) ? 'con sello' : 'sin sello'}">●</span>` : ''}
      </button></li>`).join('');
  }

  const toggleSheet = (v = sheet.hidden) => {
    sheet.hidden = !v;
    $('[data-u=menu]').setAttribute('aria-expanded', String(v));
  };

  root.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const u = b.dataset.u;
    if (b.dataset.go) { toggleSheet(false); onGo(+b.dataset.go); return; }
    if (u === 'menu') toggleSheet();
    if (u === 'prev') onPrev();
    if (u === 'next') onNext();
    if (u === 'view') onView();
    if (u === 'narr') { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); onNarr(on); }
    if (u === 'read') { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); onRead(on); }
    if (u === 'sound') {
      const m = !progress.get().muted;
      progress.setMuted(m);
      b.innerHTML = m ? icon.mute : icon.sound;
      b.setAttribute('aria-label', m ? 'Activar sonido' : 'Silenciar sonido');
    }
    if (u === 'reset' && confirm('¿Borrar sellos, predicciones y respuestas guardadas en este navegador?')) { progress.reset(); location.reload(); }
  });
  if (progress.get().muted) { $('[data-u=sound]').innerHTML = icon.mute; }

  const updateStamps = () => { $('.stamps-count b').textContent = Object.keys(progress.get().stamps).filter((k) => spreads.some((s) => s.stamp === k)).length; };
  progress.onChange(updateStamps);
  updateStamps();

  let hintT;
  return {
    setCurrent(i) {
      const s = spreads[i];
      $('.cap-n').textContent = s.kicker ? s.kicker.replace(/·.*/, '').trim() : '';
      $('.cap-t').textContent = s.title;
      $('[data-u=prev]').disabled = i <= 0;
      $('[data-u=next]').disabled = i >= spreads.length - 1;
      renderToc(i);
    },
    hint(text, ms = 3500) {
      const el = $('.hint');
      el.textContent = text;
      el.hidden = false;
      clearTimeout(hintT);
      hintT = setTimeout(() => (el.hidden = true), ms);
    },
    openCta(show, onClick) {
      const b = $('.open-cta');
      b.hidden = !show;
      if (onClick) b.onclick = onClick;
    },
    setRead(v) { $('[data-u=read]').setAttribute('aria-pressed', String(v)); },
    closeSheet: () => toggleSheet(false),
  };
}
