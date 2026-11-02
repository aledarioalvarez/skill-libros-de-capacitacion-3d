// Portadilla e índice: se arman solos a partir de libro.config.js y de la lista de pliegos.
import { h } from '../core/page.js';

export default {
  id: 'portada',
  title: 'Portadilla e índice',
  left: ({ config: c, spreads }) => `
    <div class="title-page">
      <div class="kicker">${c.asignatura}</div>
      <h1>${c.tapa.join('<br>').replace(/<br>(\S{1,3})<br>/, ' $1<br>')}</h1>
      <p class="sub">${c.pregunta}</p>
      <svg class="orn" viewBox="0 0 360 80" aria-hidden="true"><path d="M0 40h70l5-4 5 8 5-6 5 4 8-14 7 24 8-30 9 38 8-30 7 20 6-10 6 6 8-4 6 2h187" fill="none" stroke="#9a3b2a" stroke-width="2.2" stroke-linejoin="round"/></svg>
      <p style="font-size:20px;max-width:560px;margin:0 auto">Un libro en ${spreads.filter((s) => s.stamp).length} pliegos. En cada uno, el diagrama se levanta de la página para que <b>predigas</b>, <b>pruebes</b> y <b>expliques</b>.</p>
      <p class="who">Adaptación interactiva:<br><b>${c.autor}</b><br>${c.institucion}</p>
      <p style="font-size:15px;color:var(--ink2);margin-top:40px">${c.base}</p>
    </div>
    ${h.folio('i')}`,
  right: ({ spreads }) => `
    ${h.head('Contenido', 'Índice')}
    <ol class="toc-list">
      ${spreads.map((s, i) => (i === 0 ? '' : `<li><button data-goto="${i}"><span><span class="tk">${(s.kicker || '').replace(/·.*/, '').trim()}</span><span class="tt">${s.title}</span></span><span class="pg">${i * 2}</span></button></li>`)).join('')}
    </ol>
    <div class="howto">
      <b>Cómo usar este libro</b>
      <ol>
        <li><b>Predice</b>: marca tu respuesta antes de mirar.</li>
        <li><b>Prueba</b>: usa los botones bajo el dibujo y observa.</li>
        <li><b>Desafío</b>: resuélvelo para ganar el sello del pliego.</li>
      </ol>
      <p style="margin:8px 0 0;font-size:16px;color:var(--ink2)">Arrastra para girar el libro, usa la rueda o dos dedos para acercar y las flechas ← → para cambiar de página.</p>
    </div>
    ${h.folio('ii')}`,
  mount(ctx) {
    ctx.$$('[data-goto]').forEach((b) => b.addEventListener('click', () => ctx.go(+b.dataset.goto)));
    return null;
  },
};
