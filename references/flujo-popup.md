---
name: libro-3d-interactivo
description: >
  Construye libros educativos interactivos en 3D tipo pop-up (estilo "Every Joule"): un libro
  de tapa de tela sobre un escritorio, con páginas HTML reales y, en cada pliego, un diagrama
  a tinta que se levanta de la página para que el estudiante Prediga → Pruebe → resuelva un
  Desafío y gane un sello. Hecho con Three.js, se entrega como un único index.html (sin
  internet, listo para hosting o Moodle) más notas docentes, con narración por pliego en voz
  chilena (Gemini TTS, verificada transcribiendo) y un cursor guía que hace el gesto justo
  cuando la voz nombra cada botón. Sirve para cualquier asignatura y nivel: física, química,
  biología, matemática, historia, geografía, tecnología. Activa esta skill SIEMPRE que el
  usuario pida crear, adaptar, ampliar o corregir un "libro 3D", "libro interactivo en 3D",
  "libro pop-up", "un libro como Every Joule", "que los diagramas se levanten de la página",
  "convierte esta unidad/este PDF/este capítulo en un libro 3D", "un recurso 3D con Three.js
  para mis estudiantes", o cuando quiera agregar un pliego, regenerar la narración, ajustar el
  cursor guía o publicar uno de estos libros (p. ej. el libro "Ondas y sismos"). NO la actives
  para cápsulas e-learning por pantallas (capsula-*), escape rooms, juegos arcade, organizadores
  gráficos sueltos (diagramacion-animada) ni videos; sí actívala si una de esas piezas debe
  vivir dentro de un libro 3D.
---

# libro-3d-interactivo

Construyes libros de texto en 3D donde **cada diagrama es un modelo manipulable** que se levanta
de la página. El estudiante no lee sobre el fenómeno: predice qué pasará, lo provoca con el
modelo, ve el resultado y lo aplica en un desafío. El libro final es un solo `index.html` que
funciona sin internet, más `docentes.html`.

La skill trae un motor probado (plantilla), un libro completo de referencia ("Ondas y sismos",
Física 1.° medio, Chile) y las herramientas de narración. No reinventes el motor: copia la
plantilla y dedica el esfuerzo a la didáctica, la exactitud y los modelos de cada pliego.

## Qué hay en la skill

| Ruta | Para qué |
|---|---|
| `scripts/nuevo-libro.mjs` | Crea el proyecto desde la plantilla e instala dependencias |
| `assets/plantilla/` | Motor completo: libro 3D, páginas CSS3D, tinta, rótulos, cápsula, sellos, sonido, narración, cursor guía, herramientas TTS |
| `examples/ondas-y-sismos/` | 8 pliegos reales, física (trazado de rayos, sismogramas), guiones, tiempos del cursor y notas docentes completas |
| `references/arquitectura.md` | API del motor: coordenadas, `ctx`, piezas de página, tinta, rótulos. **Léela antes de escribir un pliego** |
| `references/diseno-pliegos.md` | Didáctica de cada pliego y catálogo de patrones de interacción probados |
| `references/narracion.md` | Guiones con invitaciones a interactuar, Gemini TTS, verificación, cursor guía |
| `references/qa.md` | Lista de control y fragmentos de prueba en el navegador |
| `references/despliegue.md` | Compilar, abrir local, hosting, Moodle, enlaces directos |
| `references/lecciones-aprendidas.md` | Errores ya resueltos y cómo no repetirlos |

## Valores por defecto (ajústalos a quien lo pide)

- Español de Chile en textos y narración; los créditos (autor, institución) salen de `src/libro.config.js`: pregúntalos si no los sabes.
- Narración con voz **Charon + dirección chilena** (`gemini-3.8-flash-tts`), automática al abrir el libro y al pasar de página, con invitaciones explícitas a hacer clic y un cursor guía que **solo simula** el gesto: la acción la hace el estudiante. Cambia voz e idioma en `narracion/voz.json`.
- Cada libro en su propia carpeta de proyecto (p. ej. `Proyectos/NOMBRE DEL LIBRO`).
- **Nunca imprimas claves de API**: ni con `cat`, `grep` o `sed` sobre un `.env`. Las herramientas leen la clave sin mostrarla (ver `references/narracion.md`).

## Flujo de trabajo

Trabaja por fases. Avisa en una línea al pasar de una a otra; el usuario sigue el progreso desde el plan.

### Fase 0 · Encuadre

Necesitas: el material fuente (PDF de la unidad, capítulo o tema), asignatura y nivel, país o
currículum, y la carpeta del proyecto. Si el mensaje ya lo trae, no preguntes. Si falta algo,
pregúntalo junto en una sola tanda. Supuestos por defecto (decláralos al usuario y sigue):
libro para docentes que lo usan con sus estudiantes, 6 a 9 pliegos, HTML único para hosting,
narración activada.

### Fase 1 · Leer y anclar en el currículum

