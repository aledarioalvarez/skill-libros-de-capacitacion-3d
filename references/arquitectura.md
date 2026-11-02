# Arquitectura del motor

Contenido: 1. Estructura del proyecto · 2. Cómo se arma la escena · 3. Coordenadas del pliego ·
4. Anatomía de un pliego · 5. `ctx` · 6. Piezas de página (`h`) · 7. Tinta (`ink.js`) ·
8. Rótulos · 9. Sonido, tweens, progreso · 10. Clases CSS útiles

## 1. Estructura del proyecto

```
proyecto/
├── index.html              cargador + marcadores %TITULO% (los reemplaza vite.config.js)
├── vite.config.js          vite-plugin-singlefile → dist/index.html autocontenido
├── src/
│   ├── libro.config.js     título, tapa, autor, colores, storageKey
│   ├── main.js             escena, cámara, montaje de pliegos, navegación, selección 3D
│   ├── style.css           páginas, cápsula, rótulos, cursor guía (fuentes latinas incrustadas)
│   ├── core/
│   │   ├── scene.js        renderizador WebGL + CSS3D (páginas) + CSS2D (rótulos), escritorio, luz
│   │   ├── book.js         tapa con oro, bloques de hojas, hoja que se da vuelta, páginas HTML
│   │   ├── ink.js          material de tinta con trama, contornos de pluma, líneas, flechas, paleta C
│   │   ├── page.js         piezas HTML (h.*) y lógica de predicción/solapa/sello
│   │   ├── labels.js       rótulos manuscritos anclados a puntos 3D
│   │   ├── ui.js           cápsula de navegación, índice, avisos
│   │   ├── narration.js    audio por pliego, autoplay, destello del botón invitado
│   │   ├── cursor.js       cursor guía sincronizado con narracion/cues.json
│   │   ├── sound.js        efectos sintetizados (WebAudio)
│   │   ├── tween.js        interpolaciones con promesas
│   │   └── progress.js     sellos, predicciones, respuestas (localStorage, tolerante a fallos)
│   ├── spreads/            s00-portada, s01…, s99-quiz, index.js (orden del libro)
│   ├── physics/            (opcional) simulaciones puras, probables en Node
│   └── audio/              <id>.mp3 por pliego (los incrusta la compilación)
├── narracion/              guiones.json, cues.json, voz.json, verificacion.json
├── tools/                  tts.mjs (genera y verifica voz), cues.mjs (tiempos del cursor)
└── public/docentes.html    notas docentes (se copia tal cual a dist/)
```

Dependencias fijas: `three@0.170.0`, `vite@5.4.11`, `vite-plugin-singlefile@2.0.3`,
`@fontsource-variable/source-serif-4`, `@fontsource/caveat`. No uses CDN: el libro debe
funcionar sin internet.

## 2. Cómo se arma la escena

- **WebGL**: escritorio de madera, paño, libro, hoja que se da vuelta y los dibujos 3D.
  Tono neutro (`NeutralToneMapping`), sombras suaves de una "luz de ventana" (`KEY_DIR`).
- **CSS3D**: cada página es un `<div class="page">` real de 800 × 1072 px apoyado sobre el
  papel. Ventajas: texto nítido, botones y rangos nativos, accesible. Consecuencia: el HTML
  siempre se pinta **encima** del WebGL, por eso la página derecha deja vacía la zona superior
  (`.stage-space`) donde se levanta el dibujo.
- **CSS2D**: rótulos manuscritos que siguen puntos 3D, siempre encima de todo.
- El dibujo de cada pliego vive en `ctx.root`, hijo de un grupo que escala en `y` de 0 a 1
  (el dibujo "se levanta" con rebote) y se pliega al salir.

## 3. Coordenadas del pliego

`ctx.root` tiene el origen en el **centro de la página derecha**, sobre el papel:

