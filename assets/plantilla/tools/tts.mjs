// Genera la narración del libro con Gemini TTS (Interactions API) y la verifica transcribiéndola.
// Uso: node tools/tts.mjs --env "RUTA\.env" [--only id1,id2] [--force] [--verify-only]
// La clave se lee de GEMINI_API_KEY (variable de entorno o archivo .env); nunca se imprime.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const flag = (k) => args.includes(k);

function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const envPath = opt('--env');
  if (!envPath) throw new Error('Falta GEMINI_API_KEY: pásala como variable de entorno o con --env RUTA');
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*"?([^"\s]+)"?/);
    if (m) return m[2];
    // también acepta una línea anotada a mano: "API KEY - GEMINI ...: clave"
    const n = line.match(/GEMINI[^:=]*[:=]\s*"?([A-Za-z0-9._-]{20,})"?/i);
    if (n) return n[1];
  }
  throw new Error(`No hay GEMINI_API_KEY en ${envPath}`);
}
const KEY = loadKey();

// voz y estilo del libro (narracion/voz.json); por defecto Charon con dirección chilena
const VOZ = { modelo: 'gemini-3.8-flash-tts', voz: 'Charon', idioma: 'es-CL', estilo: 'Native Chilean Spanish speaker from Santiago, natural and unmistakable Chilean accent and intonation (soft aspirated final s, Chilean melody), warm, close and professional university teacher; calm unhurried pace, never commercial or theatrical.', modeloVerificacion: 'gemini-3.8-flash' };
try { Object.assign(VOZ, JSON.parse(fs.readFileSync(path.join(ROOT, 'narracion/voz.json'), 'utf8'))); } catch { /* se usan los valores por defecto */ }
const MODEL = VOZ.modelo;
const VOICE = VOZ.voz;
const BASE_STYLE = VOZ.estilo;
const CHECK_MODEL = VOZ.modeloVerificacion;

const guiones = JSON.parse(fs.readFileSync(path.join(ROOT, 'narracion/guiones.json'), 'utf8'));
const only = opt('--only')?.split(',');
const WAV = path.join(ROOT, 'narracion/wav');
const OUT = path.join(ROOT, 'src/audio');
fs.mkdirSync(WAV, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

async function post(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${txt.slice(0, 600)}`);
  return JSON.parse(txt);
}

async function synth(g, withLanguage = true) {
  const annotation = { type: 'speech_metadata', style: `${BASE_STYLE} Emotion for this passage: ${g.emocion}.` };
  if (withLanguage) annotation.language = VOZ.idioma;
  const body = {
    model: MODEL,
    input: [{ type: 'user_input', content: [{ type: 'text', text: g.texto, annotations: [annotation] }] }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice: VOICE }] },
  };
  try {
    const res = await post('https://generativelanguage.googleapis.com/v1beta/interactions', body);
    const audio = (res.steps || []).filter((s) => s.type === 'model_output').flatMap((s) => s.content || []).filter((c) => c.type === 'audio').pop();
    if (!audio?.data) throw new Error('La respuesta no trae audio');
    return Buffer.from(audio.data, 'base64');
  } catch (e) {
    // si el campo de idioma no es aceptado, se reintenta sin él (el estilo ya pide español de Chile)
    if (withLanguage && /language/i.test(e.message)) return synth(g, false);
    throw e;
  }
}

const norm = (s) => s.toLowerCase().replace(/<[^>]+>/g, ' ').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').split(/\s+/).filter(Boolean);
function similarity(a, b) {
  // proporción de palabras del guion que aparecen en orden en la transcripción (LCS / largo)
  const x = norm(a), y = norm(b);
  const dp = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) dp[i][j] = x[i - 1] === y[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[x.length][y.length] / x.length;
}

async function transcribe(mp3) {
  const res = await post(`https://generativelanguage.googleapis.com/v1beta/models/${CHECK_MODEL}:generateContent`, {
    contents: [{ parts: [
      { inline_data: { mime_type: 'audio/mp3', data: fs.readFileSync(mp3).toString('base64') } },
      { text: 'Transcribe literalmente este audio en español. Devuelve solo la transcripción, sin comentarios.' },
    ] }],
  });
  return res.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
}

const report = [];
for (const g of guiones) {
  if (only && !only.includes(g.id)) continue;
  const wav = path.join(WAV, `${g.id}.wav`), mp3 = path.join(OUT, `${g.id}.mp3`);
  if (!flag('--verify-only') && (flag('--force') || !fs.existsSync(mp3))) {
    process.stdout.write(`🎙  ${g.id} … `);
    const buf = await synth(g);
    fs.writeFileSync(wav, buf);
    // mp3 mono 48 kb/s: liviano para incrustar en el archivo único
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3]);
    console.log('ok');
  }
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).toString());
  const tr = await transcribe(mp3);
  const sim = similarity(g.texto, tr);
  report.push({ id: g.id, dur: dur.toFixed(1), sim: (sim * 100).toFixed(0) + '%', tr });
  console.log(`✔ ${g.id}: ${dur.toFixed(1)} s · coincidencia ${(sim * 100).toFixed(0)} %`);
}
fs.writeFileSync(path.join(ROOT, 'narracion/verificacion.json'), JSON.stringify(report, null, 2));
console.log('Informe: narracion/verificacion.json');
