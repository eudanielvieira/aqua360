---
name: STATE
description: BOARD de frentes - roteador fino que o hook carrega. Aponta pro STATE local de cada frente.
alwaysApply: true
---

# STATE (Board) - Frentes de trabalho

> **Board.** Roteador, nao a memoria detalhada. O hook `SessionStart` carrega este arquivo; daqui
> voce vai pro **STATE local** da frente em foco (`dxspec/specs/NNNN-*/STATE.md`). Cada frente guarda
> sua propria memoria junto do seu artefato, pra nao desconectar do todo.
>
> **Convencao de pastas:** `dxspec/` = fonte da verdade de engenharia (SDD: board, specs, mapas).
> Swagger/OpenAPI/docs de API NAO ficam aqui, vao em `api-docs/` ou sao gerados.

**Ultima atualizacao:** 2026-08-01 por Daniel Vieira (visualizador de imagem em tela cheia)

## Foco atual
- **Equalização de textos (spec 0001).** A maior frente do projeto e a que está ativa. Água doce está
  com **100% dos parâmetros preenchidos** e 44 fichas já têm o texto na voz de aquarista (lotes 01 e
  02). A ficha de peixe é **homogênea**: mesmas seções em todas as espécies, com a lacuna aparecendo
  como "Não informado" em vez de sumir da tela. Em 2026-08-01 uma **leva de arte** mexeu no tamanho do
  acervo: 75 espécies ganharam ilustração própria e **27 fichas novas** foram criadas porque a arte
  chegou sem ter onde morar. Ficha mínima em água doce subiu de 72% para **75%**; o total de
  bloqueantes subiu de 2011 para 2078, que é só a dívida de tradução das fichas novas.
  **A frente segue travada na sua revisão do lote piloto**, e agora o lote 02 está na mesma fila. Ver
  `dxspec/specs/0001-equalizacao-de-textos/STATE.md`.
- **Monetização.** Os anúncios **estão no ar**: a tag do AdSense chegava a zero das 952 páginas
  publicadas porque estava dentro do bloco `<!--seo-->`, que o gerador reescreve, e foi movida para
  fora, com o `ads.txt` que o programa exige. Junto saiu a promessa de "Sem anúncios" do `/apoie` nos
  quatro idiomas. Falta só o **aviso de divulgação de afiliado**, que não existe em página nenhuma e
  agora é risco real, não hipotético.
- **SEO.** Estrutural entregue: o site servia o mesmo título e a mesma descrição nas 926 URLs, e
  agora o build grava o head de cada rota no HTML publicado, com robots.txt fechando robô de treino
  de IA e sitemap de 925 URLs. Pausada com um passo seguinte claro e grande: URL por idioma. Detalhe
  no journal global.
- **Gesto no mobile.** Frente pequena, entregue: na ficha de peixe, arrastar o dedo para o lado troca
  de espécie, agora com a passagem de card (a ficha sai pela borda, a seguinte entra pela oposta).
  Pausada com duas decisões abertas, ambas de produto: estender às outras fichas e resolver a
  descoberta do gesto. Detalhe no journal global.
- **Normalização de ilustrações.** Deixou de ser gota a gota: em 2026-08-01 entrou uma leva de 86
  arquivos de uma vez, e o manifesto de arte própria saiu de 38 para **113 slugs**. Os originais
  agora moram fora do repositório, em `aquarismo/ilustracoes/`, com README ligando cada slug ao nome
  de origem.
- **Visualizador de imagem.** Frente pequena, entregue: clicar na imagem abre em tela cheia com zoom
  próprio, na ficha de peixe, na de planta e nas fotos da comunidade. Ficou pausada com uma decisão
  aberta (o placeholder de imagem quebrada) e uma extensão possível (coral e doença). Detalhe no
  journal global.

## Frentes
> Uma linha por frente. Status: ativa | on-deck | concluida | pausada.

