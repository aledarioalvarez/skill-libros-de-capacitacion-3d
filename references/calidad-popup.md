# Calidad de referencia: libro pop-up

## Resultado aprobado

El usuario eligió «Le habían enseñado a pensar» como referencia de calidad para los próximos libros. El rasgo central es que el gráfico parece salir físicamente de un libro abierto. Consultar `../examples/pensar-popup/index.html` y su guía cuando haga falta ver la implementación. Son archivos autónomos, no enlaces a una conversación ni rutas de una máquina anterior.

El ejemplo tuvo aprobación del usuario y comprobaciones de lógica; su prueba visual automatizada no pudo completarse. `verificacion.txt` conserva esa distinción. Reutilizar decisiones de diseño, sin trasladar automáticamente la afirmación de que una implementación está probada.

## Composición y volumen

- Mostrar un libro abierto reconocible: dos páginas, lomo, espesor y superficie de papel. Anclar la escena a una página; la base de los objetos debe coincidir con ella. Evitar que el modelo parezca flotar sin relación con el libro.
- Usar geometrías tridimensionales con espesor, perspectiva, iluminación y sombras que hagan perceptible la separación entre página y objeto. Un gráfico plano inclinado con CSS no cumple esta referencia de 3D.
- Ofrecer una acción explícita de despliegue: objetos que emergen de la página mediante elevación, apertura o crecimiento vertical controlado. Puede empezar con la maqueta ya visible y permitir repetir el despliegue. No reproducir ni girar automáticamente al cargar.
- Mantener el texto principal y los controles en HTML semántico, fuera de las superficies deformadas por perspectiva. El libro puede combinar una columna de lectura con un laboratorio pop-up. En móvil, apilar ambos sin sacrificar lectura ni ocultar controles.
- Cuidar jerarquía editorial, espacios de lectura, contraste, foco y tamaño de botones. La paleta de papel cálido, tinta verde oscura y acentos terracota del ejemplo es una opción de referencia, no una obligación para todas las marcas o temas.
- Encadrar el modelo completo en las alturas y estados extremos. Comprobar que sombras, rótulos y objetos no tapen explicaciones ni queden recortados. Escalas visuales exageradas deben identificarse cuando puedan confundirse con medidas reales.

## Animación que enseña

El despliegue pop-up presenta la escena; una animación adicional explica el contenido. Elegir objetos reconocibles para el tema, no repetir el edificio y barómetro en contenidos ajenos.

Diseñar cada demostración como: situación inicial → intervención del lector → transformación visible → explicación → desafío. Una variable puede cambiar un resultado; una decisión puede abrir una rama; un objeto puede atravesar un circuito y cambiar de estado. No imponer siete métodos ni seis capítulos: esos números pertenecen al ejemplo.

Separar tres grupos de controles:

1. **Presentación:** desplegar la maqueta.
2. **Cámara:** arrastre, giro, acercar/alejar y restablecer vista, con alternativas por botones y teclado.
3. **Demostración:** reproducir/pausar, paso anterior/siguiente, reiniciar y velocidad cuando corresponda; selectores de método o variables solo si tienen sentido didáctico.

Un único estado lógico debe alimentar la vista 3D, la alternativa 2D y el texto explicativo. Pausar congela el estado del fenómeno; reiniciar vuelve a un estado inicial coherente; restablecer cámara no reinicia el aprendizaje. Evitar superponer bucles ante clics repetidos. Detener al finalizar, al cambiar de capítulo y al ocultar la página.

Para movimiento reducido, permitir saltos de estado y explicaciones equivalentes. La alternativa 2D debe mantener actividades, decisiones y avance; no limitarse a un aviso de error o una imagen estática si la interacción es necesaria. Distinguir tiempo didáctico de tiempo físico y documentar supuestos, unidades y límites de los modelos.

## Aprendizaje y entrega

Incluir objetivos, navegación, actividades con retroalimentación, evaluación con reintentos y guía del facilitador. Aceptar PDF o texto fuente. Conservar la trazabilidad: páginas reales para PDF, secciones identificables para texto sin paginación. Corregir errores de la fuente de forma explícita, sin atribuir al original las explicaciones añadidas.

Entregar `index.html` autónomo, guía, ZIP, licencias y breve instrucción de apertura. Incrustar el motor y recursos necesarios; sin CDN, rutas absolutas del entorno ni solicitudes de claves para el libro básico. Mantener las preferencias de estilo abiertas a nuevas instrucciones del usuario. Publicar un sitio es una acción distinta y requiere que se haya solicitado.

## Matriz de aceptación

| Comprobación | Evidencia esperada |
| --- | --- |
| Libro y pop-up legibles | Captura del libro con objetos elevados y otra de un estado relevante; revisión de encuadre y oclusión. |
| Movimiento real | Interacción que cambia la posición o estado del objeto, no solo su rótulo o color. |
| Control temporal | Pausa durante el recorrido; estado estable después de esperar; continuación, reinicio, final y clics repetidos. |
| Cámara independiente | Giro, zoom y restablecimiento sin alterar el estado del proceso. |
| Alternativa 2D | Cambio de vista conservando estado; avance, ramas y explicaciones disponibles; fallo o pérdida de WebGL. |
| Accesibilidad y móvil | Teclado, foco, reducción de movimiento y vista estrecha sin desbordes. Separar emulación de prueba en teléfono físico. |
| Modelo y aprendizaje | Casos conocidos y límites; feedback de respuestas correctas e incorrectas; notas/progreso si están implementados. |
| Autonomía | Abrir el HTML final y comprobar recursos y solicitudes externas, además de revisar contenido del ZIP. |

Realizar las pruebas de navegador cuando haya una herramienta autorizada disponible. Si no puede utilizarse, completar las verificaciones posibles y declarar el impedimento y lo pendiente en la entrega. Un DOM simulado, una compilación correcta o una captura por sí solos no prueban interacción real, WebGL ni compatibilidad móvil. No presentar esa limitación como el estándar deseable: buscar validación visual en las próximas ejecuciones que lo permitan.

## Cierre del recorrido

Aplicar `cierre-y-constancia.md` para la celebración final y el PDF. La animación de cierre acompaña evidencia concreta de finalización; no reemplaza las actividades ni certifica dominio profesional. El ejemplo de referencia incorpora este flujo y documenta su alcance de pruebas.

