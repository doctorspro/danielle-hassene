// Copia o site estático para dist/ (saída usada por Hostinger, Vercel, Netlify etc.)
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist');
fs.copyFileSync('index.html', 'dist/index.html');
fs.cpSync('images', 'dist/images', {
  recursive: true,
  filter: (src) => fs.statSync(src).isDirectory() || html.includes(src.split('\\').join('/')),
});
console.log('dist/ pronto');
