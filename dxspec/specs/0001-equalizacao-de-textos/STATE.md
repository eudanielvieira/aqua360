---
name: STATE
description: Memoria de trabalho LOCAL da frente de equalizacao de textos. Volatil.
alwaysApply: false
---

# STATE local - Equalização de textos

> Memoria de trabalho **desta frente** (snapshot mutável: estado AGORA). O board (`dxspec/STATE.md`)
> aponta pra cá. Volátil. Contrato: `./spec.md`. Plano: `./tasks.md`.
> Histórico imutável (como chegou até aqui): `./journal/` (append-only, uma entrada por handoff).

**Última atualização:** 2026-08-01 por Daniel Vieira (leva de arte, 27 fichas novas, lote 02 de voz)
**Status:** ativa

## Onde estamos
Nove tasks fechadas (1 a 7, 13 e 15) mais a task 11 entregue esperando revisão; 8 e 9 parciais.
**Água doce está com 100% dos parâmetros preenchidos** e 44 fichas já têm o texto na voz nova (lotes
01 e 02). O que sobra é o texto das outras 71 fichas antigas de água doce e o acervo marinho inteiro.

**A ficha de peixe é homogênea** desde `b5703c4`: as espécies saem com as mesmas seções, na mesma
ordem, e onde falta dado a linha fica dizendo "Não informado" em vez de sumir.

**Uma leva de arte entrou em 2026-08-01 e mexeu no tamanho do acervo** (commits `e28e2ea`,
`42fabc5`): 75 espécies ganharam ilustração própria (manifesto de 38 para 113 slugs) e **27 fichas
novas** foram criadas porque a arte chegou sem ter onde morar. Água doce foi de 244 para 268 fichas e
plantas de 148 para 151. As 24 fichas novas de peixe entraram completas, com parâmetro colhido em
fonte e texto no lote 02.

| Regra | AC | Abertura | Antes da leva | Agora |
|-------|-----|---------:|--------------:|------:|
| `chaves` | AC-2 | 5272 | 273 | 345 |
| `formato` | AC-3 | 2084 | **0** | **0** |
| `faixas` | AC-4 | 23 | **0** | **0** |
| `tipografia` | AC-5 | 434 | 114 | 109 |
| `taxonomia` | AC-6 | 75 | **0** | **0** |
| `completude` | AC-7 | 2208 | 1624 | 1624 |
| `voz` | AC-8 | 0 | 0 | **0** |
| `acentuacao` | AC-9 | 190 | **0** | **0** |
| `paridade` | AC-10 | 250 | **0** | **0** |
| **Total** | | **10536** | **2011** | **2078** |

**O total subiu, e é esperado.** São as 24 fichas novas vezes os três idiomas que ainda não têm
cascata: 72 violações de `chaves`, a mesma dívida das outras 91 fichas. `tipografia` caiu de 114 para
109 de carona na limpeza dos textos do `/apoie`. O que importa é o placar de conteúdo, que subiu:
ficha mínima em **água doce de 176/244 (72%) para 200/268 (75%)**, e no total de 176/704 (25%) para
200/728 (27%).

Água doce, por coluna: origem, pH, GH, KH, temperatura, tamanho adulto e posição no aquário estão em
**zero vazios**, incluindo as 24 fichas novas. Falta só texto: 71 fichas, 222 células
(`caracteristica` 67, `reproducao` 55, `diformismoSexual` 50, `alimentacao` 40, `comportamento` 10).

Três lacunas que a ficha homogênea expôs e que nenhuma regra do validador via, porque a página
escondia: `enrichment.taxonomia` ausente em **84 das 704**; posto `classe` vazio em **536 das 620**
que têm o bloco (o GBIF já devolve esse campo, é enriquecimento e não pesquisa); `outrosNome` vazio
em **333** e `fonte` em **489**.

