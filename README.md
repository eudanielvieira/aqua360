# Aqua360

## SEO

O app é uma SPA, então o HTML que sai do Vite é uma casca só: sem tratamento, as
926 URLs entregam o mesmo título e a mesma descrição para qualquer rastreador. O
arranjo abaixo resolve isso sem servidor no meio.

**Onde ficam os textos.** `src/seo/meta.ts` é a fonte única. Ele deriva título e
descrição de cada ficha a partir dos mesmos dados que a tela usa, e guarda o
texto das páginas fixas. Quem consome são os dois lados, para o que o Google lê
e o que o usuário vê não divergirem:

- `scripts/generate-seo.ts` roda depois do `vite build` e grava um
  `dist/<rota>/index.html` por rota, com head completo e JSON-LD de trilha. É o
  que rastreador sem JavaScript (WhatsApp, Facebook, LinkedIn) recebe. Também
  escreve o `dist/sitemap.xml`.
- `src/components/SEO.tsx` refaz o mesmo head no cliente, para a navegação
  interna e a troca de idioma não congelarem no head da primeira rota aberta.

Como os dois escrevem as mesmas tags, `src/seo/prerendered.ts` apaga o bloco que
veio no HTML quando o React assume. Sem isso a página fica com dois `canonical`
divergentes, e o Google descarta o sinal inteiro.

**Rotas novas.** Rota sem parâmetro só entra no sitemap depois de ganhar uma
linha em `staticPages`, de propósito: obriga a escrever a descrição em vez de
publicar a genérica.

**Idioma.** O build publica só pt-BR. Os quatro idiomas dividem a mesma URL
(a detecção é por `localStorage` em `src/i18n.ts`), então o Google indexa uma
versão só e não há como declarar `hreflang`. Dar URL própria a cada idioma
(`/en/...`) é o passo que falta para os outros três saírem do escuro.

**Quem pode rastrear.** `public/robots.txt` libera buscador e bloqueia robô de
treino de IA (Google-Extended, GPTBot, ClaudeBot, CCBot, PerplexityBot e
companhia). `Google-Extended` não afeta o ranking da Busca, só tira o conteúdo
do Gemini e dos AI Overviews. As páginas indexáveis vão com `max-snippet:160`,
que segura o trecho exibido no tamanho de um resumo.

Vale saber que o acervo já é público de qualquer jeito: os dados vão inteiros
nos chunks JS. Meta tag não muda isso; blindar de verdade exigiria mover os
dados para uma API.

**Comandos.**

```bash
bun run build            # inclui a geração do SEO
bun run generate-seo     # regera o head e o sitemap sobre um dist já existente
bun run generate-og-image  # refaz o card de compartilhamento padrão (só se a marca mudar)
```

O `generate-seo` avisa sobre título acima de 60 caracteres e descrição curta
demais. Não derruba o build: descrição curta é sintoma de ficha magra no acervo,
não de erro no gerador.

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
