// Gera o HTML da página no build: o conteúdo aparece sem esperar o JS (LCP) e fica visível a crawlers.
import fs from 'node:fs';
import { render } from './dist-ssr/entry-server.js';

const file = 'dist/index.html';
const html = fs.readFileSync(file, 'utf8');
const marker = '<div id="root"></div>';
if (!html.includes(marker)) throw new Error('marcador #root não encontrado em dist/index.html');
fs.writeFileSync(file, html.replace(marker, `<div id="root">${render()}</div>`));
fs.rmSync('dist-ssr', { recursive: true, force: true });
console.log('prerender ok');