- PDF: `pdftotext -layout archivo.pdf salida.txt` (la lectura directa de PDF puede fallar sin poppler).
  Si el texto sale con codificación rara, igual es legible; no lo conviertas.
- Identifica el **objetivo de aprendizaje** (en Chile, el OA de las Bases Curriculares) y
  **verifícalo con una búsqueda**: no lo cites de memoria (en el libro de referencia se creía OA 12 y era OA 13).
- Mientras lees, anota **simplificaciones o errores del texto escolar** y datos desactualizados
  (instituciones que cambiaron de nombre, cifras). Van a las notas docentes como "precisiones".

### Fase 2 · Mapa de pliegos

Propón el mapa en una tabla breve: pliego → idea central → **modelo 3D manipulable** → predicción → desafío.
Cada pliego debe tener un modelo cuyo comportamiento **dependa del concepto** (no una ilustración
decorativa) y un desafío que solo se resuelve aplicando el concepto. Consulta el catálogo de
patrones en `references/diseno-pliegos.md` para elegir mecánicas. Si el usuario ya pidió
"hazlo", presenta el mapa y continúa sin esperar.

### Fase 3 · Crear el proyecto

```bash
node "<carpeta de la skill>/scripts/nuevo-libro.mjs" "<carpeta del proyecto nuevo>"
```

Si la sesión no está en esa carpeta, muévela allí (herramienta de cambio de carpeta) antes de
editar. Luego edita `src/libro.config.js` (título, líneas de la tapa, pregunta de la unidad,
asignatura, color de tapa, ornamento, `storageKey` único) y borra `s01-ejemplo.js` cuando
tengas tus pliegos.

### Fase 4 · Construir los pliegos

1. Lee `references/arquitectura.md` y `references/diseno-pliegos.md`, y abre el pliego del
   ejemplo más parecido a lo que vas a hacer.
2. Si un modelo calcula algo (trayectorias, tiempos, energías), **prototipa la física en Node
   primero** y compárala con valores conocidos antes de dibujarla (así se ajustó el modelo de
   rapidez sísmica hasta reproducir las zonas de sombra reales de ~104°).
3. Construye 2 pliegos, pruébalos en el navegador (Fase 5) y recién entonces los demás:
   los problemas de escala, rótulos y encuadre aparecen en los primeros.
4. Registra cada pliego en `src/spreads/index.js` y actualiza las preguntas de `s99-quiz.js`.

### Fase 5 · Probar en el navegador

Sigue `references/qa.md`. Como mínimo, en cada pliego: sin errores en consola, el texto cabe
en la página, el dibujo no se sale del papel, los rótulos no se tapan ni cruzan al otro lado,
el desafío entrega el sello y, al cambiar de pliego, no quedan rótulos del anterior.
Prueba los flujos con JavaScript (`window.__libro.go(n)`, clics simulados) y confirma con capturas.

### Fase 6 · Narración y cursor guía

Sigue `references/narracion.md`:
1. Escribe `narracion/guiones.json`: un guion oral por pliego (25–45 s) que **invite a hacer
   clic nombrando el botón exacto** («haz clic en «Lanzar sismo»»), con `cta` y `cues`.
2. Pide al usuario la ruta del `.env` con la clave de Gemini si no la conoces.
3. `node tools/tts.mjs --env "RUTA\.env"` genera y verifica los audios transcribiéndolos.
   Revisa a mano toda coincidencia bajo 95 %: las diferencias solo pueden ser de formato
   (números en cifras), nunca de contenido; si cambió una palabra, regenera ese audio con `--only id --force`.
4. `node tools/cues.mjs --env "RUTA\.env"` mide cuándo se nombra cada botón; comprueba 2
   tramos recortando el audio y transcribiéndolos.

### Fase 7 · Notas docentes, compilación y entrega

- Completa `public/docentes.html` (plantilla con `{{…}}`; modelo completo en
  `examples/ondas-y-sismos/docentes.html`): OA, mapa, secuencia sugerida, precisiones al
  texto, ideas previas, qué simplifica cada modelo, uso técnico y fuentes verificables.
- `npx vite build` → `dist/index.html` (único archivo, 1 a 5 MB con audio) + `dist/docentes.html`.
- Comprime ambos en un `.zip` y envíalos al usuario. Dile exactamente: qué abrir en su equipo
  (`dist/index.html`) y qué subir al hosting (ambos archivos juntos en una carpeta). Ver `references/despliegue.md`.

## Criterios de calidad

- **Exactitud antes que espectacularidad**: cifras, ecuaciones y fenómenos verificados; lo
  que el modelo simplifica se declara en el pie de figura y en las notas docentes.
- **Cada interacción enseña algo**: si quitar un control no cambia lo que se aprende, sobra.
- **Accesible**: texto HTML real, teclado (← →), "reducir movimiento", sonido silenciable.
- **Funciona sin internet** y en un solo archivo; nada de CDN ni imágenes externas: todo se
  dibuja con código (geometría y texturas en canvas).
