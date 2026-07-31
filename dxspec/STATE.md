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

**Ultima atualizacao:** 2026-07-31 por Daniel Vieira (ficha de peixe homogenea, animacao do arrasto)

## Foco atual
- **Equalização de textos (spec 0001).** A maior frente do projeto e a que está ativa. Depois da leva
  mecânica veio a de conteúdo, e **água doce está com 100% dos parâmetros preenchidos**: origem, pH,
  GH, KH, temperatura, tamanho adulto e posição no aquário, zero vazios nas 244 fichas. Vinte fichas
  já têm o texto na voz de aquarista, como lote piloto. Placar de 10536 para 2011 bloqueantes; ficha
  mínima em água doce de 62% para 72%. A ficha de peixe também ficou **homogênea**: as 704 espécies
  saem com as mesmas seções e a lacuna aparece como "Não informado" em vez de sumir da tela.
  **A frente está travada na sua revisão do lote piloto**, que segura as outras 71 fichas de texto e a
  cascata para en/es/ja. Ver `dxspec/specs/0001-equalizacao-de-textos/STATE.md`.
- **Monetização.** O site vai passar a ter propaganda e links de afiliado, e o texto do projeto foi
  escrito prometendo o oposto. A página Sobre já está limpa nos quatro idiomas, mas `/apoie` continua
  vendendo "Sem anúncios" como benefício de quem apoia, e não existe em lugar nenhum o aviso de
  divulgação de afiliado.
- **SEO.** Estrutural entregue: o site servia o mesmo título e a mesma descrição nas 926 URLs, e
  agora o build grava o head de cada rota no HTML publicado, com robots.txt fechando robô de treino
  de IA e sitemap de 925 URLs. Pausada com um passo seguinte claro e grande: URL por idioma. Detalhe
  no journal global.
- **Gesto no mobile.** Frente pequena, entregue: na ficha de peixe, arrastar o dedo para o lado troca
  de espécie, agora com a passagem de card (a ficha sai pela borda, a seguinte entra pela oposta).
  Pausada com duas decisões abertas, ambas de produto: estender às outras fichas e resolver a
  descoberta do gesto. Detalhe no journal global.
- Em paralelo, a normalização das ilustrações segue por demanda: chega arte nova pelo chat, entra pela
  esteira.

## Frentes
> Uma linha por frente. Status: ativa | on-deck | concluida | pausada.

| Frente | Status | STATE local | Proximo passo (resumo) |
|--------|--------|-------------|------------------------|
| Equalização de textos (0001) | ativa | `dxspec/specs/0001-equalizacao-de-textos/STATE.md` | Água doce com parâmetros em 100%, lote piloto de texto entregue (placar 10536 para 2011) e ficha de peixe homogênea (`b5703c4`). Próxima: **sua revisão do lote 01**, e só então os lotes 02 em diante. Decisão rápida pendente: GH e KH nas 346 marinhas, que hoje saem como "Não informado" sendo que marinho não tem esses parâmetros por espécie |
| Monetização (propaganda + afiliados) | ativa | - | Tirar a promessa de "Sem anúncios" de `/apoie` (pt e es) e decidir onde entra o aviso de afiliado |
| SEO (sem spec própria) | pausada | - | Base entregue (commit `8c28378`): head por rota gerado no build, robots.txt, sitemap de 925 URLs. Próximo: URL por idioma (`/en/`, `/es/`, `/ja/` + hreflang), que é o que destrava os outros três idiomas. Vira spec se for encarado |
| Gesto no mobile (sem spec própria) | pausada | - | Entregue na ficha de peixe (commits `22305f2`, `bef4c39`): arrastar para o lado troca de espécie, na ordem da listagem, com passagem de card no lugar da troca seca. Próximo: decidir se vale em plantas, corais e doenças (`SwipeNav` já é reutilizável) e se entra barra de anterior/próxima no rodapé, que resolve a descoberta do gesto |
| Normalização de imagens (sem spec própria) | pausada | - | Processar o próximo lote de arte que chegar |
| Colisão de ids nas traduções | concluida | `dxspec/specs/0001-equalizacao-de-textos/` | Resolvida como task 2 da spec 0001, commit `7789e9a`. Eram 92 ids, não 74: a contagem antiga só olhava doce contra salgada |

> Frentes sem pasta propria (ex.: IMP-*) vivem como linha aqui ate virarem feature/spec.

## Bloqueios (cross-frente)
- **Lote piloto de texto esperando sua revisão** (`scripts/textos-pt/lote-01.json`, guia em
  `dxspec/specs/0001-equalizacao-de-textos/voz.md`). Enquanto não passar, a reescrita não escala.
- **Quatro pares de ficha duplicada em água doce** esperando sua decisão de fundir ou manter (177/25,
  178/176, 205/50, 163/237). Fundir apaga rota e mexe no sitemap e nas quatro traduções.
- Alerta de conformidade: enquanto os links de afiliado subirem sem aviso de divulgação, o site fica
  exposto nas regras de programas como o Amazon Associates, que exigem aviso visível. Isso é decisão
  de produto, não trava código.

## Todos soltos (nao pertencem a uma frente ainda)
> Sete todos que estavam aqui viraram task da spec 0001 e saíram desta lista: família errada no Betta,
> duplicata `Polypterus senegalus`, colisão de ids nas traduções, números do acervo escritos à mão,
> limpeza de travessão no `fish-agua-doce.ts`, fichas quase vazias e a replicação dos números da
> página Sobre em en/es/ja. O nome popular repetido entre os ids 16 e 112 também: virou caso de borda
> da spec, com o validador avisando sem bloquear.

- [ ] **`/apoie` promete "Sem anúncios".** `support.json` em pt e es tem `benefit.adFree` ("Sem
      anúncios" / "Com seu apoio o Aqua360 continua 100% gratuito e sem propagandas"). Com propaganda
      no ar isso é falso na página onde a pessoa decide doar. O benefício precisa virar outro (por
      exemplo, apoiar mantém o catálogo crescendo). A `description` em pt já saiu em 2026-07-31, de
      carona na limpeza de `--` da spec 0001 (commit `b5903b7`); em es, en e ja ela continua lá.
- [ ] **Aviso de divulgação de afiliado.** Não existe em nenhuma página. Com os cards de princípio
      removidos, a Sobre agora não fala nada sobre monetização. Decidir o lugar: card novo na Sobre,
      linha no rodapé ou página própria.
- [ ] Normalizar o resto do acervo. 37 das 731 imagens em `public/images` estão tratadas; o restante
      ainda é o arquivo antigo de 180x135. O caminho é jogar os originais em `source-images/` e rodar
      `bun run normalize-images <nome>`, que já atualiza o manifesto sozinho. Na família Polypteridae
      faltam o Bichir Tigre (130) e o Peixe-Corda (58); o id 251 não tem imagem nenhuma.
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