## Em andamento / próximo passo
- **Bloqueio primeiro:** o lote 01 precisa da sua revisão antes de escalar, e agora o **lote 02**
  (24 fichas, 144 células, `scripts/textos-pt/lote-02.json`) entrou na mesma fila. Ver "Bloqueios".
- **Decisão sua, rápida:** GH e KH em água salgada. As 346 fichas marinhas agora exibem os dois como
  "Não informado", mas marinho não tem esses parâmetros por espécie: o `gh` foi limpo justamente por
  guardar densidade, que é do sistema, e o `kh` já é opcional lá. São 692 falsos sinais de trabalho.
  Escondê-los nas categorias marinhas, criar um segundo texto ("Não se aplica") ou deixar como está.
- **Depois:** lotes 02 em diante, 20 fichas por vez, com `bun run harvest-params --narrativos` já
  tendo colhido o material de 67 das 71 restantes. Gate por lote:
  `bun run validate-data --rule=voz --lote=NN`.
- **Task 8 no resto do acervo:** `posicaoAquario` segue 100% vazia em 346 marinhas e 114
  invertebrados. A ferramenta que fechou água doce serve nos outros arquivos com
  `--arquivo=agua-salgada`, mas a fonte de marinho é pior que a de doce e vai precisar de ajuste.

## Decisões recentes
- 2026-08-01: **variedade selecionada vira ficha própria, uma por arte** (seis guppies). Segue o que o
  acervo já fazia em `Poecilia sphenops var. black`, e o `voz.md` já tem a regra do caso.
- 2026-08-01: **gênero clássico `Corydoras` no `nomeCientifico`**, e não a revisão de 2024
  (`Hoplisoma`, `Osteogaster`, `Brochis`, `Gastrodermus`) que vinha nos nomes de arquivo. Trocar em 18
  fichas novas criaria duas convenções dentro do mesmo arquivo.
- 2026-08-01: **ilustração sem identificação confiável não entra.** Arte na espécie errada é pior que
  ficha sem arte, porque ensina o errado e ninguém audita depois.
- 2026-08-01: **o `enrich-data.ts` não roda no acervo até o bug de `wikiPhotoUrl` ser corrigido.**
- 2026-07-31: **o "Não informado" mora na apresentação, nunca no dado.** Campo vazio continua vazio no
  arquivo. Gravar o texto no dado zeraria o `completude` e transformaria 1624 lacunas reais em enfeite.
- 2026-07-31: **o `fallback` que segura a linha vazia é opt-in por componente.** Plantas, corais e
  doenças usam o mesmo `DetailRow` e seguem escondendo campo vazio, porque o pedido foi sobre peixe.
- 2026-07-31: **seção de mídia e de link externo continua condicional** (fotos da comunidade,
  distribuição, saiba mais). Não é campo da espécie, é widget que depende de fonte externa.
- 2026-07-31: **KH em água doce passa a ser derivado da dureza**, porque nenhuma base publica KH por
  espécie. A `fonte` cita a referência da dureza que originou o valor. Alternativa em aberto para
  você decidir: tornar `kh` opcional em doce, como já é no marinho.
- 2026-07-31: **`fonte` é lista de referência e nada mais.** Ela aparece na página com o rótulo
  "Fonte", e estava saindo com a anotação de derivação junto. A derivação agora vive no relatório do
  script.
- 2026-07-31: texto narrativo é escrito a partir do fato colhido, **nunca traduzido da fonte**.
- 2026-07-31: voz de aquarista experiente na reescrita, calibrada pelo exemplo da spec.
- 2026-07-31: dado faltante vem de pesquisa com fonte citada, nunca de memória. Já aplicado na task 5,
  onde dois valores com dígito perdido viraram campo vazio em vez de palpite.
- 2026-07-31: formato canônico troca o "a" por hífen (`24-27 °C`). Difícil de reverter, virou
  [ADR 0001](./adr-0001-formato-canonico-de-parametros.md).