- `x`: de −0,5 (lomo) a +0,5 (borde exterior).
- `z`: hacia el lector. Borde superior de la página = −0,67; inferior = +0,67.
- `y`: hacia arriba desde el papel.
- La zona del dibujo es la de `.stage-space`: con la altura por defecto (540 px de 1072) cubre
  `z ∈ [−0,67, 0]`. Diseña dentro de `x ∈ [−0,45, 0,45]`, `z ∈ [−0,6, −0,05]`.
- Altura: hasta ~0,4. Más alto se sale del papel en la vista por defecto y tapa el borde.
- `scale` del pliego (0,7–1) reduce todo el dibujo alrededor del origen; úsala cuando sobre.
- Si el pliego necesita más controles, baja `.stage-space` a 470 px
  (`<div class="stage-space" style="height:470px">`) y mantén el dibujo en `z ≤ −0,1`.
- Un plano vertical (corte, tarjeta) que mira a +z se ve muy escorzado desde la cámara
  (elevación ~54°). Inclínalo hacia atrás (`rotation.x ≈ −0,4`) sobre una cuña o atril, como
  una tarjeta desplegable.

## 4. Anatomía de un pliego

```js
export default {
  id: 'ondas',                       // único; nombra también src/audio/ondas.mp3
  kicker: 'Lección 5 · Pliego 2',    // antes del "·" se muestra en el índice y la cápsula
  title: 'Ondas P, S, Love y Rayleigh',
  stamp: 'ondas',                    // id del sello (omitir si no hay desafío)
  scale: 0.8,                        // opcional (por defecto 0,8)
  left: ({ spreads, config }) => `…HTML página izquierda…`,
  right: ({ spreads, config }) => `…HTML página derecha…`,
  mount(ctx) {                       // construye el 3D y conecta los controles
    return { update(dt, t) {}, dispose() {}, lifted() {}, stop() {} }; // todos opcionales; o null
  },
};
```

`update(dt, t)` corre cada cuadro (dt ≤ 0,05 s). `lifted()` se llama cuando el dibujo terminó
de levantarse. Al salir del pliego, el motor pliega el dibujo, borra sus rótulos y libera
geometrías y materiales: no hace falta limpiar a mano lo que cuelga de `ctx.root`.

## 5. `ctx`

| Miembro | Uso |
|---|---|
| `root` | Grupo donde agregas el dibujo (coordenadas de §3) |
| `THREE, camera, scene, renderer` | Acceso directo si lo necesitas |
| `spreads, config` | Lista de pliegos y `libro.config.js` |
| `left, right` | Elementos DOM de ambas páginas |
| `$(sel)`, `$$(sel)` | Buscar en ambas páginas |
| `act(nombre, fn(e, boton))` | Conecta todos los `[data-act=nombre]` (con clic sonoro) |
| `slider(nombre, fn(valor, el))` | Conecta `[data-sl=nombre]`; devuelve el `<input>` |
| `out(nombre, html)` | Cambia el texto del `<output>` de un rango (unidad incluida) |
| `ro(nombre, html)` | Escribe en `[data-ro=nombre]` (lecturas, mensajes) |
| `award(idSello)` | Entrega el sello (una sola vez, con sonido y animación) |
| `label(texto, pos?, opts)` | Rótulo manuscrito (ver §8) |
| `pick(objetos, fn(hit, e))` | Clic sobre mallas 3D (distingue clic de arrastre de cámara) |
| `hint(texto, ms)` | Aviso flotante arriba |
| `sound` | `click()`, `turn()`, `rumble(dur, fuerza)`, `stamp()`, `answer(ok)`, `splash()` |
| `go(i)` | Ir al pliego `i` |

`pick` recibe mallas (`Mesh`), no los `Group` de `inkMesh`: usa `grupo.userData.mesh`.

## 6. Piezas de página (`import { h } from '../core/page.js'`)

