# Dra. Danielle Hassene · Landing page

Landing page da psiquiatra Dra. Danielle Hassene (Barra da Tijuca, Rio de Janeiro). Projeto **React + Vite** (Node.js), sem backend.

- `index.html`: entrada do Vite com metas, Open Graph e JSON-LD (Physician, Person, WebSite, FAQPage).
- `src/App.jsx`: a página inteira; `src/styles.css`: estilos; ícones via `lucide-react`.
- `public/images/`: só as imagens usadas.
- `auditoria-seo-daniellehassene-2026-10-07.md`: revisão de SEO local e pendências antes de publicar.

## Rodar

```
npm install
npm run dev        # desenvolvimento
npm run build      # gera dist/
npm run preview -- --port 1234
```

## Deploy (Hostinger, Vercel, Netlify)

Framework: React (Vite) · build: `npm run build` · saída: `dist` · Node 18+.
