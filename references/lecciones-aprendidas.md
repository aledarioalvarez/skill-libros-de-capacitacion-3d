# Resolución de problemas de la plantilla

Consultar ante fallas de compilación, encuadre o interacción.

| Síntoma | Causa | Solución (en la plantilla) |
|---|---|---|
| Pantalla vacía, la cámara en `NaN` | `OrbitControls` se crea con la cámara en el origen, igual que su objetivo | `scene.js` ubica la cámara antes de crear los controles |
| Rótulos de un pliego flotan sobre el siguiente | El evento `removed` de Three.js solo llega al grupo quitado, no a sus hijos CSS2D | `main.js` borra los elementos CSS2D del pliego al desmontarlo |
| Todos los rótulos aparecen en el mismo punto | Se pasó la posición como segundo argumento a una versión antigua de `label()` | `label(texto, pos?, opts)` acepta ambas formas |
| El sello se cuenta pero no se ve en la página | `award` lo registraba en la página izquierda, donde no está el desafío | `bindPage().award` solo actúa en la página que tiene el desafío |
| Error de compilación con `**` | `-x ** 2` es inválido en JavaScript | Escribir `-(x ** 2)` |
| Un plano vertical se ve como una línea | Desde la cámara (~54°) un plano que mira a +z queda muy escorzado | Inclinarlo hacia atrás (`rotation.x ≈ −0,4`) sobre una cuña o atril |
| El dibujo se sale del papel | Modelo demasiado alto o ancho | `scale` del pliego 0,7–0,9; zona de §3 en `arquitectura.md` |
| Rótulos largos tapan la otra página | Notas dentro del rótulo | Rótulos de 2–3 palabras; el detalle va en el texto |
| Etiquetas de valores se superponen | Textos largos en `tag` sobre objetos cercanos | Solo el valor en la etiqueta (p. ej. "VII"); la descripción en el `readout` |
| Círculos recortados dibujan líneas por el borde del mapa | Se "aplastaban" los puntos al borde | Usar `penSegments` y omitir los tramos fuera del mapa |
| Fuentes por URL `@fontsource/...` no se resuelven en CSS | Vite no resuelve módulos sin ruta en `url()` | Rutas relativas a `../node_modules/...`, solo el subconjunto latino |
| La vista previa muestra una versión vieja | La herramienta de vista previa usa la carpeta inicial de la sesión | Servir `npx vite preview` en segundo plano desde la carpeta del proyecto |
| Un modelo de Gemini responde 404 | Modelo retirado o no disponible para esa clave | Listar modelos y ajustar `narracion/voz.json` |
| La voz dijo una cifra distinta | Error ocasional del TTS | Verificación por transcripción + regenerar con `--only id --force` |
| La clave de API apareció en la conversación | Se filtró un `.env` con `grep` y una línea con formato distinto no se ocultó | No inspeccionar `.env`; las herramientas leen la clave sin imprimirla |
| La física del modelo no coincide con la realidad | Perfil de parámetros simplificado | Prototipar en Node y ajustar contra valores conocidos (p. ej. zonas de sombra 104°/140°) antes de dibujar |
