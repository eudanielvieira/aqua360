# Journal global - Aqua360

> **Ledger cronologico append-only** do projeto todo. Uma entrada curta por handoff (qualquer frente,
> ou board-level). **So se acrescenta ao fim; nunca reescreva entradas antigas.** Recorte fino: cada
> entrada resume o que rodou e **aponta** pro detalhe (journal da frente / commit). Isto responde
> "o que aconteceu por ultimo?" sem carregar o historico inteiro.
>
> Convencao: entradas em ordem cronologica, **mais recente por ultimo** (append no fim). No resume,
> le-se so o rabo (ultimas N). O detalhe profundo mora no journal da frente (`dxspec/specs/NNNN-*/journal/`).

<!--
Novas entradas ENTRAM ABAIXO desta linha, sempre no fim. Formato de cada entrada (este exemplo fica
DENTRO deste comentario de proposito: um journal recem-criado nao tem nenhuma entrada real ainda, entao
o hook SessionStart nao injeta placeholder):

## <YYYY-MM-DD> - <frente `NNNN-<nome>` | board> - <slug do que rodou>
**Quem:** <nome> (<humano | agente>)
- <resumo em 1-2 linhas do que rodou nesta sessao>
- **Proximo:** <a proxima acao concreta>
- **Detalhe:** <dxspec/specs/NNNN-*/journal/000X-*.md | commit hash | "-">

Rotacao: quando este arquivo crescer demais, arquive por ano em dxspec/journal/<ANO>.md e recomece
dxspec/journal.md com o ano corrente. O hook so le dxspec/journal.md (ano corrente); anos arquivados
ficam disponiveis sob demanda, sem custo de carga.
-->

## 2026-07-30 - board - normalizacao das ilustracoes em 760x760 com marca dagua
**Quem:** Daniel Vieira (agente)
- 14 ilustrações novas viraram JPEG 760x760 com marca d'água diagonal do Aqua360, via
  `scripts/normalize-images.ts` (sharp). Encaixe sem corte, com a sobra preenchida por replicação das
  bordas, porque o fundo das ilustrações tem degradê e cor chapada deixava emenda visível.
- As imagens não apareciam no site: `getAllImages` punha as fotos do Wikipedia e do iNaturalist antes
  da local. Resolvido com o manifesto `src/data/normalized-images.ts`, que dá prioridade só à arte já
  tratada e preserva as outras 710 espécies. O hero da página de detalhe passou a ser quadrado nessas
  espécies, senão cortava a cabeça da arraia.
- Originais saíram de `public/new-images` para `source-images/`, fora de `public/`, porque o Vite
  copia `public/` inteiro para `dist/`. Ignorados no git e no `.vercelignore`.
- **Proximo:** publicar os 3 commits e processar o próximo lote de ilustrações em `source-images/`.
- **Detalhe:** commits `a9f621c`, `d09870f`, `9d58684`.
