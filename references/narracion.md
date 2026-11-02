# Narración y cursor guía

Contenido: 1. Qué hace en el libro · 2. Escribir los guiones · 3. La clave de Gemini ·
4. Generar y verificar la voz · 5. Tiempos del cursor · 6. API de Gemini TTS (referencia)

## 1. Qué hace en el libro

- Cada pliego con `src/audio/<id>.mp3` muestra el botón **▶ Escuchar** en la página izquierda.
- La narración automática viene **activada por defecto**: suena al abrir el libro y al pasar de
  página. El botón de audífonos de la cápsula la apaga o la enciende (se recuerda por navegador).
- Si el navegador bloquea el audio (enlace directo sin interacción previa), aparece
  «Toca la pantalla para escuchar la narración» y el audio parte con el primer toque.
- El **cursor guía** (`src/core/cursor.js`) sigue el reloj del audio: viaja hasta cada botón
  y llega cuando la voz lo nombra. Solo **simula** el gesto (el botón se hunde, aparece una
  onda); la acción real la hace el estudiante. Si se pausa la voz, el cursor espera; al cambiar
  de página desaparece.
- Al terminar el audio, el control indicado en `cta` destella unos segundos.

## 2. Escribir los guiones (`narracion/guiones.json`)

```json
{
  "id": "sismo",
  "emocion": "calm and explanatory, slightly intrigued when describing the rupture",
  "cta": "[data-act=\"charge\"]",
  "texto": "… Ahora experimenta: mantén presionado el botón «Acumular tensión» … haz clic en «¡Liberar!». …",
  "cues": [
    { "frase": "mantén presionado el botón «Acumular tensión»", "target": "[data-act=\"charge\"]", "accion": "press" },
    { "frase": "haz clic en «¡Liberar!»", "target": "[data-act=\"release\"]", "accion": "click" }
  ]
}
```

Cómo escribirlos:
- Oral y cercano, como un profesor que acompaña: 25–45 s (unas 70–110 palabras).
- Estructura: idea central en 2–3 frases → **invitación a predecir** → **invitación a
  experimentar nombrando el botón exacto** entre comillas «» → qué observar → el desafío.
  La narración no es la página leída en voz alta: es la guía de la experiencia.
- Números y siglas como se dicen ("seis a siete centímetros", "mil novecientos sesenta").
- Etiquetas en línea permitidas: `<short pause>`, `<long pause>`, `<breath>`, `<sigh>`, `<laugh>`.
- `emocion` en inglés (se agrega al estilo base); `id` igual al del pliego.
- `cues`: una por cada invitación. `frase` debe aparecer **textual** dentro de `texto`.
  `target` es un selector dentro de las páginas (o de la cápsula si empieza con `[data-u`).
- `accion`: `click` (botón), `press` (mantener presionado), `drag` / `drag-left` (mover un
  rango a la derecha / izquierda), `point` (señalar con un círculo: predicción, desafío, campos).
- Revisa que cada etiqueta nombrada exista tal cual en el HTML del pliego.

El ejemplo completo está en `examples/ondas-y-sismos/narracion/guiones.json`.

## 3. La clave de Gemini

- Pide al usuario la ruta del `.env` si no la sabes, y no la supongas: verifica que el archivo exista.
- Las herramientas aceptan `GEMINI_API_KEY=…`, `GOOGLE_API_KEY=…` o una línea anotada a mano
  como `API KEY - GEMINI …: clave`, y **nunca la imprimen**.
- No inspecciones el `.env` con `cat`, `grep`, `sed` ni similares: una línea con formato
  inesperado se imprime entera y la clave queda en la conversación (pasó una vez). Si
  necesitas saber si existe, deja que `tts.mjs` lo diga ("No hay GEMINI_API_KEY en …").
- Leer credenciales de otro proyecto requiere permiso explícito del usuario.

## 4. Generar y verificar la voz

```bash
node tools/tts.mjs --env "RUTA\.env"                 # genera lo que falte y verifica todo
node tools/tts.mjs --env "RUTA\.env" --only sismo --force   # rehace un audio
node tools/tts.mjs --env "RUTA\.env" --verify-only   # solo vuelve a transcribir y comparar
```

- Voz y estilo salen de `narracion/voz.json` (por defecto Charon, `es-CL`, dirección chilena).
- Cada audio se guarda en `narracion/wav/` y se convierte a MP3 mono 48 kb/s en `src/audio/`
  (≈ 0,2–0,3 MB por pliego; requiere `ffmpeg`).
- Verificación: transcribe con `gemini-3.8-flash` y compara palabra a palabra con el guion.
  Revisa a mano (`narracion/verificacion.json`) todo lo que esté bajo 95 %: si la diferencia
  es solo de formato (cifras en vez de palabras) está bien; si cambió una palabra o un número
  ("12 km" donde el guion dice "trece"), regenera ese audio y vuelve a verificar.
- Si un modelo responde 404, lista los disponibles con
  `GET https://generativelanguage.googleapis.com/v1beta/models` (cabecera `x-goog-api-key`) y
  ajusta `modeloVerificacion` en `voz.json`.

## 5. Tiempos del cursor

```bash
node tools/cues.mjs --env "RUTA\.env"   # → narracion/cues.json
```

Gemini escucha cada audio y devuelve en qué segundo empieza y termina cada `frase`. La
herramienta descarta tiempos incoherentes (fuera del audio, desordenados o muy lejos de la
posición esperada en el texto) y en ese caso usa una estimación, marcada "(estimado)".
Comprueba al menos dos tramos: recórtalos y transcríbelos.

```bash
ffmpeg -y -loglevel error -ss 22.0 -to 24.8 -i src/audio/sismo.mp3 tramo.mp3
```

Si cambias un guion, regenera su audio **y** sus tiempos (`--only id` en ambas herramientas)
y vuelve a compilar: los audios y los tiempos quedan incrustados en `dist/index.html`.

## 6. API de Gemini TTS (referencia)

`POST https://generativelanguage.googleapis.com/v1beta/interactions` con cabecera `x-goog-api-key`:

```json
{
  "model": "gemini-3.8-flash-tts",
  "input": [{ "type": "user_input", "content": [{ "type": "text", "text": "transcripción literal",
    "annotations": [{ "type": "speech_metadata", "style": "estilo + emoción", "language": "es-CL" }] }] }],
  "response_format": { "type": "audio" },
  "generation_config": { "speech_config": [{ "voice": "Charon" }] }
}
```

El audio viene en `steps[type=model_output].content[type=audio].data` (base64, WAV). Las
indicaciones de actuación van en `speech_metadata.style`, nunca dentro del texto (el modelo lo
lee literalmente). Documentación: https://ai.google.dev/gemini-api/docs/speech-generation
