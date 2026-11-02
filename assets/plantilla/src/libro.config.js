// Configuración del libro: lo único que cambia de un tema a otro fuera de los pliegos.
// La usan la tapa 3D, la portadilla, el título de la pestaña, la cápsula, el cargador y el guardado.
export default {
  titulo: 'Título del libro', // texto corto: pestaña, cápsula, cargador
  // líneas de la tapa: las palabras de 1 a 3 letras (y, de, la…) se dibujan pequeñas y en cursiva
  tapa: ['Título', 'del', 'libro'],
  subtitulo: 'Un libro de ciencias en 3D · nivel', // bajo el título, en tapa y portadilla
  pregunta: '¿Pregunta que organiza la unidad?', // portadilla y pie de la tapa
  unidad: 'Unidad 0', // pie de la tapa: "Unidad 0 · pregunta"
  asignatura: 'Asignatura · nivel · Unidad 0', // antetítulo de la portadilla
  descripcion: 'Libro interactivo en 3D: cada diagrama se levanta de la página para predecir, probar y explicar.',
  autor: 'Nombre de la autora o autor',
  institucion: 'Institución',
  base: 'Basado en las Bases Curriculares (OA …) y en el Texto del Estudiante (Mineduc).',
  // tapa de tela: color de fondo y del dorado; ornamento dorado: 'onda' | 'sismograma' | 'ninguno'
  colorTapa: '#7a2f2a',
  colorOro: '#e2c27a',
  ornamento: 'onda',
  // clave de guardado local (cámbiala por libro para que no compartan sellos ni predicciones)
  storageKey: 'libro-3d-v1',
};
