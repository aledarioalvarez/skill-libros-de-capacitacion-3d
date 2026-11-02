// Mide en qué segundo de cada narración se nombra cada botón, para sincronizar el cursor guía.
// Uso: node tools/cues.mjs --env "RUTA\.env" [--only id1,id2]
// Resultado: narracion/cues.json  →  { id: [{ t0, t1, target, accion }] }
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };

function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const envPath = opt('--env');
  if (!envPath) throw new Error('Falta GEMINI_API_KEY: pásala como variable de entorno o con --env RUTA');
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*"?([^"\s]+)"?/) || line.match(/GEMINI[^:=]*[:=]\s*"?([A-Za-z0-9._-]{20,})"?/i);
    if (m) return m[m.length - 1];
  }
  throw new Error(`No hay clave de Gemini en ${envPath}`);
}
const KEY = loadKey();
let MODEL = 'gemini-3.8-flash';
try { MODEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'narracion/voz.json'), 'utf8')).modeloVerificacion || MODEL; } catch { /* valor por defecto */ }

const guiones = JSON.parse(fs.readFileSync(path.join(ROOT, 'narracion/guiones.json'), 'utf8'));
const only = opt('--only')?.split(',');
const outPath = path.join(ROOT, 'narracion/cues.json');
const out = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {};

async function ask(mp3, phrases) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { inline_data: { mime_type: 'audio/mp3', data: fs.readFileSync(mp3).toString('base64') } },
        { text: `Escucha esta narración en español. Para cada frase de la lista, indica en segundos (con décimas) cuándo empieza y cuándo termina de pronunciarse en el audio. Lista:\n${phrases.map((p, i) => `${i + 1}. ${p}`).join('\n')}` },
      ] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: { type: 'ARRAY', items: { type: 'OBJECT', properties: { n: { type: 'INTEGER' }, inicio: { type: 'NUMBER' }, fin: { type: 'NUMBER' } }, required: ['n', 'inicio', 'fin'] } },
      },
    }),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${txt.slice(0, 400)}`);
  return JSON.parse(JSON.parse(txt).candidates[0].content.parts[0].text);
}

// estimación por posición en el texto (sólo para detectar tiempos absurdos)
const plain = (s) => s.replace(/<[^>]+>/g, ' ');
const estimate = (g, frase, dur) => {
  const t = plain(g.texto), i = t.indexOf(frase);
  return ((i + frase.length) / t.length) * dur;
};

for (const g of guiones) {
  if (only && !only.includes(g.id)) continue;
  if (!g.cues?.length) continue;
  const mp3 = path.join(ROOT, 'src/audio', `${g.id}.mp3`);
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).toString());
  const res = await ask(mp3, g.cues.map((c) => c.frase));
  let prev = 0;
  out[g.id] = g.cues.map((c, i) => {
    const hit = res.find((x) => x.n === i + 1);
    let t0 = hit?.inicio, t1 = hit?.fin;
    const est = estimate(g, c.frase, dur);
    const bad = !(t1 > t0) || t1 > dur + 0.3 || t0 < prev - 0.2 || Math.abs(t1 - est) > 6;
    if (bad) { t1 = est; t0 = Math.max(prev, est - 1.5); }
    prev = t0;
    console.log(`${g.id.padEnd(14)} ${String(t0.toFixed(1)).padStart(5)}–${t1.toFixed(1).padEnd(5)} s ${bad ? '(estimado)' : ''} ${c.frase}`);
    return { t0: +t0.toFixed(2), t1: +t1.toFixed(2), target: c.target, accion: c.accion };
  });
}
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Listo: narracion/cues.json');
