# Cierre del recorrido y constancia descargable

## Diseño del cierre

Al final del libro, ofrecer un cierre que vincule el esfuerzo con aprendizajes concretos: resultado, breve devolución y una mini animación de logro. Preferir «Recorrido completado» a afirmaciones de dominio que la evaluación no demuestra. Un sello que emerge de la última página es una opción coherente con el diseño pop-up.

La celebración debe ser breve (aproximadamente 1–2 segundos), sin sonido automático, parpadeos ni bucles. Mantener el resultado y la acción siguiente visibles después de finalizar el efecto. Respetar tanto la preferencia del sistema como el control de movimiento del libro: mostrar el sello estático cuando corresponda. No repetir automáticamente la celebración al recargar una finalización guardada.

## Criterio y estado

Explicitar los requisitos antes de que el participante termine. En el ejemplo «Le habían enseñado a pensar», se requieren 3 respuestas correctas de 4, evaluación comprobada y reflexión final no vacía; después se pulsa Finalizar recorrido. La reflexión se registra, no se califica semánticamente. No exigir una cantidad arbitraria de caracteres como sustituto de calidad.

Para otros cursos, adaptar el umbral y las actividades a sus objetivos y a las instrucciones del usuario. No imponer cuatro preguntas ni reflexión a cursos que no la incluyan. Si no se evalúa aprendizaje, describir la constancia como participación/finalización, sin inventar una aprobación. No restringir el acceso a la lectura por no cumplir el criterio de descarga.

Usar una fuente de verdad para requisitos, resultado visible y PDF. No habilitar la descarga solo por visitar páginas o por encontrar una puntuación antigua en el almacenamiento. Conservar las respuestas comprobadas, la reflexión cuando corresponda y la fecha de finalización. Si cambian las respuestas, pedir volver a comprobarlas; si cambia una evidencia requerida, invalidar la finalización anterior. Permitir reintentos. Borrar progreso debe borrar también el registro de finalización. Una constancia descargada previamente no se revoca desde un HTML local.

## Constancia PDF

- Generar un PDF real, localmente desde el libro, sin API, CDN, envío de nombres ni claves. Una vista HTML para imprimir no equivale por sí sola a una descarga PDF.
- En recorridos autogestionados, usar «Constancia de finalización». Incluir nombre ingresado por el participante, título del curso, fecha local de finalización y resultado si hubo evaluación. No inventar emisor institucional, firma, sello oficial, validación de identidad, número de matrícula ni registro verificable.
- Incorporar una leyenda breve que explique que se trata de una actividad autogestionada y no de una certificación institucional. No afirmar una evaluación supervisada.
- Pedir el nombre al terminar; por defecto usarlo solo para el PDF, sin persistirlo junto al progreso. Escapar o dibujar el nombre como texto/dato, nunca interpolarlo como HTML ejecutable. Manejar blancos, acentos, nombres largos y escrituras admitidas por las fuentes disponibles.
- Diseñar una página compacta y legible, por ejemplo A5 horizontal, con jerarquía, contraste y márgenes. Evitar adornos que compitan con nombre, curso y resultado. Mantener texto seleccionable cuando sea viable. Si se rasteriza el nombre para soportar fuentes locales, conservar suficiente resolución y revisar los glifos.
- Incrustar en el HTML la biblioteca y recursos necesarios. Conservar sus licencias (el ejemplo usa pdf-lib 1.17.1). Deshabilitar descargas duplicadas durante la generación, manejar errores con opción de reintento y liberar las URL temporales después de iniciada la descarga.

## Verificación

1. Requisitos: debajo del umbral, en el límite y por encima; sin reflexión cuando es requerida; evaluación incompleta o aún sin comprobar; no habilitar antes de tiempo.
2. Flujo: finalizar, nombre vacío/válido/largo, generación y archivo descargado; reintentos; cambio de respuestas/reflexión; recarga, borrado y generación repetida.
3. Movimiento: activación una vez tras finalizar, fin del efecto, resultado estable, modo reducido, teclado y pantalla estrecha.
4. PDF: generar con el mismo módulo que usa el libro, reabrirlo, comprobar una página, título, fecha y puntuación; renderizar y revisar márgenes, cortes y glifos con nombres representativos. No entregar un ejemplo con datos ficticios como si fuera una constancia real del usuario.
5. Informar por separado pruebas del modelo, flujo con DOM simulado, PDF renderizado y navegador real. Las tres primeras no prueban la animación ni que el navegador descargue el archivo. No afirmar certificación institucional o antifraude: el estado local de un HTML no es un registro inviolable.

Referencia ejecutable: `../examples/pensar-popup/index.html`; criterios y alcance en su guía y `verificacion.txt`.
