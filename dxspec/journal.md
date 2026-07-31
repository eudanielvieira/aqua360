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

## 2026-07-31 - board - acervo em 33 ilustracoes, ficha em infobox e duas fusoes
**Quem:** Daniel Vieira (agente)
- O acervo tratado foi de 14 para 33 ilustrações, entre elas os três Apistogramma, os barbos, as duas
  arraias, o Aruanã e o Auratus. O preenchimento das sobras mudou duas vezes até acertar: replicação
  de borda criava estria vertical, tira desfocada espalhava o peixe encostado na borda, e a solução
  foi cor chapada por lado tirada pela mediana. Emenda de no máximo 2 em 255 nas 33.
- A ficha da página de peixe virou infobox: nomes no topo com hierarquia, imagem à esquerda e tabela
  compacta à direita, no lugar dos seis cards que dominavam a tela.
- Duas espécies estavam duplicadas e foram fundidas, ambas pelo mesmo motivo (sinônimo antigo
  convivendo com o nome aceito): Barbo Denison (148 sobrevive, 222 removido) e Barbo Sumatra /
  Barbo Tigre (151 sobrevive, 221 removido). Água doce foi de 247 para 245 registros.
- Descoberto um bug de i18n que atinge 74 espécies: a tradução é indexada só pelo id e água doce e
  salgada têm numeração própria, então em EN/ES/JA essas fichas servem conteúdo de peixe trocado.
- Correção de rumo: durante a sessão inteira eu relatei "deploy pendente, commits só no local". Estava
  errado. O reflog de `origin/main` mostra `update by push` logo após cada commit, 64 no total, e
  `HEAD` está igual a `origin/main`. Tudo já foi publicado.
- **Proximo:** decidir se migra o chaveamento das traduções para acabar com as 74 colisões.
- **Detalhe:** de `5a49be7` a `dbfa570`, 18 commits.

## 2026-07-31 - board - revisao da pagina Sobre
**Quem:** Daniel Vieira (agente)
- Revisão do `about.json` em português. O problema real não era escrita, eram números: o catálogo
  dizia 707 peixes e são 705, e "mais de 788 espécies" subestimava o acervo, que somando peixes,
  invertebrados, plantas e corais dá 890. O arquivo também estava inteiro sem acentuação e usava `--`
  como travessão.
- A contagem fixa de 247 em `fish-index.ts` ficou desatualizada quando removi os dois registros
  duplicados na sessão anterior. Ela alimenta a lista de categorias e o total de animais da home, que
  mostravam um peixe a mais do que existe. Corrigida para 245.
- Ajuste da nota anterior: registrei que a publicação era automática e imediata. É automática, mas não
  imediata. Ao fechar esta sessão `main` está `ahead 2` de `origin/main`, com o handoff anterior e o
  commit da página Sobre ainda não publicados.
- **Proximo:** replicar os números corrigidos em en, es e ja, que seguem com 707, 788 e os `--`.
- **Detalhe:** commit `5b715ff`.
