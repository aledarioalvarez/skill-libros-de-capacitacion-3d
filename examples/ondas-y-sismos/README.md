# Ejemplo: "Ondas y sismos" (Física 1.° medio, Chile, OA 13)

Libro completo construido con esta skill a partir de la Unidad 3 del Texto del Estudiante
(lecciones 5 y 6). Autor: Dr. Cristian Sepúlveda-Irribarra (Universidad de Los Lagos).

| Archivo | Qué mirar |
|---|---|
| `spreads/s01-sismo.js` | Corte de subducción inclinado sobre cuña, resorte de energía, frentes de onda P/S recortados al bloque, desafío con `pick` |
| `spreads/s02-ondas.js` | Red de partículas animada (`penSegments`), partícula testigo con estela, casitas que siguen el suelo, modo misterioso con racha |
| `spreads/s03-interior.js` | Tierra en atril, capas en dos modelos, trayectorias reveladas con `dashSize` según tiempo de viaje, zonas de sombra |
| `spreads/s04-sismografo.js` | Instrumento con inercia + sismograma 2D en `<canvas>` dentro de la página, desafío numérico con tolerancia |
| `spreads/s05-triangulacion.js` | Mapa dibujado en canvas como textura, círculos por rango, clic con error en km |
| `spreads/s06-magnitud.js` | Cubos con volumen ∝ energía, botones con sismos reales, desafío de razón |
| `spreads/s07-intensidad.js` | Cuatro sitios con distancia y suelo, fórmula didáctica declarada, daño visible |
| `spreads/s08-tsunami.js` | Perfil extruido, superficie de agua dinámica, √(g·h), decisión de evacuación |
| `spreads/s09-quiz.js` | Versión temática del cuestionario (la plantilla trae una genérica `s99-quiz.js`) |
| `physics/rays.js` | Trazado de rayos sísmicos (ecuación del rayo + Snell) probado en Node |
| `physics/seismo.js` | Señal sintética de sismograma con llegadas P, S y superficiales |
| `narracion/guiones.json` | Guiones con invitaciones y `cues` para el cursor |
| `narracion/cues.json` | Tiempos medidos por Gemini |
| `narracion/verificacion.json` | Transcripciones de verificación |
| `docentes.html` | Notas docentes completas (modelo para llenar la plantilla) |

Notas para reutilizar código del ejemplo en la plantilla:
- Estos pliegos usan `left()`/`right()` sin argumentos (la plantilla también acepta
  `left({ spreads, config })`); funcionan tal cual.
- Importan `../physics/...`: copia también ese archivo a `src/physics/`.
- La portadilla del ejemplo estaba escrita a mano; la de la plantilla se genera sola.
