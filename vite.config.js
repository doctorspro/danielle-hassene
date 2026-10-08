import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// CSS inline no index.html: elimina a requisição que bloqueia a renderização
// e deixa as @font-face visíveis já no HTML. ponytail: só faz sentido enquanto o CSS for pequeno (~6 KB gzip)
function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const html = bundle['index.html'];
      if (!html) return; // build SSR não tem index.html
      for (const [name, asset] of Object.entries(bundle)) {
        if (!name.endsWith('.css')) continue;
        const tag = new RegExp(`<link rel="stylesheet"[^>]*href="/${name}"[^>]*>`);
        if (!tag.test(html.source)) continue;
        html.source = html.source.replace(tag, () => `<style>${asset.source}</style>`);
        delete bundle[name];
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss()],
  build: { outDir: 'dist' },
});
