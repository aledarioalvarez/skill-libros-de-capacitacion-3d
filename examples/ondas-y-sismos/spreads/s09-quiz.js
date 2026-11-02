// Pliego final · ¿Cómo voy? Preguntas de síntesis con retroalimentación y la colección de sellos.
import { h } from '../core/page.js';
import { progress } from '../core/progress.js';

const QS = [
  { q: 'El punto de la superficie justo sobre el foco de un sismo es…', o: ['el hipocentro', 'el epicentro', 'el área de ruptura'], a: 1, f: 'El epicentro es la proyección vertical del hipocentro (foco).' },
  { q: '¿Qué ondas sísmicas no se propagan en líquidos?', o: ['Las ondas P', 'Las ondas S', 'Ninguna'], a: 1, f: 'Las S son transversales: un líquido no resiste el corte, por eso no las transmite.' },
  { q: 'En un sismograma, ¿qué llega primero?', o: ['Ondas superficiales', 'Ondas S', 'Ondas P'], a: 2, f: 'Las P son las más rápidas (≈ 6 km/s en la corteza).' },
  { q: 'Una estación mide t<sub>S</sub> − t<sub>P</sub> = 25 s. ¿A qué distancia aproximada está el epicentro?', o: ['≈ 25 km', '≈ 200 km', '≈ 1000 km'], a: 1, f: 'd ≈ 8 km/s × 25 s = 200 km.' },
  { q: '¿Qué miden la magnitud y la intensidad, respectivamente?', o: ['La energía liberada y los efectos en un lugar', 'Los efectos y la energía', 'Lo mismo, en escalas distintas'], a: 0, f: 'Magnitud: energía en el origen (una por sismo). Intensidad: efectos en cada lugar (Mercalli).' },
  { q: 'Un sismo de magnitud 9 frente a uno de magnitud 7 libera…', o: ['el doble de energía', '≈ 100 veces más', '≈ 1000 veces más'], a: 2, f: '2 grados: 32 × 32 ≈ 1000 veces más energía.' },
  { q: 'La zona de sombra de las ondas S mostró que…', o: ['el núcleo externo es líquido', 'el manto es líquido', 'la corteza es muy delgada'], a: 0, f: 'Gutenberg (1914): las S no cruzan el núcleo externo, que es líquido.' },
  { q: 'Estás en la costa y el sismo no te deja mantenerte en pie. ¿Qué haces?', o: ['Espero la alarma oficial', 'Voy en auto a ver el mar', 'Camino de inmediato a una zona sobre 30 m'], a: 2, f: 'Evacuar de inmediato a pie a zona alta; no bajar hasta que se levante la alerta.' },
];

export default {
  id: 'quiz',
  kicker: 'Síntesis',
  title: '¿Cómo voy?',
  left: () => `
    ${h.head('Síntesis y evaluación', '¿Cómo voy?')}
    ${QS.slice(0, 4).map((q, i) => quizQ(q, i)).join('')}
    ${h.folio(18)}`,
  right: () => `
    <div style="padding-top:4px"></div>
    ${QS.slice(4).map((q, i) => quizQ(q, i + 4)).join('')}
    <div class="howto" style="margin-top:10px">
      <b>Puntaje: <span data-ro="score">0</span> / ${QS.length}</b> · Sellos: <span data-ro="stamps"></span>
      <p style="margin:6px 0 0;font-size:17px">Para cerrar: con tus palabras, <b>¿de qué forma se relacionan las ondas con los sismos?</b> Escríbelo en tu cuaderno usando: energía, propagación, ondas P y S, rapidez.</p>
    </div>
    ${h.folio(19)}`,
  mount(ctx) {
    const saved = progress.get().quiz || {};
    const score = () => ctx.ro('score', String(Object.entries(progress.get().quiz || {}).filter(([k, v]) => QS[+k] && v === QS[+k].a).length));
    const stamps = ['sismo', 'ondas', 'interior', 'sismografo', 'triangulacion', 'magnitud', 'intensidad', 'tsunami'];
    ctx.ro('stamps', `${stamps.filter((s) => progress.hasStamp(s)).length} de ${stamps.length}`);
    const mark = (i, pick, sound) => {
      const box = ctx.$(`[data-q="${i}"]`);
      box.querySelectorAll('.b').forEach((b, j) => {
        b.classList.toggle('right', j === QS[i].a);
        b.classList.toggle('wrong', j === pick && pick !== QS[i].a);
        b.disabled = true;
      });
      box.querySelector('.fb').innerHTML = (pick === QS[i].a ? '✓ ' : '✗ ') + QS[i].f;
      if (sound) ctx.sound.answer(pick === QS[i].a);
    };
    QS.forEach((q, i) => {
      if (saved[i] != null) mark(i, saved[i], false);
      ctx.$$(`[data-q="${i}"] .b`).forEach((b, j) => b.addEventListener('click', () => {
        progress.setQuiz(i, j);
        mark(i, j, true);
        score();
      }));
    });
    score();
    return null;
  },
};

function quizQ(q, i) {
  return `<div class="quiz-q" data-q="${i}"><p>${i + 1}. ${q.q}</p><div class="qo">${q.o.map((o) => `<button class="b">${o}</button>`).join('')}</div><div class="fb"></div></div>`;
}
