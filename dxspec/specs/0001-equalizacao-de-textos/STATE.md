---
name: STATE
description: Memoria local da frente de equalizacao de textos. Onde paramos e por que.
alwaysApply: false
---

# STATE - Equalização de textos

**Última atualização:** 2026-07-31 por Daniel Vieira (primeira leva de implementação)

## Onde estamos
Spec aprovada, ADR 0001 aceito, e as nove tasks mecânicas fechadas: 1 a 7, 13 e 15. O que sobra é
pesquisa por espécie, reescrita de voz e a cascata para os outros idiomas.

Placar, com `bun run validate-data`:

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

Ficha mínima: 151 de 704 (21%). Caiu de 154 porque a fusão da duplicata tirou uma ficha e porque
três registros perderam parâmetro que era resíduo (`ph` gravado como `"a"`), o que é progresso
disfarçado de regressão: antes o campo parecia preenchido e não estava.

Os 273 de `chaves` e os 114 de `tipografia` que restam são todos das traduções en/es/ja e só a
cascata (tasks 16 e 17) resolve. Não vale rodar a cascata antes do português fechar.

## O que mudou de decisão pelo caminho
Três coisas viraram SPEC_DEVIATION resolvida em `tasks.md`, todas por medição contradizer a spec:
1. `gh` em marinho guardava densidade, não dureza. Saiu do dado.
2. A proibição de aspas curvas estava errada: o acervo tem 478 delas contra 2 retas e em português
   são a forma correta. Regra removida.
3. Texto de interface escrito direto no `.tsx` não passa pelo i18n. Virou o AC-12 e a task 19.

## Achados que só apareceram abrindo o app
- **`/guias` estava em tela branca nos quatro idiomas.** `GuidesPage` pedia `t('cyclingSteps')` como
  array e essa chave nunca existiu. Bug anterior à frente, consertado no commit `d4686df`.
- **O `:` é o separador de namespace do i18next.** A chave nova (`agua-doce:177`) não resolvia nada e
  tudo caía no português, o que passaria por "funcionando" numa conferência superficial.
- Por causa dos dois, a regra `paridade` passou a ler os `t()` do código, e não só comparar os
  arquivos de idioma entre si.

## Próximo passo
Task 8: `posicaoAquario` nas 460 fichas em que a coluna está 100% vazia. É a maior lacuna única que
sobra e a mais derivável, porque a família e o texto de `comportamento` quase sempre dizem onde o
bicho vive.

Depois dela a fila é 9 e 10 (pesquisa por espécie, em lotes de 20) e 11 e 12 (voz). A task 11 pede
uma revisão sua no lote piloto antes de escalar a reescrita para o acervo inteiro.

## Riscos e pontos de atenção
- O japonês não tem revisor no time. Todo lote de ja fecha como dívida aberta.
- A task 13 encostou na frente de monetização: ao tirar o `--` de `support.description`, a promessa
  "tudo gratuito e sem anúncios" saiu junto. O `benefit.adFree` continua intacto e segue como todo de
  lá.
- `completude` subiu 3 pontos em vez de cair. É esperado nesta fase: normalizar revelou campo vazio
  que antes estava mascarado por resíduo.