| Frente | Status | STATE local | Proximo passo (resumo) |
|--------|--------|-------------|------------------------|
| Equalização de textos (0001) | ativa | `dxspec/specs/0001-equalizacao-de-textos/STATE.md` | Água doce com parâmetros em 100%, ficha homogênea (`b5703c4`) e 44 fichas com texto novo (lotes 01 e 02). A leva de arte de 2026-08-01 trouxe 27 fichas novas e levou água doce a 75% de ficha mínima. Próxima: **sua revisão do lote 01**, que agora destrava o 02 também. Decisão rápida pendente: GH e KH nas 346 marinhas, que hoje saem como "Não informado" sendo que marinho não tem esses parâmetros por espécie |
| Monetização (propaganda + afiliados) | ativa | - | AdSense no ar nas 952 páginas com `ads.txt`, e a promessa de "Sem anúncios" removida dos quatro idiomas (`4d59f23`). Falta **só o aviso de divulgação de afiliado**, que virou risco real agora que o anúncio já carrega |
| SEO (sem spec própria) | pausada | - | Base entregue (commit `8c28378`): head por rota gerado no build, robots.txt, sitemap de 925 URLs. Próximo: URL por idioma (`/en/`, `/es/`, `/ja/` + hreflang), que é o que destrava os outros três idiomas. Vira spec se for encarado |
| Gesto no mobile (sem spec própria) | pausada | - | Entregue na ficha de peixe (commits `22305f2`, `bef4c39`): arrastar para o lado troca de espécie, na ordem da listagem, com passagem de card no lugar da troca seca. Próximo: decidir se vale em plantas, corais e doenças (`SwipeNav` já é reutilizável) e se entra barra de anterior/próxima no rodapé, que resolve a descoberta do gesto |
| Visualizador de imagem (sem spec própria) | pausada | - | Entregue em 2026-08-01 (`1601149`): clicar abre em tela cheia com zoom próprio, na ficha de peixe, na de planta e nas fotos da comunidade, que passaram a pedir a versão `large` do iNaturalist. Próximo: decidir o placeholder de imagem quebrada (ver todos) e se vale estender a coral e doença, que hoje montam a imagem na mão sem passar pelo `FallbackImage` |
| Normalização de imagens (sem spec própria) | pausada | - | Leva de 86 arquivos processada em 2026-08-01 (`e28e2ea`, `42fabc5`): manifesto de 38 para 113 slugs, originais movidos para `aquarismo/ilustracoes/`, fora do repositório. Restam ~618 das 776 imagens ainda no arquivo antigo de 180x135. Próximo: o lote seguinte que chegar |
| Colisão de ids nas traduções | concluida | `dxspec/specs/0001-equalizacao-de-textos/` | Resolvida como task 2 da spec 0001, commit `7789e9a`. Eram 92 ids, não 74: a contagem antiga só olhava doce contra salgada |

> Frentes sem pasta propria (ex.: IMP-*) vivem como linha aqui ate virarem feature/spec.

## Bloqueios (cross-frente)
- **Lote piloto de texto esperando sua revisão** (`scripts/textos-pt/lote-01.json`, guia em
  `dxspec/specs/0001-equalizacao-de-textos/voz.md`). Enquanto não passar, a reescrita não escala. O
  lote 02 (24 fichas novas) já está publicado e entra na mesma revisão.
- **`bun run enrich` não pode ser rodado.** O `enrich-data.ts` regrava o bloco `enrichment` inteiro e
  não preserva `wikiPhotoUrl`. Em 2026-08-01 apagou 372 URLs de foto, que são a imagem de fallback
  das centenas de fichas sem arte própria; restaurei as 190 de água doce e reverti os outros
  arquivos. O bug segue lá. Correção: fundir o bloco em vez de substituir.
- **Quatro pares de ficha duplicada em água doce** esperando sua decisão de fundir ou manter (177/25,
  178/176, 205/50, 163/237). Fundir apaga rota e mexe no sitemap e nas quatro traduções.
