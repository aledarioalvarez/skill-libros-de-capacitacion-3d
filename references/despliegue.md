# Compilar, entregar y publicar

## Compilar

```bash
npx vite build
```

Produce `dist/index.html` (todo incrustado: código, Three.js, fuentes y audios; ~1 MB sin
narración, ~4 MB con 10 narraciones) y copia `public/docentes.html` a `dist/`.
Comprueba que no quedan dependencias externas:

```bash
grep -o 'src="[^"]*"' dist/index.html | grep -v '^src="data'   # no debe imprimir nada
```

Paquete para el usuario (Windows):

```bash
cd dist && powershell -NoProfile -Command "Compress-Archive -Path index.html,docentes.html -DestinationPath ../NOMBRE.zip -Force"
```

## Qué decirle al usuario

- **En su computador**: abrir `dist\index.html` con doble clic (funciona sin internet).
- **En su hosting**: subir `index.html` y `docentes.html` **juntos en la misma carpeta**
  (p. ej. `public_html/nombre-del-libro/`); los profesores entran a
  `https://dominio/nombre-del-libro/`. El botón del birrete del libro abre `docentes.html`.
- **Moodle**: recurso "Archivo" o "Carpeta" con ambos archivos.
- **Enlaces directos** a un pliego: agregar `#p3` al final de la dirección (`#p0` = portadilla).
- Requisitos: navegador reciente con WebGL 2; se lee mejor en computador o tablet.
- El progreso se guarda en cada navegador (no hay servidor ni datos personales).

## SCORM (si lo piden)

No está en la plantilla. Si el usuario lo pide: empaquetar `index.html` con un
`imsmanifest.xml` SCORM 1.2 y un pequeño puente que, al ganar sellos y responder el
cuestionario, reporte `cmi.core.score.raw` (sellos + puntaje) y `cmi.core.lesson_status`.
Engancharse a `progress.onChange` en `src/core/progress.js`.
