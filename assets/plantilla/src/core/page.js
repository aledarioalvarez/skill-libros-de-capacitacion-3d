// Piezas de página reutilizables (HTML) y su comportamiento: predicción con solapa, desafío con sello.
import { progress } from './progress.js';
import { sound } from './sound.js';

export const h = {
  head: (kicker, title) => `<header class="lh"><span class="kicker">${kicker}</span><h2>${title}</h2></header>`,
  folio: (n) => `<footer class="folio">${n}</footer>`,
  key: (html) => `<div class="key">${html}</div>`,
  note: (html) => `<aside class="margin">${html}</aside>`,
  /** Predice → solapa. options: [{t, ok}] */
  predict: (id, question, options, answer) => `
    <section class="predict" data-predict="${id}">
      <h3><span class="step">1</span> Predice</h3>
      <p class="q">${question}</p>
      <div class="opts" role="radiogroup" aria-label="Tu predicción">
        ${options.map((o, i) => `<label class="opt"><input type="radio" name="p-${id}" value="${i}" data-ok="${o.ok ? 1 : 0}"><span>${o.t}</span></label>`).join('')}
      </div>
      <div class="flap-wrap">
        <button class="flap" disabled aria-expanded="false"><span class="flap-front"><b>¿Por qué?</b> Levanta la solapa <i>después de predecir</i></span></button>
        <div class="flap-under" hidden><p class="verdict"></p>${answer}</div>
      </div>
    </section>`,
  test: (html) => `<section class="test"><h3><span class="step">2</span> Prueba</h3>${html}</section>`,
  challenge: (id, html) => `
    <section class="challenge" data-challenge="${id}">
      <div class="ch-text"><h3><span class="step">3</span> Desafío</h3>${html}</div>
      <div class="stamp-slot" aria-live="polite"><span class="stamp" aria-hidden="true">LOGRADO</span><span class="sr">Sello pendiente</span></div>
    </section>`,
  fig: (n, caption) => `<figure class="figcap"><span class="fn">Fig. ${n}</span> ${caption}</figure>`,
  btn: (act, label, cls = '') => `<button class="b ${cls}" data-act="${act}">${label}</button>`,
  slider: (id, label, min, max, step, val, unit = '') => `
    <label class="sl"><span class="sl-l">${label}</span>
      <input type="range" data-sl="${id}" min="${min}" max="${max}" step="${step}" value="${val}">
      <output data-out="${id}">${val}${unit}</output></label>`,
  readout: (id, html = '') => `<div class="readout" data-ro="${id}">${html}</div>`,
};

/** Activa las predicciones y sellos de una página ya insertada. */
export function bindPage(root, { onAward } = {}) {
  root.querySelectorAll('[data-predict]').forEach((sec) => {
    const id = sec.dataset.predict;
    const flap = sec.querySelector('.flap');
    const under = sec.querySelector('.flap-under');
    const radios = [...sec.querySelectorAll('input[type=radio]')];
    const prev = progress.prediction(id);
    const choose = (i, silent) => {
      radios.forEach((r) => r.closest('.opt').classList.toggle('chosen', +r.value === i));
      flap.disabled = false;
      flap.querySelector('i').textContent = 'ya predijiste: ábrela';
      if (!silent) { progress.setPrediction(id, i); sound.click(); }
    };
    radios.forEach((r) => r.addEventListener('change', () => choose(+r.value)));
    if (prev != null && radios[prev]) { radios[prev].checked = true; choose(prev, true); }
    flap.addEventListener('click', () => {
      const chosen = radios.find((r) => r.checked);
      if (!chosen) return;
      const ok = chosen.dataset.ok === '1';
      const v = under.querySelector('.verdict');
      const right = radios.find((r) => r.dataset.ok === '1').closest('.opt').textContent.trim();
      v.textContent = ok ? `✓ ¡Bien predicho! ${right}` : `✗ Era otra: ${right}`;
      v.className = `verdict ${ok ? 'ok' : 'no'}`;
      sec.classList.add('open');
      flap.setAttribute('aria-expanded', 'true');
      under.hidden = false;
      radios.forEach((r) => r.closest('.opt').classList.add(r.dataset.ok === '1' ? 'right' : 'wrong'));
      sound.answer(ok);
    });
  });
  root.querySelectorAll('[data-challenge]').forEach((sec) => {
    if (progress.hasStamp(sec.dataset.challenge)) markStamp(sec, false);
  });
  // los rangos muestran su valor
  root.querySelectorAll('input[type=range]').forEach((r) => {
    const out = root.querySelector(`[data-out="${r.dataset.sl}"]`);
    const unit = out ? out.textContent.replace(/^[-\d.,]+/, '') : '';
    r.addEventListener('input', () => { if (out && !out.dataset.custom) out.textContent = String(r.value).replace('.', ',') + unit; });
  });
  return {
    award(id) {
      const sec = root.querySelector(`[data-challenge="${id}"]`);
      if (!sec) return false; // el desafío está en la otra página
      if (progress.award(id)) {
        sound.stamp();
        if (sec) markStamp(sec, true);
        onAward?.(id);
        return true;
      }
      return false;
    },
  };
}

function markStamp(sec, animate) {
  const slot = sec.querySelector('.stamp-slot');
  slot.classList.add('got');
  if (animate) slot.classList.add('anim');
  slot.querySelector('.sr').textContent = 'Sello conseguido';
}