- Alerta de conformidade, **agora ativo e não mais hipotético**: o AdSense já carrega nas 952 páginas
  e não existe aviso de divulgação em lugar nenhum. Programas como o Amazon Associates exigem aviso
  visível. Isso é decisão de produto, não trava código.

## Todos soltos (nao pertencem a uma frente ainda)
> Sete todos que estavam aqui viraram task da spec 0001 e saíram desta lista: família errada no Betta,
> duplicata `Polypterus senegalus`, colisão de ids nas traduções, números do acervo escritos à mão,
> limpeza de travessão no `fish-agua-doce.ts`, fichas quase vazias e a replicação dos números da
> página Sobre em en/es/ja. O nome popular repetido entre os ids 16 e 112 também: virou caso de borda
> da spec, com o validador avisando sem bloquear.

- [x] ~~**`/apoie` promete "Sem anúncios".**~~ Fechado em 2026-08-01 (commit `4d59f23`): o terceiro
      cartão de benefício saiu, as chaves `benefit.adFree` saíram dos quatro idiomas e a
      `description` mais o texto do Buy Me a Coffee em en, es e ja foram alinhados com o pt-BR.
- [ ] **Aviso de divulgação de afiliado.** Não existe em nenhuma página. Com os cards de princípio
      removidos, a Sobre agora não fala nada sobre monetização. Decidir o lugar: card novo na Sobre,
      linha no rodapé ou página própria. **Subiu de prioridade**: o anúncio já está no ar.
- [ ] Normalizar o resto do acervo. **113 das 776 imagens** em `public/images` estão tratadas, contra
      38 antes da leva de 2026-08-01; o restante ainda é o arquivo antigo de 180x135. O caminho é
      jogar os originais em `source-images/` com o nome do slug e rodar
      `node scripts/normalize-images.ts <nome>`, que já atualiza o manifesto sozinho. Na família
      Polypteridae falta só o Peixe-Corda (58).
- [ ] **A rede de proteção de imagem quebrada está furada, e precisa da sua decisão.** Duas coisas,
      as duas pré-existentes e achadas em 2026-08-01 ao mexer no visualizador. Primeira: o
      `SimilarSpecies` renderiza `src=""` quando a espécie não tem imagem nem foto, o que faz o
      navegador rebaixar a página inteira (são **25 plantas e 57 peixes** sem `imagem`; o *Anubias
      barteri* dispara na ficha da Tonkinensis). Segunda: o **`/images/avatar.jpg` não existe**, e é
      para onde apontam os **nove `onError`** espalhados por `SimilarSpecies`, `SearchPage`,
      `CompatibilityPage` e `AquariumBuilderPage`. A decisão é qual fallback usar: criar um
      placeholder de verdade ou reaproveitar o estado vazio que o `FallbackImage` já desenha (ícone
      mais o nome da espécie). Escolhido o caminho, é uma passada nos nove pontos.
- [ ] **Uma ilustração ficou sem destino** em `aquarismo/ilustracoes/sem-destino/`: corpo amarelo com
      sete barras pretas e nadadeiras escarlates, que é fêmea de *Mesoheros festae* e não existe no
      acervo. Ou entra ficha nova para a espécie, ou a arte se perde.
- [ ] **Duas identificações com confiança média** para reconferir se aparecer fonte melhor: o
      registro 48 (`Cyprichromis leptosoma`) recebeu arte cujas barras verticais são mais típicas de
      *C. zonatus*, que o acervo não tem; e a ficha nova 151 (`Cryptocoryne crispatula var.
      tonkinensis`) foi criada a partir da imagem, e não o contrário, sendo a única da leva nessa
      condição.
- [ ] Decidir o que fazer com o slug `symphysodonauequifasciatus`, que tem um typo ("auequi") vindo do
      dado antigo. Renomear exige mexer no arquivo e no campo `imagem` do Acará Disco ao mesmo tempo.
