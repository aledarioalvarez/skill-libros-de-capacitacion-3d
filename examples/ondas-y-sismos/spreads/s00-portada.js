// Portadilla e índice.
import { h } from '../core/page.js';

export default {
  id: 'portada',
  title: 'Portadilla e índice',
  left: () => `
    <div class="title-page">
      <div class="kicker">Física · 1.° medio · Unidad 3</div>
      <h1>Ondas<br>y sismos</h1>
      <p class="sub">¿De qué forma se relacionan las ondas con los sismos?</p>
      <svg class="orn" viewBox="0 0 360 80" aria-hidden="true"><path d="M0 40h70l5-4 5 8 5-6 5 4 8-14 7 24 8-30 9 38 8-30 7 20 6-10 6 6 8-4 6 2h187" fill="none" stroke="#9a3b2a" stroke-width="2.2" stroke-linejoin="round"/></svg>
      <p style="font-size:20px;max-width:560px;margin:0 auto">Un libro en ocho pliegos. En cada uno, el diagrama se levanta de la página para que <b>predigas</b>, <b>pruebes</b> y <b>expliques</b>.</p>
      <p class="who">Adaptación interactiva:<br><b>Dr. Cristian Sepúlveda-Irribarra</b><br>Universidad de Los Lagos</p>
      <p style="font-size:15px;color:var(--ink2);margin-top:40px">Basado en las Bases Curriculares de Ciencias Naturales, 1.° medio (OA 13),<br>y en la Unidad 3 del Texto del Estudiante de Física 1.° medio (Mineduc).</p>
    </div>
    ${h.folio('i')}`,
  right: () => `
    ${h.head('Contenido', 'Índice')}
    <ol class="toc-list">
      ${[
        ['Lección 5', '¿Qué es un sismo?', 1],
        ['Lección 5', 'Ondas P, S, Love y Rayleigh', 2],
        ['Lección 5', 'Lo que las ondas revelan del interior de la Tierra', 3],
        ['Lección 6', 'El sismógrafo y el sismograma', 4],
        ['Lección 6', '¿Dónde fue? Localizar el epicentro', 5],
        ['Lección 6', 'Magnitud: la energía liberada', 6],
        ['Lección 6', 'Intensidad: lo que se siente', 7],
        ['Lección 6', 'Tsunamis', 8],
        ['Síntesis', '¿Cómo voy?', 9],
      ].map(([k, t, i]) => `<li><button data-goto="${i}"><span><span class="tk">${k}</span><span class="tt">${t}</span></span><span class="pg">${i * 2}</span></button></li>`).join('')}
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