- 2026-07-31: `gh` em marinho guardava densidade e foi limpo (parâmetro do sistema, não da espécie).
- 2026-07-31: a proibição de aspas curvas do AC-5 caiu, por contrariar o corpus e a norma do português.
- 2026-07-31: texto de interface escrito direto no `.tsx` entrou na frente como AC-12 (task 19).

## Bloqueios
- [ ] **O lote piloto está pronto e é a sua vez.** 20 fichas, 95 células, em
      `scripts/textos-pt/lote-01.json` (commit `da66739`), com o guia em `./voz.md`. Ler o JSON é mais
      rápido que abrir o arquivo de dados. Enquanto ele não for aprovado, as 71 fichas restantes de
      água doce ficam paradas, e a cascata para en/es/ja também.
- [ ] **O lote 02 entrou na mesma fila** (`scripts/textos-pt/lote-02.json`, commit `e28e2ea`): 24
      fichas, 144 células, das espécies novas que a leva de arte trouxe. Já está publicado, ao
      contrário do lote 01, porque sem texto as fichas novas nasceriam vazias. Se a sua revisão do
      lote 01 mudar a calibragem da voz, o 02 precisa da mesma passada.
- [ ] **`enrich-data.ts` destrói `wikiPhotoUrl` e não pode ser rodado.** Regrava o bloco `enrichment`
      inteiro sem preservar o que os scripts de foto gravaram antes. Em 2026-08-01 apagou 372 URLs
      (190 em água doce, 182 em salgada); restaurei as de doce e reverti o resto. É a imagem de
      fallback das centenas de fichas sem arte própria. Correção: fundir o bloco em vez de
      substituir.
- [ ] **Três duplicatas de água doce esperando sua decisão.** 177 contra 25, 178 contra 176, 205
      contra 50, mais 163 contra 237. O validador não as vê porque compara o nome científico como
      texto cru. Fundir apaga rota, mexe no sitemap e nas quatro traduções, então não fiz sozinho.
      Precedente: task 3.
- [ ] **Japonês sem revisor.** Todo lote de ja fecha como dívida aberta, não como pronto. Desde a
      abertura da frente.

## Contexto de fora da frente
- **O AC-7 (`completude`) agora paga em dois lugares.** A frente de SEO passou a derivar a description
  das páginas dos **mesmos campos** que esta spec conserta, e o gerador acusou 51 fichas com descrição
  curta demais: são exatamente as fichas magras do `completude`. Ou seja, fechar as tasks de conteúdo
  daqui melhora o snippet do Google de carona, sem nenhum trabalho extra de SEO. Ver a entrada de
  2026-07-31 sobre SEO em `dxspec/journal.md`.

## Ideias adiadas / todos da frente
- **Posto `classe` vazio em 536 fichas.** É o único dos sete postos que falta em massa, e o GBIF já
  devolve o campo: sai com uma passada do `enrich-data.ts`, sem pesquisa manual. Gatilho: agora que a
  árvore mostra os sete postos sempre, o buraco aparece em toda ficha. Barato e visível.
- **Campos numéricos** (`phMin`/`phMax`) com formatação por locale, no lugar de string. É o destino
  certo do dado de parâmetro. Gatilho para reconsiderar: quando alguém pedir filtro por faixa,
  comparação entre espécies ou unidade imperial. Registrado no ADR 0001 como alternativa descartada
  por ora.
- **Densidade de referência do marinho no guia.** Saiu de 334 fichas na task 4 e não foi para lugar
  nenhum. Gatilho: quando a página de guias ganhar a seção de marinho.
- **pH marinho do acervo inteiro é `8-9`** em 332 das 338 fichas com valor. É largo demais para reef,
  onde o padrão é 8.1 a 8.4. Não mexi porque trocar 332 registros exige pesquisa com fonte, não
  varredura. Gatilho: entra na task 10.
- **Origem truncada no id 9** ("América do Sul, sul da região"). A frase perdeu o fim no dump antigo e
  completar exige fonte. Gatilho: task 10.