- [ ] **`FishCategoryPage` ordena o array do módulo de dados no lugar** (`data.sort(...)`, sem cópia),
      ou seja, mexe no array compartilhado por todas as telas. Hoje não dá sintoma porque a ficha
      ordena uma cópia com a mesma chave (`nomePopular`), mas morde no dia em que alguém pedir outra
      ordenação. `[...data].sort(...)` resolve, como o `FishDetailPage` já faz.
- [ ] 71 erros de lint pré-existentes no projeto, a maioria `no-explicit-any` e `set-state-in-effect`.
      Não vieram deste trabalho, mas seguram qualquer gate de CI que rode `bun run lint`.
- [ ] **O projeto não tem runner de teste.** Não existe `vitest` nem script `test` no `package.json`, e
      a verificação de cada entrega tem sido manual no navegador. Enquanto isso não muda, nenhum gate
      de CI consegue exigir teste, e coisas como o gesto de arrastar (que tem regra de borda: trava de
      direção, faixa da borda, zona ignorada) ficam sem rede de proteção contra regressão.
- [ ] **Rolagem não volta ao topo ao trocar de rota por link.** O app nunca teve reset de rolagem; o
      `SwipeNav` resolveu só no caminho do gesto, chamando `window.scrollTo` ao navegar. Quem abre uma
      espécie parecida pelo rodapé da ficha continua caindo no meio da página nova. A correção certa é
      um reset por mudança de rota no `Layout`, uma linha para todas as telas.
- [ ] **Enviar o sitemap no Google Search Console.** `https://aqua360.vercel.app/sitemap.xml` está no
      ar e declarado no `robots.txt`, mas sem submeter a indexação das 925 URLs demora muito mais.
      Depende de acesso do Daniel, não tem como o agente fazer.
- [ ] **`og:image` do iNaturalist pode dar 403.** 204 das 704 fichas caem em foto do iNaturalist como
      imagem de compartilhamento (37 têm arte própria, 370 usam Wikipedia, 93 caem no card padrão).
      Vi um 403 deles no console durante o teste. Quando falha, o card sai sem imagem em vez de cair
      no `og-image.png`. Mantido porque foto real rende mais clique, mas é uma linha em
      `speciesImage` (`src/seo/meta.ts`) se a preferência mudar.
- [ ] **Domínio próprio muda uma linha.** O canonical, as `og:url` e o sitemap saem de `SITE_URL` em
      `src/seo/site.ts`, hoje `https://aqua360.vercel.app`. Trocar lá resolve tudo de uma vez, mas o
      `robots.txt` tem a URL do sitemap escrita à mão e precisa acompanhar.
