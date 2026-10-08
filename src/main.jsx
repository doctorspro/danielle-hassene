import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';

const root = document.getElementById('root');
const app = <StrictMode><App /></StrictMode>;
// HTML pré-renderizado no build (prerender.js) → hidrata; em dev o root vem vazio
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
