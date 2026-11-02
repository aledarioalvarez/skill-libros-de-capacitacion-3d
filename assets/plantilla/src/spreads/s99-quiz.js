// Pliego final · ¿Cómo voy? Preguntas de síntesis con retroalimentación y la colección de sellos.
// Edita QS: q = pregunta, o = alternativas, a = índice de la correcta, f = retroalimentación (por qué).
import { h } from '../core/page.js';
import { progress } from '../core/progress.js';

const QS = [
  { q: 'Pregunta de síntesis 1…', o: ['Alternativa A', 'Alternativa B', 'Alternativa C'], a: 1, f: 'Explicación breve de la respuesta correcta.' },
  { q: 'Pregunta de síntesis 2…', o: ['Alternativa A', 'Alternativa B', 'Alternativa C'], a: 0, f: 'Explicación breve de la respuesta correcta.' },
];
const HALF = Math.ceil(QS.length / 2);

export default {
  id: 'quiz',
  kicker: 'Síntesis',
  title: '¿Cómo voy?',
  left: ({ spreads }) => `
    ${h.head('Síntesis y evaluación', '¿Cómo voy?')}
    ${QS.slice(0, HALF).map((q, i) => quizQ(q, i)).join('')}
    ${h.folio(spreads.length * 2 - 2)}`,
  right: ({ spreads, config }) => `
    <div style="padding-top:4px"></div>
    ${QS.slice(HALF).map((q, i) => quizQ(q, i + HALF)).join('')}
    <div class="howto" style="margin-top:10px">
      <b>Puntaje: <span data-ro="score">0</span> / ${QS.length}</b> · Sellos: <span data-ro="stamps"></span>
      <p style="margin:6px 0 0;font-size:17px">Para cerrar: con tus palabras, <b>${config.pregunta}</b> Escríbelo en tu cuaderno.</p>
    </div>
    ${h.folio(spreads.length * 2 - 1)}`,
  mount(ctx) {
    const saved = progress.get().quiz || {};
    const score = () => ctx.ro('score', String(Object.entries(progress.get().quiz || {}).filter(([k, v]) => QS[+k] && v === QS[+k].a).length));
    const stamps = ctx.spreads.map((s) => s.stamp).filter(Boolean);
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
