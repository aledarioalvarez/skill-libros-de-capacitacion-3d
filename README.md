# Libros de Capacitación

Skill para transformar PDF o texto fuente en libros de capacitación con escenas pop-up 3D: gráficos con volumen que emergen de las páginas y animaciones que ayudan a comprender.

**Versión 0.5.0 · Español · HTML autocontenido · Actividades y evaluación**

## Qué hace

- Lee y organiza el PDF o texto fuente en objetivos y capítulos.
- Conserva referencias a las páginas y distingue contenido fuente de ejemplos añadidos.
- Identifica procesos, decisiones, transformaciones y relaciones que conviene visualizar.
- Presenta un libro abierto con profundidad, sombras y despliegue de objetos desde sus páginas.
- Construye escenas 3D con reproducción, pausa, pasos, bifurcaciones y controles de cámara.
- Ofrece alternativas 2D y texto cuando WebGL no está disponible.
- Incluye ejercicios, retroalimentación y una guía para facilitar la capacitación.
- Cierra con una celebración breve y una constancia PDF local, habilitada con criterios explícitos de finalización.
- Verifica fidelidad, funcionamiento, legibilidad y adaptación a escritorio y móvil.

## Cómo usarla

1. Descargá este repositorio completo o clonalo como carpeta `libros-de-capacitacion`:

   ```bash
   git clone https://github.com/aledarioalvarez/skill-libros-de-capacitacion-3d.git libros-de-capacitacion
   ```

2. Instalá su carpeta en el directorio de skills de tu asistente, siguiendo las indicaciones del cliente. Deben conservarse las carpetas de recursos junto a `SKILL.md`.
3. Proporcioná el PDF o texto fuente y pedí:

> Usá la skill Libros de Capacitación para convertir este material en un libro pop-up: que los gráficos salgan de las páginas, con animaciones que expliquen el contenido, controles de cámara, reproducción, pausa y pasos.

El cliente debe admitir skills y acceso a archivos. Para producir los entregables también se necesitan herramientas de ejecución; tener el texto de la skill no crea un servicio de conversión por sí solo. La forma de instalación y activación depende del asistente utilizado.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `SKILL.md` | Instrucciones principales |
| `agents/openai.yaml` | Metadatos opcionales de presentación para clientes compatibles |
| `assets/plantilla/` | Plantilla de libro pop-up con Three.js |
| `assets/process-model.mjs` | Modelo de estados, transiciones e historial |
| `assets/process3d-view.mjs` | Referencia de vista 3D para procesos de seis estaciones, adaptable al material |
| `scripts/nuevo-libro.mjs` | Preparación de un proyecto desde la plantilla |
| `examples/pensar-popup/` | Libro autónomo aprobado como referencia, guía, licencias y alcance de verificación |
| `references/calidad-popup.md` | Estándar visual, interacción y matriz de aceptación |
| `references/` | Arquitectura, diseño pedagógico, animaciones, accesibilidad y pruebas |

## Requisitos

- Un asistente con soporte de skills, archivos y ejecución de código.
- Node.js y npm para la vía de construcción con la plantilla.
- Herramientas de lectura de PDF; OCR si el documento está escaneado.
- Un navegador con WebGL para las escenas 3D. La alternativa 2D conserva las actividades.
- Para narración opcional, configurar las herramientas y credenciales descritas en `references/narracion.md`. No se requiere una clave de voz para el libro básico.

Preparar un proyecto con la plantilla:

```bash
node scripts/nuevo-libro.mjs ./mi-libro
```

El comando prepara los archivos; el asistente todavía debe adaptar contenidos, construir escenas y realizar las pruebas indicadas en la skill.

## Qué entrega

Un libro `index.html`, una guía del facilitador y un paquete de descarga con los recursos necesarios. El HTML puede distribuirse sin conexión si todos los recursos fueron incorporados durante la construcción. No se publica automáticamente ni se conectan servicios externos por defecto.

## Ejemplo de referencia

[Le habían enseñado a pensar](examples/pensar-popup/index.html) incluye un libro abierto, edificio y barómetro volumétricos, siete demostraciones, alternativa 2D, evaluación y cierre con constancia PDF. Para usarlo, descargá el repositorio completo y abrí ese archivo en un navegador compatible; la vista de código de GitHub no ejecuta el HTML.

Consultá su [guía](examples/pensar-popup/guia-facilitador.html) y el [registro de verificación](examples/pensar-popup/verificacion.txt). El ejemplo fue aprobado por el usuario y pasó comprobaciones de lógica; la prueba visual automatizada quedó pendiente por limitaciones del entorno. Cada nuevo libro debe verificarse por separado. No es obligatorio repetir su tema, paleta ni cantidad de capítulos.

## Cierre y constancia

En el ejemplo, se necesitan al menos 3 respuestas correctas de 4 y una reflexión final escrita. Al pulsar **Finalizar recorrido**, aparece un sello breve (estático con movimiento reducido). El participante ingresa su nombre y descarga una **Constancia de finalización** con título, fecha y resultado. No hay envío de datos ni certificación institucional. Cambiar respuestas o reflexión invalida la finalización guardada; los PDF ya descargados no pueden revocarse.

El PDF se genera dentro del HTML con pdf-lib incorporado. Se verificaron los criterios y el flujo con un entorno simulado, y se inspeccionaron PDF renderizados. La animación y la descarga en navegador real siguen pendientes de comprobación. Ver [cierre-y-constancia.md](references/cierre-y-constancia.md) para aplicar el estándar a otros cursos.

## Criterio pedagógico

Cada interacción debe ayudar a comprender una relación, una transformación o una decisión. La skill no obliga a animar todos los capítulos ni a representar en 3D algo que se explica mejor con texto o una tabla. Si el PDF no documenta un proceso, los casos añadidos deben identificarse como ejemplos didácticos.

En materiales normativos, conservar sujetos, condiciones, plazos y excepciones. Los ejemplos de evidencia no deben convertirse en nuevas obligaciones. El progreso local no equivale a cumplimiento, certificación ni seguimiento institucional.

## Licencia

MIT. Conservar los avisos de copyright y licencia incluidos en el repositorio. Ver `LICENSE` y `THIRD_PARTY_NOTICES.md`.
