# Prueba en el navegador (QA)

## Vista previa

- Desarrollo: `npx vite --port 5174` (o la configuración `libro` de `.claude/launch.json`).
- Archivo final: `npx vite build` y luego `npx vite preview --port 4174`.
- **Ojo**: la herramienta de vista previa puede seguir usando la carpeta donde arrancó la sesión
  (si la sesión se movió de carpeta, sirve la versión vieja). Si lo que ves no coincide con lo
  compilado, lanza el servidor tú mismo en segundo plano desde la carpeta del proyecto
  (`npx vite preview --port 4180 --strictPort`) y navega a esa URL.
- No pruebes `dist/index.html` a través del servidor de desarrollo (`/dist/index.html`): Vite
  lo transforma y no refleja el archivo real.
- Si el panel del navegador está oculto, la animación corre muy lento (los cambios de página
  tardan): espera o vuelve a consultar antes de concluir que algo falló.

## Lista de control por pliego

1. Consola sin errores.
2. El texto cabe en ambas páginas (fragmento A).
3. El dibujo no se sale del papel ni tapa el texto de la página derecha en la vista normal.
4. Rótulos: legibles, sin taparse entre sí, sin cruzar al otro lado del lomo, ≤ ~5 a la vez.
5. Cada control funciona y el `readout` comenta lo que pasa.
6. La predicción abre la solapa solo después de elegir.
7. El desafío entrega el sello cuando corresponde y no lo entrega cuando no (prueba también el caso fallido).
8. Al cambiar de pliego no quedan rótulos del anterior (fragmento B), hacia adelante y hacia atrás.
9. Con narración: suena sola al entrar, el cursor llega a cada botón cuando la voz lo nombra
   (fragmento C) y desaparece al cambiar de página.
10. Cifras y textos coinciden con lo verificado en la Fase 1.

## Fragmentos de prueba (ejecutar en la página con la herramienta de JavaScript)

A. Desborde de texto en las páginas:
```js
[...document.querySelectorAll('.page')].map(p => ({ pagina: p.className, sobra: p.scrollHeight - p.clientHeight }))
```
Un valor positivo en `sobra` significa que el contenido no cabe: acorta el texto o baja la tabla.

B. Recorrer todos los pliegos y listar los rótulos visibles en cada uno:
```js
const out = {};
for (let i = 1; i < window.__libro.spreads.length; i++) {
  window.__libro.go(i);
  await new Promise(r => setTimeout(r, 2800));
  out[i] = [...document.querySelectorAll('.css2d .lbl.on')].filter(e => e.style.display !== 'none').map(e => e.textContent.trim().slice(0, 24));
}
out
```

C. Registrar qué hace el cursor guía y sobre qué control:
```js
const g = document.querySelector('.guide'), log = [], t0 = performance.now();
while (performance.now() - t0 < 20000) {
  const st = g.className + '|' + (document.querySelector('.sim-press')?.dataset.act || '');
  if (log.at(-1)?.st !== st) log.push({ t: ((performance.now() - t0) / 1000).toFixed(1), st });
  await new Promise(r => setTimeout(r, 50));
}
log
```

D. Simular una interacción: `document.querySelector('[data-act=quake]').click()`; para un
rango, asigna `value` y dispara `new Event('input', { bubbles: true })`; para mantener
presionado, `dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))` y luego `pointerup`.

E. Clic sobre un punto 3D: busca la malla en `window.__libro.scene`, obtén su posición
mundial, proyéctala con `v.project(window.__libro.camera)` y convierte a píxeles; ojo con la
escala entre la ventana y la captura de pantalla.

Confirma siempre lo importante con una captura: el JavaScript dice si algo existe, la captura
dice si se ve bien.
