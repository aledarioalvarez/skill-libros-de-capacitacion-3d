// Progreso del estudiante (sellos, predicciones, última página) guardado sólo en este navegador.
import CFG from '../libro.config.js';

const KEY = CFG.storageKey;
let state = { stamps: {}, predictions: {}, page: 0, muted: false, quiz: {}, autoNarr: true };
try {
  const raw = localStorage.getItem(KEY);
  if (raw) state = { ...state, ...JSON.parse(raw) };
} catch { /* almacenamiento bloqueado: se trabaja en memoria */ }

const listeners = new Set();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* sin almacenamiento */ }
  listeners.forEach((f) => f(state));
}

export const progress = {
  get: () => state,
  onChange: (f) => listeners.add(f),
  hasStamp: (id) => !!state.stamps[id],
  award(id) {
    if (state.stamps[id]) return false;
    state.stamps[id] = Date.now();
    save();
    return true;
  },
  stampCount: () => Object.keys(state.stamps).length,
  setPrediction(id, v) { state.predictions[id] = v; save(); },
  prediction: (id) => state.predictions[id],
  setPage(i) { state.page = i; save(); },
  setMuted(v) { state.muted = v; save(); },
  setQuiz(id, v) { state.quiz[id] = v; save(); },
  setAutoNarr(v) { state.autoNarr = v; save(); },
  reset() { state = { stamps: {}, predictions: {}, page: 0, muted: state.muted, quiz: {}, autoNarr: state.autoNarr }; save(); },
};
