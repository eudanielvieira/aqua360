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

## 2026-07-31 - board - monetizacao muda o texto da pagina Sobre, mais 4 ilustracoes
**Quem:** Daniel Vieira (agente)
- O projeto vai passar a ter propaganda e links de afiliado, e a página Sobre afirmava o contrário em
  três lugares. Saíram nos quatro idiomas: o parágrafo `story.p3` e os cards "Zero propaganda" e
  "Sem venda casada". Decisão registrada: remover sem texto substituto, e não trocar por um aviso de
  transparência. A seção "Como o projeto funciona" ficou com um card só.
- A contradição maior não está na Sobre e sim em `/apoie`: o `support.json` de pt e es promete
  "Sem anúncios" como benefício de quem apoia, justo na página onde a pessoa decide doar. Ficou
  intacto porque o escopo escolhido foi só a Sobre.
- Quatro ilustrações normalizadas: Barbo Xadrez (149), Betta (21), Bichir do senegal (132) e Bichir
  Marmorato (131). O acervo tratado foi de 33 para 37.
- Dois problemas de dado apareceram ao abrir as fichas para conferir a arte. O Betta tem
  `familia: "Anabantidae"` no campo manual contra Osphronemidae na taxonomia do GBIF, e a própria
  ficha exibe as duas: o rodapé "Espécies da mesma família (Anabantidae)" lista só o Gourami
  Leopardo. E o id 251 "Polypterus Senegalus" é duplicata do 132 "Bichir do senegal", registro quase
  vazio e sem imagem, enquanto o `ph` do 132 está gravado como a string `"a"`.
- Ajuste da nota da pausa anterior: os dois commits que ficaram `ahead 2` já estavam publicados ao
  abrir esta sessão, e os cinco desta também estavam ao fechar. O atraso do disparo é de minutos, não
  de sessões. O método da nota continua o mesmo: confirmar com `git fetch origin && git status -sb`.
- O board vinha dizendo 724 imagens em `public/images`. São 731.
- **Proximo:** consertar `/apoie`, que ainda promete "Sem anúncios", e decidir onde entra o aviso de
  divulgação de afiliado.
- **Detalhe:** commits `335fede`, `b7236be`, `0ab79c7`, `eaf1d03`, `a34798d`.

## 2026-07-31 - frente `0001-equalizacao-de-textos` - abertura e leva mecanica
**Quem:** Daniel Vieira (agente)
- Frente nova, a maior do projeto: spec com diagnostico medido (705 fichas, 154 completas, 92 ids
  colidindo, 1630 lacunas) e nove tasks mecanicas fechadas no mesmo dia. Placar do validador de 10536
  para 2598 bloqueantes, com formato, faixas, taxonomia, acentuacao e paridade zerados.
- Dois bugs apareceram ao abrir o app, nenhum previsto: `/guias` estava em tela branca nos quatro
  idiomas por uma chave de i18n que nunca existiu, e o `:` da chave nova colidia com o separador de
  namespace do i18next.
- **Proximo:** task 8, `posicaoAquario` nas 460 fichas em que a coluna esta 100% vazia.
- **Detalhe:** `dxspec/specs/0001-equalizacao-de-textos/journal/0001-2026-07-31-abertura-e-leva-mecanica.md`

## 2026-07-31 - board - SEO: head por rota, robots.txt e sitemap
**Quem:** Daniel Vieira (agente)
- Frente nova, aberta a partir de uma pergunta: como pôr meta tag em todas as páginas sem entregar o
  conteúdo inteiro ao Google. O diagnóstico achou coisa pior que a suposta: o `SEO.tsx` existia desde
  sempre mas estava ligado em **uma** das dezoito páginas (`FishDetailPage`), e como o HTML da SPA é
  uma casca só, as 926 URLs serviam o mesmo `<title>` e a mesma description. Não havia `robots.txt`,
  sitemap, canonical nem dado estruturado.
- Três decisões do Daniel fecharam o escopo: prerender do head no build (contra só react-helmet ou
  função na Vercel), fechar IA e abrir Busca no robots.txt, e adiar URL por idioma.
- O desenho é uma fonte só, `src/seo/meta.ts`, consumida pelos dois lados: o `scripts/generate-seo.ts`
  grava 926 HTMLs no `dist` depois do `vite build`, e o `SEO.tsx` refaz o mesmo head no cliente. Sem
  isso o build e a tela escreveriam títulos diferentes da mesma ficha.
