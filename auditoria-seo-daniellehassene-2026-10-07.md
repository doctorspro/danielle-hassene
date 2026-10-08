# Auditoria SEO local · daniellehassene.com.br (landing page) · 2026-10-07

Alvo: `index.html` servido em http://127.0.0.1:1234 (pré-publicação). Keyword-alvo: **psiquiatra na Barra da Tijuca** (intenção comercial/local). Secundárias: psiquiatra Rio de Janeiro, psicoterapia Barra da Tijuca, medicina do sono, teleconsulta psiquiatra.

## Placar (antes → depois)

| Dimensão | Antes | Depois | Nota |
|---|---|---|---|
| Técnico | 5 | 8 | canonical, robots meta, preload do hero. robots.txt e sitemap dependem do deploy |
| On-page | 4 | 9 | title 57 chars com keyword no início, meta 157 chars, H1 com keyword local, 1.307 palavras |
| Intenção/keyword | 3 | 8 | página agora declara entidade + lugar no H1, subtítulo, Sobre, Consultório, CTA e rodapé (NAP) |
| AEO | 4 | 9 | 8 FAQs com resposta direta (40–70 palavras) + `FAQPage`; 2 perguntas locais novas |
| GEO | 2 | 8 | `Physician` + `Person` (CRM, RQE, formação) + `WebSite`; definição de entidade no Sobre |
| Dados estruturados | 0 | 9 | JSON-LD válido: Physician, Person, WebSite, FAQPage |
| E-E-A-T | 5 | 7 | credenciais visíveis + schema. Faltam links `sameAs` (Instagram, Doctoralia, Google Business) |
| Performance | 4 | 8 | hero PNG 2,7 MB → WebP 59 KB (JPEG 149 KB fallback) com preload; fontes com `display=swap` |
| Social/OG | 0 | 9 | OG + Twitter card com imagem 1200×630 |
| Analytics | 0 | 0 | sem GA4/GSC. Instalar antes de publicar |
| Conteúdo | 5 | 7 | copy local sem stuffing. **5 depoimentos são fictícios** (P0 antes de publicar) |

## O que foi corrigido (implementado)
1. `<title>`: "Psiquiatra na Barra da Tijuca, RJ | Dra. Danielle Hassene".
2. Meta description com keyword + CTA (157 chars), canonical, `robots`, `geo.region`/`geo.placename`.
3. Open Graph e Twitter card com `images/og-danielle-hassene.jpg` (1200×630).
4. JSON-LD `@graph`: Physician (endereço, área atendida, serviços, mapa), Person (CRM, RQE, alumniOf, ABP), WebSite, FAQPage (8 perguntas).
5. H1 agora contém "Psiquiatra na Barra da Tijuca · Rio de Janeiro" + frase de marca.
6. Copy geolocalizada: subtítulo do hero, manifesto, Atendimentos (H2 vira pergunta), Sobre (definição de entidade: "Sou Danielle Hassene, médica psiquiatra no Rio de Janeiro"), Consultório (Shopping Downtown, estacionamento), CTA, rodapé com NAP em `<address>`.
7. FAQ: pergunta 1 corrigida (texto trocado no design), + "Onde fica o consultório?" e "A consulta pode ser por teleconsulta?"; telefones CVV/SAMU viraram `tel:`.
8. Hero: `images/hero-consultorio.webp` (59 KB) com fallback JPEG e `preload`.
9. Overflow horizontal no mobile (título do manifesto) corrigido.

## Pendências para publicar (por prioridade)
- **P0** Trocar os 5 depoimentos fictícios por avaliações reais do Google (ou remover). Só então adicionar `aggregateRating` ao schema. Atenção à Resolução CFM 2.336/2023 sobre depoimentos.
- **P0** Links de WhatsApp/Agendar (`#`) → `https://wa.me/55DDDNÚMERO?text=...` e `tel:`. É a conversão principal.
- **P0** Perfil no Google Business Profile com o mesmo NAP do rodapé; adicionar a URL em `sameAs` (Physician) junto com Instagram/Doctoralia.
- **P1** GA4 + Search Console; evento de clique no WhatsApp como conversão.
- **P1** No deploy: `robots.txt` liberando GPTBot/ClaudeBot/PerplexityBot, `sitemap.xml`, HTTPS, cache/CDN, servir WebP para as fotos do consultório.
- **P2** Telefone e horário de atendimento no schema (`telephone`, `openingHoursSpecification`) quando definidos.
- **P2** Páginas satélite por serviço (ansiedade, TDAH, sono, canabinoide) linkando para esta LP, para cluster tópico.
- **P3** `llms.txt` e política de privacidade.
