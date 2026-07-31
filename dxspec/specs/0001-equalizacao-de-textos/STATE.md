---
name: STATE
description: Memoria de trabalho LOCAL da frente de equalizacao de textos. Volatil.
alwaysApply: false
---

# STATE local - Equalização de textos

> Memoria de trabalho **desta frente** (snapshot mutável: estado AGORA). O board (`dxspec/STATE.md`)
> aponta pra cá. Volátil. Contrato: `./spec.md`. Plano: `./tasks.md`.
> Histórico imutável (como chegou até aqui): `./journal/` (append-only, uma entrada por handoff).

**Última atualização:** 2026-07-31 por Daniel Vieira
**Status:** ativa

## Onde estamos
Nove das vinte tasks fechadas (1 a 7, 13 e 15), todas as mecânicas. O que sobra é pesquisa por
espécie, reescrita de voz e a cascata para os outros idiomas.

| Regra | AC | Abertura | Agora |
|-------|-----|---------:|------:|
| `chaves` | AC-2 | 5272 | 273 |
| `formato` | AC-3 | 2084 | **0** |
| `faixas` | AC-4 | 23 | **0** |
| `tipografia` | AC-5 | 434 | 114 |
| `taxonomia` | AC-6 | 75 | **0** |
| `completude` | AC-7 | 2208 | 2211 |
| `voz` | AC-8 | 0 | 0 |
| `acentuacao` | AC-9 | 190 | **0** |
| `paridade` | AC-10 | 250 | **0** |
| **Total** | | **10536** | **2598** |

Ficha mínima: 151 de 704 (21%). Os 273 de `chaves` e os 114 de `tipografia` que restam estão todos
nas traduções en/es/ja e só a cascata (tasks 16 e 17) resolve, o que não vale fazer antes de o
português fechar. `completude` subiu três pontos: normalizar revelou campo vazio que antes estava
mascarado por resíduo, então é progresso disfarçado de regressão.

## Em andamento / próximo passo
- **Task 8:** `posicaoAquario` nas 460 fichas em que a coluna está 100% vazia (346 marinhas, 76
  invertebrados de água doce, 38 invertebrados marinhos). Derivar da família e do que `comportamento`
  já descreve; onde não bastar, pesquisa com `fonte`. Gate:
  `bun run validate-data --rule=completude` sem `vazio:posicaoAquario`.

## Decisões recentes
- 2026-07-31: voz de aquarista experiente na reescrita, calibrada pelo exemplo da spec.
- 2026-07-31: dado faltante vem de pesquisa com fonte citada, nunca de memória. Já aplicado na task 5,
  onde dois valores com dígito perdido viraram campo vazio em vez de palpite.
- 2026-07-31: formato canônico troca o "a" por hífen (`24-27 °C`). Difícil de reverter, virou
  [ADR 0001](./adr-0001-formato-canonico-de-parametros.md).
- 2026-07-31: `gh` em marinho guardava densidade e foi limpo (parâmetro do sistema, não da espécie).
- 2026-07-31: a proibição de aspas curvas do AC-5 caiu, por contrariar o corpus e a norma do português.
- 2026-07-31: texto de interface escrito direto no `.tsx` entrou na frente como AC-12 (task 19).

## Bloqueios
- [ ] **Task 11 precisa de revisão sua.** O lote piloto de 20 fichas na voz nova tem que passar por
      você antes de escalar a reescrita para 615 páginas de texto. Ninguém destrava isso sozinho.
- [ ] **Japonês sem revisor.** Todo lote de ja fecha como dívida aberta, não como pronto. Desde a
      abertura da frente.

## Ideias adiadas / todos da frente
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