- [ ] **28 títulos acima de 60 caracteres**, todos nome de espécie genuinamente longo (ex.: "Ramirezi
      Electric Blue (Mikrogeophagus ramirezi var. electric blue)"). O sufixo da marca já é descartado
      sozinho quando não cabe; o resto é encurtar nome popular no dado, se valer a pena.

## Notas de operacao
- **Publicacao e automatica, com atraso de minutos.** Os commits vão para `origin/main` sem que o
  agente rode `git push` (o reflog de `origin/main` registra dezenas de `update by push`). O disparo
  não é instantâneo: na pausa anterior `main` apareceu `ahead 2` e esses commits já estavam publicados
  na sessão seguinte. Antes de afirmar que algo está no ar, rode
  `git fetch origin && git status -sb` em vez de assumir, nos dois sentidos.
- **O script de imagens roda em node, nao em bun.** O alocador do bun quebra com as chamadas nativas
  do sharp e derruba o lote com SIGTRAP. O `package.json` já aponta para `node`.
- **Arte nova chega pelo chat.** O arquivo em resolução cheia fica em
  `~/.claude/image-cache/<sessao>/<n>.png`; basta copiar para `source-images/` com o nome do slug que
  o campo `imagem` do registro exige.
- **Arte em lote chega por pasta, e o original não fica no repositório.** Em 2026-08-01 vieram 86
  arquivos de uma vez. O fluxo que funcionou: copiar para `source-images/` já com o nome do slug,
  rodar `node scripts/normalize-images.ts <slugs>` e mover o original para
  `aquarismo/ilustracoes/publicadas/<slug>.png`, fora do repositório. São cerca de 3 MB por PNG e o
  git não tem por que carregar isso. `source-images` e `novos-peixes` estão no `.gitignore`.
- **Nada que precise sobreviver ao build pode ficar dentro do bloco `<!--seo-->` do `index.html`.** O
  `generate-seo.ts` reescreve esse bloco inteiro em cada página gerada, e o
  `releasePrerenderedHead()` ainda apaga o que sobra do DOM quando o React assume o head. A tag do
  AdSense ficou lá e chegava a **zero das 952 páginas**, sem nenhum erro aparecer em lugar nenhum.
  Confira no `dist` com `grep -rl <marca> dist --include=index.html | wc -l` antes de dar por feito.
- **Proibir print não existe na web, e a pergunta vai voltar.** Perguntado em 2026-08-01. O
  comportamento de app de banco depende de API nativa do sistema (`FLAG_SECURE` no Android, detecção
  de captura no iOS) e **nenhuma é exposta para página web**, nem para PWA instalado, porque o app
  segue dentro do navegador. Bloquear a tecla Print Screen só pega parte do desktop e não toca no
  botão físico do celular; limpar a área de transferência não vale para print de celular; DRM
  (Widevine) protege superfície de vídeo, não a página. A proteção real do projeto já está no ar e é
  a marca d'água ladrilhada nas ilustrações. Vale lembrar que qualquer trava de cópia briga com a
  frente de SEO, que depende de o Google carregar e indexar a imagem.
- **O viewport do app proíbe pinch zoom.** O `index.html` fixa
  `maximum-scale=1.0, user-scalable=no`, então o zoom do sistema não funciona em tela nenhuma. Foi por
  isso que o visualizador de imagem precisou de zoom próprio. Se um dia essa linha sair (ela é um
  problema de acessibilidade), o zoom do `ImageLightbox` pode ser reavaliado.
- **Script que regrava bloco de dado precisa fundir, não substituir.** O `enrich-data.ts` reescreve
  `enrichment` inteiro e apagou 372 `wikiPhotoUrl` que outros scripts tinham gravado. O sintoma não
  aparece no validador nem no build: some a foto de fallback de centenas de fichas. Depois de rodar
  qualquer script de enriquecimento, compare o diff **por campo**, não só a contagem de linhas.
- **Testando o `dist` no navegador, desregistre o service worker antes.** O app é PWA com
  `registerType: 'autoUpdate'`, e o SW precacha o shell e os assets. Numa sessão de teste ele serviu o
  bundle da build anterior e produziu um sintoma convincente que já estava corrigido no código. Limpe
  com `navigator.serviceWorker.getRegistrations()` mais `caches.keys()` antes de concluir qualquer
  coisa. Vale também saber que, com o SW ativo, toda navegação recebe o `index.html` precacheado e não
  o HTML por rota; isso não afeta rastreador, que não roda service worker.
- **Mas nem todo sintoma de "conteúdo velho" é o service worker.** Em 2026-07-31 um relato de foto
  desatualizada tinha cara de cache e era bug de estado no `FallbackImage` (commit `7f8a1ae`).
  Reproduzir o caminho exato no navegador custou pouco e mostrou a causa real; começar pelo SW teria
  custado uma sessão. Reproduza primeiro, culpe o cache depois.

## Historico
> O historico do projeto e o **journal global** append-only em `dxspec/journal.md` (nunca podado).
> O board e snapshot: nao acumule historico aqui. Cada handoff acrescenta uma entrada la.
- Ver `dxspec/journal.md` (ledger cronologico do projeto).
