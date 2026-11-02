# Animaciones 3D — versión 0.3

## Diseño

Conservar la fidelidad a las páginas del PDF. Decidir qué objeto se transforma, qué etapas atraviesa y qué decisión produce cada transición. Si el PDF solo lista recursos, identificar cualquier circuito como caso ficticio añadido. La tercera dimensión puede representar separación de estaciones, capas, transferencia o cambio de objeto. No atribuir significado cuantitativo a la posición, tamaño o velocidad si no existe un modelo validado.

Para un circuito conceptual, crear estaciones legibles con flechas, un objeto con volumen que se desplaza y cambia de etiqueta o forma, y una explicación HTML sincronizada. Por ejemplo, un borrador pasa por revisión y vuelve a corrección al detectarse un compromiso inexistente. En un circuito de comunicación puede convertirse en una pantalla de presentación o en un esquema, según la elección del lector. Es una metáfora formativa, no una simulación de las herramientas citadas.

## Motor y recurso incluido

Usar Three.js con versión fijada por lockfile; la referencia incluida fue probada con 0.170.0. Usar OrbitControls de la misma versión. Bundlear dependencias y recursos para un HTML autocontenido. Incluir licencia MIT de Three.js y de cualquier otro código reutilizado. No copiar imports con rutas de la máquina de construcción ni usar CDN cuando se prometa ejecución offline.

assets/process3d-view.mjs es una vista de referencia específica para seis estados a–f. Exporta mountProcess3D(container,spec,type) y devuelve dispose(). spec.nodes contiene label, doc y edges; type admite design, writing o flow. La vista espera un SVG .process-svg de respaldo, un grupo .process-nodes con .current[data-state] y eventos process-position en el contenedor. Esos eventos tienen detail: {from,to,fraction}; fraction entre 0 y 1 representa avance de la transición. La vista no decide recorridos ni programa el avance. El controlador de proceso debe enviar eventos y actualizar el estado; mantenerlo como fuente de verdad.

Adaptar la distribución y los tipos de objeto al contenido nuevo: la disposición a–f no sirve sin cambios para todo proceso. Separar vista y modelo, validar destinos e historial antes de renderizar. Esta referencia incluye estaciones, flechas, documento o pantalla con geometría volumétrica, luces, cámara y controles. Las fuentes para etiquetas usan canvas local. No requiere una API externa ni imágenes descargadas.

## Interacción y rendimiento

- Cámara: arrastre para rotar, botones accesibles para rotación, acercar/alejar y restablecer; ofrecer teclado. Evitar capturar el scroll de la página. Asegurar que gestos dentro del visor no impidan navegar el resto del libro.
- Proceso: inicio detenido, pausa que congela el objeto, pasos y retroceso, reinicio y velocidad. Detener automáticamente ante decisiones y finales; no confundir Restablecer vista con Reiniciar escena.
- No girar continuamente la cámara ni mover objetos decorativamente. Respetar prefers-reduced-motion y el control manual: saltar entre estados con explicaciones equivalentes. El usuario puede seguir rotando la cámara de manera voluntaria.
- Limitar pixel ratio y geometrías; renderizar ante cambios, movimiento o interacción. Evitar bucles gráficos permanentes. Al ocultar o salir, detener el proceso; liberar listeners, ResizeObserver, controles, texturas, geometrías, materiales, renderer y contexto al desmontar.
- Hacer las etiquetas legibles en móvil; usar descripciones HTML además del texto dentro del canvas. Evitar oclusión del objeto sobre información indispensable. La profundidad no debe ocultar condiciones ni responsabilidades.

## Compatibilidad y alternativa

Detectar fallo al crear WebGLRenderer y pérdida de contexto. Mantener el mismo proceso, decisiones y textos mediante esquema 2D; permitir cambiar manualmente con Ver esquema 2D / Volver a 3D. No perder el estado lógico al cambiar de vista. Informar de forma breve por qué aparece la alternativa. Un dispositivo sin WebGL no tiene que perder el contenido formativo.

## Verificación antes de entregar

Comprobar WebGL activo y geometrías reales; arrastre y controles de cámara; cercanía y encuadre restablecidos; pausa real del objeto; ambos caminos de cada decisión; retroceso y reinicio; modo sin movimiento; cambio de capítulo sin contextos o temporizadores acumulados; vista móvil; ejecución sin internet y fallback sin WebGL. Revisar capturas de los estados relevantes y el texto equivalente. Distinguir pruebas automatizadas de validación en un teléfono físico; no afirmar esta última sin haberla hecho.