- **Bug que só apareceu no navegador, e é o registro que mais importa aqui:** o react-helmet-async 3
  sobre React 19 não remove mais tag do DOM. Ele só renderiza `<title>`, `<meta>` e `<link>` como
  elemento normal e deixa o React 19 içar para o head, então ele **soma** às tags que vieram no HTML
  em vez de trocar. A página ficava com dois `canonical` apontando para URLs diferentes, que é pior
  que nenhum: o Google descarta o sinal inteiro. Marcar as tags com `data-rh` **não resolve** nessa
  versão, esse atributo só vale no caminho antigo (React 18 e anteriores). A saída foi o
  `src/seo/prerendered.ts`, que apaga o bloco entre os marcadores `<!--seo-->` quando o React assume.
  O `<title>` ficou fora do Helmet e é escrito via `document.title`, senão sobravam dois.
- Uma duplicata que persistiu no teste era cache do service worker servindo o bundle anterior. Vale
  lembrar em qualquer teste futuro de `dist`: desregistrar o SW antes de concluir que algo está
  quebrado.
- Cruzamento entre frentes que vale registrar: as descriptions das fichas saem dos **mesmos campos**
  que a spec 0001 está consertando. O gerador acusou 51 descrições curtas demais, que são exatamente
  as fichas magras do AC-7 (`completude`). Fechar as tasks da 0001 agora melhora o snippet do Google
  de carona, sem trabalho adicional de SEO.
- Verificado no build de produção com navegador: uma tag de cada por rota, na carga direta e na
  navegação interna; `/busca` com `noindex, follow` e fora do sitemap; o HTML servido sem JavaScript
  já traz o head certo (é o caminho do WhatsApp e do Facebook). Lint seguiu nos mesmos 71 erros
  pré-existentes.
- **Proximo:** URL por idioma (`/en/`, `/es/`, `/ja/`) com hreflang. É o que falta para os outros três
  idiomas saírem do escuro: hoje os quatro dividem a mesma URL e o Google indexa um só.
- **Detalhe:** commit `8c28378`; a seção SEO do `README.md` documenta o arranjo.

## 2026-07-31 - board - arrastar de lado troca de peixe no mobile
**Quem:** Daniel Vieira (agente)
- Pedido curto do Daniel: no celular, arrastar para o lado e cair no próximo peixe. Entregue na ficha
  de peixe. Arrastar para a esquerda abre a próxima espécie, para a direita volta para a anterior, e
  enquanto o dedo anda a ficha acompanha com 40% do arrasto (o resto vira resistência) com uma
  etiqueta na lateral mostrando qual espécie vem a seguir.
- A ordem do gesto é a mesma da listagem da categoria (ordenada pelo nome popular em pt), então a
  sequência que a pessoa viu na lista é a que o dedo percorre. Nas pontas o gesto só faz o conteúdo
  ceder um pouco e voltar, sem etiqueta.
- O que mais importa aqui não é o gesto, é o que ele **não** pode atropelar. Trava de direção nos
  primeiros 12px, e se o movimento for mais vertical que horizontal a rolagem ganha e o gesto é
  abortado. Os 28px da borda esquerda ficam reservados ao "voltar" do navegador, que usa essa faixa
  no iOS e no Chrome do Android. O mapa de distribuição arrasta sozinho pelo Leaflet e foi marcado com
  `data-swipe-ignore`, um atributo que o hook procura via `closest` na origem do toque. O
  `touch-action: pan-y pinch-zoom` deixa rolagem e zoom com o navegador e reserva só o eixo horizontal.
- Detalhe de implementação que evita jank em celular fraco: o conteúdo entra no `SwipeNav` por
  `children`, então o arrasto redesenha só a casca a cada quadro e a ficha inteira (imagens, mapa,
  taxonomia) não é redesenhada junto.
- Uma correção de carona que o gesto exigiu: o app não tinha reset de rolagem na troca de rota, então
  a ficha nova abria na altura em que a anterior estava. O `SwipeNav` chama `window.scrollTo` ao
  navegar. Vale saber que a navegação por link continua sem esse reset em qualquer outra tela.
- Verificado no navegador em viewport de 390x844 com eventos de toque sintéticos: os dois sentidos, o
  arrasto curto que volta sem trocar, o vertical que não navega, o que começa na borda e não navega, o
  de dentro do mapa que não navega, a ponta da lista freada sem etiqueta e a ficha nova abrindo no
  topo. `tsc -b` limpo e `eslint` sem erro nos três arquivos; os 71 do `bun run lint` seguem os mesmos
  pré-existentes.
- **Proximo:** decidir duas coisas. Se o gesto vale também em plantas, corais e doenças (o `SwipeNav`
  já é reutilizável, é só envolver o conteúdo) e se entra uma barra de anterior/próxima no rodapé da
  ficha, que resolveria a descoberta do gesto (hoje ninguém sabe que ele existe até tentar) e de
  quebra daria links entre espécies para o Google.
- **Detalhe:** commit `22305f2`
