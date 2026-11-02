import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import CFG from './src/libro.config.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Un solo index.html autocontenido: se abre con doble clic, sin servidor, y se sube tal cual a Moodle o a un hosting.
export default defineConfig({
  base: './',
  plugins: [
    viteSingleFile(),
    {
      name: 'datos-del-libro',
      transformIndexHtml: (html) => html
        .replaceAll('%TITULO%', esc(CFG.titulo))
        .replaceAll('%SUBTITULO%', esc(CFG.subtitulo))
        .replaceAll('%DESCRIPCION%', esc(CFG.descripcion)),
    },
  ],
  build: { target: 'es2020', assetsInlineLimit: 100000000, chunkSizeWarningLimit: 4000 },
});
