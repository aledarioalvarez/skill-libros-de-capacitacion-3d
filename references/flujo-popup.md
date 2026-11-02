# Construcción con la plantilla pop-up

Usar esta vía cuando la disposición espacial de un libro facilite el aprendizaje. Aplicar las prioridades pedagógicas y los requisitos de accesibilidad de SKILL.md.

1. Crear un proyecto independiente con `node scripts/nuevo-libro.mjs /ruta/mi-libro`. Usar `--sin-instalar` para copiar sin instalar dependencias.
2. Personalizar `src/libro.config.js`: título, autoría acreditada, tapa, colores e identificador de progreso único.
3. Leer `references/arquitectura.md` y `references/diseno-pliegos.md`. Tomar `src/spreads/s01-ejemplo.js` como referencia de API; reemplazarlo por capítulos basados en el PDF y registrarlos en `src/spreads/index.js`.
4. Adaptar la evaluación en `src/spreads/s99-quiz.js`. Mantener trazabilidad a páginas fuente y explicar las respuestas.
5. Para procesos, integrar el modelo de estados y la vista 3D según `references/animaciones.md` y `references/animaciones-3d.md`. No confundir el movimiento de las páginas con una animación explicativa del proceso.
6. Completar `public/docentes.html` con objetivos, mapa de capítulos, fuentes, secuencia, supuestos y respuestas. Reemplazar todos los marcadores de plantilla.
7. Iniciar con `npx vite --port 5174`. Verificar móvil, escritorio, teclado, reducción de movimiento, decisiones y liberación de recursos según `references/qa.md`. Consultar `references/lecciones-aprendidas.md` ante problemas técnicos.
8. Mantener narración y sonido sin reproducción automática. Consultar `references/narracion.md` solo si se solicita voz; no enviar contenido a servicios de voz sin autorización.
9. Compilar con `npx vite build`. Verificar el archivo final y sus recursos sin conexión; conservar las licencias. Consultar `references/despliegue.md` para distribución. Publicar solo cuando el usuario lo solicite.

La plantilla contiene ejemplos mínimos de implementación que deben reemplazarse antes de entregar el libro. No incluir dependencias instaladas, credenciales ni configuraciones personales en la distribución.
