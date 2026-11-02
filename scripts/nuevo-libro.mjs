// Crea un proyecto de libro 3D nuevo a partir de la plantilla de la skill.
// Uso: node nuevo-libro.mjs "C:\ruta\al\proyecto" [--sin-instalar]
// Copia la plantilla e instala dependencias (npm ci), salvo --sin-instalar.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const plantilla = path.resolve(here, '..', 'assets', 'plantilla');
const destino = process.argv[2];
if (!destino) { console.error('Uso: node nuevo-libro.mjs "C:\\ruta\\al\\proyecto" [--sin-instalar]'); process.exit(1); }
const dest = path.resolve(destino);
if (fs.existsSync(dest) && fs.readdirSync(dest).some((f) => !f.startsWith('.'))) {
  console.error(`La carpeta ${dest} ya tiene archivos: elige una carpeta vacía o nueva.`);
  process.exit(1);
}
fs.mkdirSync(dest, { recursive: true });
fs.cpSync(plantilla, dest, { recursive: true });
fs.mkdirSync(path.join(dest, 'src', 'audio'), { recursive: true });
console.log(`✔ Plantilla copiada en ${dest}`);
if (!process.argv.includes('--sin-instalar')) {
  console.log('… instalando dependencias (npm ci)');
  execSync('npm ci --no-audit --no-fund', { cwd: dest, stdio: 'inherit' });
}
console.log(`
Siguientes pasos:
  1. Edita src/libro.config.js (título, tapa, autor, colores, storageKey).
  2. Crea los pliegos en src/spreads/ (copia s01-ejemplo.js) y regístralos en src/spreads/index.js.
  3. Vista previa: npx vite --port 5174   ·   Compilar: npx vite build  →  dist/index.html
`);
