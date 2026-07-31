---
name: STATE
description: Memoria de trabalho LOCAL da frente de equalizacao de textos. Volatil.
alwaysApply: false
---

# STATE local - Equalização de textos

> Memoria de trabalho **desta frente** (snapshot mutável: estado AGORA). O board (`dxspec/STATE.md`)
> aponta pra cá. Volátil. Contrato: `./spec.md`. Plano: `./tasks.md`.
> Histórico imutável (como chegou até aqui): `./journal/` (append-only, uma entrada por handoff).

**Última atualização:** 2026-07-31 por Daniel Vieira (ficha de peixe homogênea)
**Status:** ativa

## Onde estamos
Nove tasks fechadas (1 a 7, 13 e 15) mais a task 11 entregue esperando revisão; 8 e 9 parciais.
**Água doce está com 100% dos parâmetros preenchidos** e 20 fichas já têm o texto na voz nova.
O que sobra é o texto das outras 71 fichas de água doce e o acervo marinho inteiro.

**A ficha de peixe agora é homogênea** (commit `b5703c4`): as 704 espécies saem com as mesmas seções,
na mesma ordem, e onde falta dado a linha fica dizendo "Não informado" em vez de sumir. O dado não
mudou, então o placar abaixo é o mesmo de antes da mudança. O que mudou é que a lacuna virou visível
na tela, e não só no relatório do validador.

| Regra | AC | Abertura | Agora |
|-------|-----|---------:|------:|
| `chaves` | AC-2 | 5272 | 273 |
| `formato` | AC-3 | 2084 | **0** |
| `faixas` | AC-4 | 23 | **0** |
| `tipografia` | AC-5 | 434 | 114 |
| `taxonomia` | AC-6 | 75 | **0** |
| `completude` | AC-7 | 2208 | 1624 |
| `voz` | AC-8 | 0 | 0 |
| `acentuacao` | AC-9 | 190 | **0** |
| `paridade` | AC-10 | 250 | **0** |
| **Total** | | **10536** | **2011** |

Ficha mínima: 176 de 704 (25%), e **em água doce 176 de 244 (72%)**, contra 151 na abertura desta
leva. Os 273 de `chaves` e os 114 de `tipografia` que restam estão todos nas traduções en/es/ja e só
a cascata (tasks 16 e 17) resolve, o que não vale fazer antes de o português fechar.

Água doce, por coluna: origem, pH, GH, KH, temperatura, tamanho adulto e posição no aquário estão em
**zero vazios**. Falta só texto: 71 fichas, 222 células (`caracteristica` 67, `reproducao` 55,
`diformismoSexual` 50, `alimentacao` 40, `comportamento` 10).

Três lacunas que a ficha homogênea expôs e que nenhuma regra do validador via, porque a página
escondia: `enrichment.taxonomia` ausente em **84 das 704**; posto `classe` vazio em **536 das 620**
que têm o bloco (o GBIF já devolve esse campo, é enriquecimento e não pesquisa); `outrosNome` vazio
em **333** e `fonte` em **489**.

## Em andamento / próximo passo
- **Bloqueio primeiro:** o lote 01 precisa da sua revisão antes de escalar. Ver "Bloqueios".
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