| Pieza | Produce |
|---|---|
| `h.head(antetitulo, titulo)` | Cabecera con antetítulo rojo y título grande |
| `h.key(html)` | Recuadro de idea clave; dentro, `<div class="eq">` para una ecuación grande y `<small>` para la nota |
| `h.note(html)` | Nota manuscrita al margen |
| `h.predict(id, pregunta, [{t, ok}], htmlRespuesta)` | Predicción con casillas y solapa que solo se abre tras elegir; guarda la elección |
| `h.test(html)` | Bloque "2 Prueba" |
| `h.challenge(idSello, html)` | Bloque "3 Desafío" con espacio para el sello |
| `h.fig(n, pie)` | Pie de figura (declara aquí lo que el modelo simplifica) |
| `h.btn(accion, etiqueta, clases)` | Botón `data-act`; clases `on`, `hot`, `P`/`S`/`L`/`R` (colores) |
| `h.slider(id, etiqueta, min, max, paso, valor, unidad)` | Rango con salida numérica |
| `h.readout(id, html)` | Zona de lectura/mensajes `data-ro` |
| `h.folio(n)` | Número de página |

Página izquierda típica: `head` → 1–2 párrafos → `key` o tabla `.tw` → `note` → `predict` → `folio`.
Página derecha típica: `.stage-space` → `fig` → `test` (controles + `readout`) → `challenge` → `folio`.
La página mide 800 × 1072 px a 21 px de letra: si te pasas, el texto se corta (ver `qa.md`).

## 7. Tinta (`ink.js`)

- `inkMesh(geometria, { tint, tintAmt, shade, density, opacity, glow, angle, lineWidth, outline })`
  → `Group` con superficie de papel sombreada con **trama de grabado** (más líneas donde hay
  sombra) + contornos de pluma. `tint`/`tintAmt` dan una acuarela suave (0,3–0,6).
  `userData.mesh` es la malla (para `pick` o cambiar uniformes: `material.uniforms.uTint/uGlow`).
- `penLine(puntos, { color, width, opacity, dashed, dashSize, gapSize })` → línea de pluma con
  grosor constante en pantalla. `setLinePoints(linea, puntos)` la redibuja.
- `penSegments(n, opts)` → `n` segmentos editables cada cuadro con `userData.write(Float32Array(n*6))`
  (redes, círculos recortados, frentes de onda).
- **Revelar una línea progresivamente**: `penLine(..., { dashed: true, dashSize: 0, gapSize: 100 })`
  y anima `material.dashSize` = distancia recorrida (en unidades del dibujo).
- `glowMaterial(color, opacidad)` → color plano saturado para energía, ondas, marcadores.
- `arrow(desde, hasta, { color, radius, head })`.
- `C`: paleta con significado (`P` azul, `S` naranja, `L` verde, `R` violeta, `energy`, `hot`,
  `water`). Usa los mismos colores en el texto (`var(--P)`…) para que página y dibujo hablen igual.
- Texturas (mapas, paneles, papel) se dibujan en `canvas` con `canvasTex(w, h, dibujar)` de `scene.js`.

## 8. Rótulos

`ctx.label(texto, posicion?, { side: 'left'|'right'|'center', cls: 'big'|'nodot'|'tag', color })`
devuelve un objeto CSS2D con `setText(html)` y `show(bool)`. **Nacen ocultos**: llama
`show(true)`. Agrégalo a `root` (o a un subgrupo). `tag` = etiqueta con borde (valores
numéricos), `big` = rótulo principal, `nodot` = sin punto.

## 9. Sonido, tweens y progreso

- `tween(segundos, fn(t01), easing)` devuelve una promesa; `ease.outBack`, `ease.inOut`, `ease.out`.
- `progress` guarda sellos, predicciones y respuestas bajo `config.storageKey`.
- Narración: si existe `src/audio/<id>.mp3`, aparece el botón «Escuchar» y suena sola al
  entrar al pliego (ver `narracion.md`).

## 10. Clases CSS útiles

`.tw` (tabla compacta), `.sw` (punto de color en tablas), `.row` (fila de controles), `.b`
(botón), `.meter > i` (barra de nivel, ancho en %), `.num` (entrada numérica), `.howto`
(recuadro), `.margin` (nota manuscrita), `.quiz-q` (preguntas del cuestionario),
`canvas.interactive` (gráficos 2D dentro de la página, p. ej. un sismograma).
