# Libros de Capacitación

Skill para transformar PDF en libros de capacitación interactivos, con animaciones 3D cuando aporten claridad.

**Versión 0.3 · Español · HTML autocontenido · Actividades y evaluación**

## Qué hace

- Lee y organiza el PDF en objetivos y capítulos.
- Conserva referencias a las páginas y distingue contenido fuente de ejemplos añadidos.
- Identifica procesos, decisiones, transformaciones y relaciones que conviene visualizar.
- Construye escenas 3D con reproducción, pausa, pasos, bifurcaciones y controles de cámara.
- Ofrece alternativas 2D y texto cuando WebGL no está disponible.
- Incluye ejercicios, retroalimentación y una guía para facilitar la capacitación.
- Verifica fidelidad, funcionamiento, legibilidad y adaptación a escritorio y móvil.

## Cómo usarla

1. Descargá este repositorio completo o clonalo como carpeta `libros-de-capacitacion`:

   ```bash
   git clone https://github.com/aledarioalvarez/skill-libros-de-capacitacion-3d.git libros-de-capacitacion
   ```

2. Instalá su carpeta en el directorio de skills de tu asistente, siguiendo las indicaciones del cliente. Deben conservarse las carpetas de recursos junto a `SKILL.md`.
3. Proporcioná el PDF y pedí:

> Usá la skill Libros de Capacitación para convertir este PDF en un libro. Identificá sus procesos y representalos con animaciones 3D interactivas, decisiones y controles paso a paso.

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
| `references/` | Arquitectura, diseño pedagógico, animaciones, accesibilidad y pruebas |
| `examples/` | Ejemplo técnico de un libro educativo |

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

## Criterio pedagógico

Cada interacción debe ayudar a comprender una relación, una transformación o una decisión. La skill no obliga a animar todos los capítulos ni a representar en 3D algo que se explica mejor con texto o una tabla. Si el PDF no documenta un proceso, los casos añadidos deben identificarse como ejemplos didácticos.

En materiales normativos, conservar sujetos, condiciones, plazos y excepciones. Los ejemplos de evidencia no deben convertirse en nuevas obligaciones. El progreso local no equivale a cumplimiento, certificación ni seguimiento institucional.

## Licencia

MIT. Conservar los avisos de copyright y licencia incluidos en el repositorio. Ver `LICENSE` y `THIRD_PARTY_NOTICES.md`.
