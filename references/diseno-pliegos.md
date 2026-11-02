# Diseño de pliegos

Contenido: 1. Principio · 2. Página izquierda · 3. Predicción y solapa · 4. Página derecha ·
5. Desafíos · 6. Catálogo de patrones probados · 7. Ideas para otras asignaturas · 8. Estilo visual

## 1. Principio

Cada pliego es un ciclo **Predice → Prueba → Desafío** (predecir–observar–explicar). El
modelo 3D no ilustra: **es el experimento**. Pregunta de control: si el estudiante solo mirara
la imagen sin tocarla, ¿aprendería lo mismo? Si la respuesta es sí, el pliego necesita una
mejor interacción.

## 2. Página izquierda

- Antetítulo con la lección y la pregunta del texto escolar; título corto y atractivo.
- 1–2 párrafos (máx. ~90 palabras en total) con el concepto, en lenguaje del nivel.
- Un recuadro `key` con la idea o ecuación central, o una tabla `.tw` de hasta 5 filas.
- Opcional: una nota manuscrita al margen (dato curioso, conexión con Chile).
- La predicción al final. Todo debe caber: revisa el desborde (ver `qa.md`).
- Contextualiza en Chile cuando el tema lo permite (sismos reales, ciudades, instituciones
  vigentes: SENAPRED, SHOA, CSN…), sin inventar datos: verifícalos.

## 3. Predicción y solapa

- Tres alternativas: la correcta y dos **ideas previas reales** del nivel (no distractores absurdos).
- La solapa explica el **porqué**, no repite la respuesta; puede nombrar el error típico
  ("si dijiste 100, confundiste energía con amplitud").
- La solapa solo se abre después de elegir: obliga a comprometerse.

## 4. Página derecha

- `.stage-space` (zona del dibujo) → pie de figura → "Prueba" con controles → desafío.
- Pie de figura: qué representa el modelo y **qué simplifica** (escalas comprimidas,
  alturas exageradas, fórmulas didácticas).
- Controles con etiquetas que la narración pueda nombrar textualmente («Lanzar sismo»,
  «Registrar sismo»): el cursor guía y el guion dependen de esos textos.
- Un `readout` que comente lo que pasa ("¡Ruptura! La energía se libera…") convierte cada
  acción en retroalimentación.

## 5. Desafíos

Buenos desafíos exigen **aplicar** el concepto y se verifican automáticamente:
- Localizar algo en el 3D (`pick`): "toca el epicentro".
- Medir y calcular con tolerancia: "lee tS − tP y escribe la distancia (±15 %)".
- Lograr una condición en el modelo: "haz que la casa lejana sienta más".
- Identificar en serie: "acierta 3 ondas misteriosas seguidas".
- Decidir bajo tiempo: "llega a zona segura antes que la ola".
- Pregunta conceptual **con requisito previo**: solo da sello si antes usó el modelo.
Evita los de memoria pura y los que se resuelven probando al azar sin pensar.

## 6. Catálogo de patrones probados (código en `examples/ondas-y-sismos/spreads/`)

| Patrón | Archivo | Mecánica | Sirve para |
|---|---|---|---|
| Acumular y liberar | `s01-sismo.js` | Botón que se mantiene presionado llena una barra y comprime un resorte; "Liberar" dispara frentes de onda desde un punto; corte inclinado sobre una cuña | Energía potencial, umbrales, reacciones, rupturas |
| Red de partículas | `s02-ondas.js` | Retícula `penSegments` deformada cada cuadro por una función de desplazamiento; partícula testigo con estela; modo "misterioso" | Ondas, sonido, estados de la materia, modelo cinético |
| Trayectorias reveladas en el tiempo | `s03-interior.js` + `physics/rays.js` | Trayectorias precalculadas (ley de Snell) que se dibujan al ritmo de su tiempo de viaje real con `dashSize`; alternar modelos | Óptica, refracción, trayectorias, rutas |
| Instrumento + gráfico en papel | `s04-sismografo.js` + `physics/seismo.js` | Instrumento 3D animado por una señal y un `<canvas>` en la página con cuadrícula para leer valores | Mediciones, gráficos tiempo–magnitud, laboratorio |
| Mapa con construcción geométrica | `s05-triangulacion.js` | Mapa dibujado en canvas como textura; rangos que trazan círculos; clic en el mapa con tolerancia en km | Geografía, triangulación, escalas, coordenadas |
| Comparador logarítmico | `s06-magnitud.js` | Cubos cuyo volumen es proporcional a la cantidad; botones con datos reales | Órdenes de magnitud, pH, decibeles, potencias |
| Sitios comparados | `s07-intensidad.js` | Varios objetos con parámetros propios (distancia, suelo) y una fórmula didáctica declarada | Variables que influyen en un efecto, factores |
| Corte con fluido | `s08-tsunami.js` | Perfil extruido, superficie de agua recalculada cada cuadro, tiempo integrado con √(g·h), decisión del estudiante | Fluidos, ríos, mareas, procesos con tiempo y riesgo |

## 7. Ideas para otras asignaturas

- **Biología**: célula en corte (organelos que se levantan; transporte de partículas por la
  membrana con la red de partículas); ciclo cardíaco con flujos de color; ecosistema con flujos de energía.
- **Química**: modelo cinético (red de partículas que se agita con la temperatura); estequiometría
  con jarras/cubos que se llenan; enlace con moléculas manipulables.
- **Matemática**: funciones como curvas/superficies con rangos de parámetros; geometría
  manipulable (Pitágoras con áreas); probabilidad con simulaciones de muchos lanzamientos.
- **Historia y geografía**: mapa en relieve con capas por época (patrón de mapa); líneas de
  tiempo que se levantan; rutas y distancias.
- **Tecnología**: máquinas simples con fuerzas visibles; circuitos con flujo de corriente animado.

## 8. Estilo visual

- Superficies de papel con trama de tinta y acuarela suave (`tintAmt` 0,3–0,6). Colores
  saturados solo para lo que importa (energía, ondas, el punto clave): así el ojo va a lo esencial.
- Rótulos cortos (2–3 palabras); como máximo ~5 visibles a la vez. Los detalles van en el
  texto de la página, no en el dibujo. Un rótulo largo cruza el lomo y tapa la otra página.
- Sin imágenes externas: geometría y texturas dibujadas con código (madera, tela, mapas, papel).
