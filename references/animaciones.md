# Animaciones interactivas: contrato de diseño

## De la fuente al modelo

Antes de programar, escribir una tabla con: estado, página fuente, responsable, entrada, acción, salida, siguiente estado, condición y excepción. Separar hechos del PDF de ejemplos o supuestos añadidos. Si una condición necesaria está ausente, señalar el vacío; no completarlo como una regla real.

Elegir el patrón según el aprendizaje:

| Contenido | Representación | Acción del lector |
| --- | --- | --- |
| Proceso secuencial | Objeto que se desplaza y cambia de estado | Avanzar y explicar cada cambio |
| Decisión | Bifurcación con consecuencias | Elegir y justificar |
| Intercambio entre áreas | Carriles con responsables y transferencias | Seguir el documento e identificar quién actúa |
| Transformación | Antes/después con cambio localizado | Comparar y reconocer lo conservado |
| Relación cuantitativa | Variables controlables y respuesta del modelo | Formular y probar una predicción |

Una animación aporta si revela orden, condición, responsabilidad, cambio o efecto. No fijar una cuota de animaciones por capítulo. La decisión didáctica importa más que su número.

## Storyboard mínimo

Describir el objeto y su estado inicial; qué evento produce la transición; cómo se mueve o transforma; qué explicación aparece; dónde decide el lector; cómo se muestra un error o retorno; cuál es el desafío. Mostrar el mapa completo y el estado actual para conservar contexto. No usar color como único indicador.

Ejemplo ficticio: borrador → edición → revisión de fidelidad → decisión. Si contiene un dato agregado, vuelve a edición; si conserva el sentido, pasa a listo para revisión final. No llamar “aprobado” al resultado si no hubo aprobación real. El movimiento del documento se acompaña de cambios de etiqueta y explicación del contenido. Este ejemplo no se atribuye al PDF salvo que esté documentado allí.

## Controlador reutilizable

assets/process-model.mjs proporciona createProcessModel({initial,nodes}). Cada nodo tiene label, explanation y edges: [{to,label}]. Un nodo final tiene edges: []. step() avanza solo cuando hay exactamente una transición; choose(to) debe usar una transición definida; back() recupera el estado anterior del recorrido, incluso después de un ciclo; reset() borra el historial. snapshot() devuelve copias. El modelo no contiene temporizadores ni dibuja.

Validar el grafo con este módulo antes de animarlo. No permitir que texto del PDF se ejecute como código. El ejemplo de uso es JavaScript local, no una dependencia remota:

```js
const model = createProcessModel({initial:'a', nodes:{
  a:{label:'Borrador',explanation:'Ejemplo ficticio.',edges:[{to:'b',label:'Revisar'}]},
  b:{label:'Decisión',edges:[{to:'a',label:'Corregir'},{to:'c',label:'Conforme'}]},
  c:{label:'Listo',edges:[]}
}});
const next = model.step();
// Renderizar next.node y mover el documento al nodo next.id.
// En la decisión, detener la reproducción y mostrar ambos botones.
```

## Construcción visual

- Dibujar un flujo SVG o una grilla HTML con flechas, etiquetas y un documento/dato visible. Hacer que el objeto cambie de posición entre estados y que su contenido o etiqueta muestre la transformación cuando corresponda. Si es necesario interpolar coordenadas SVG, resolverlas según el tamaño actual del contenedor, también después de resize.
- Hacer del modelo la fuente de verdad; el movimiento visual refleja una transición válida. No avanzar a través de una decisión con un temporizador. Mostrar finales sin continuar automáticamente.
- Construir un controlador de reproducción separado. Al pausar detener temporizadores y congelar o cancelar animaciones en curso. Reiniciar devuelve modelo, objeto, explicaciones y controles al estado inicial. No superponer ejecuciones por clics rápidos. Detener temporizadores al cambiar de capítulo, ocultar la vista o destruir el componente.
- El selector de velocidad modifica la cadencia. No mostrar duraciones de trabajo reales si solo se trata del ritmo de reproducción.
- Con prefers-reduced-motion o el control manual de movimiento, usar saltos de estado y explicación textual, sin desplazamiento animado. Mantener disponibles elecciones y avance manual. No usar parpadeos.
- Dar nombres accesibles a los controles, foco visible y equivalente textual del recorrido. Usar aria-live de forma moderada para el estado final de cada paso, no para cada frame. En móvil adaptar carriles y nodos sin cortar etiquetas.
- Si la escena se integra a un HTML único, incrustar el controlador adaptado y recursos. No dejar import relativo a process-model.mjs en el archivo final autónomo.

## Pruebas exigidas

1. Recorrido normal y todos los destinos de cada decisión; finales y correcciones. Comparar con las páginas fuente.
2. Anterior tras un retorno, reinicio tras decisión y varios clics rápidos.
3. Reproducir, pausar durante una transición, continuar, cambiar velocidad y salir del capítulo: no quedan temporizadores activos.
4. Teclado, foco y modo sin movimiento; toda la explicación sigue disponible.
5. Escritorio y móvil: objeto alineado a su nodo, texto legible, sin flechas engañosas ni desbordamiento.
6. Desafío que requiera entender el proceso, no solo esperar a que termine.

En la guía del facilitador documentar para cada escena su objetivo, fuente, simplificaciones, decisiones posibles y respuestas esperadas. Distinguir validación del modelo, prueba en navegador y revisión pedagógica; no afirmar la segunda si solo se hizo la primera.


## Versión 0.3

Para escenas 3D aplicar references/animaciones-3d.md (desde la raíz de la skill). Sus requisitos actualizan la preferencia de tecnología: el esquema HTML/SVG queda como alternativa accesible y de compatibilidad. Conservar el modelo de estados y las pruebas de este documento.

