---
name: STATE
description: Memoria local da frente de equalizacao de textos. Onde paramos e por que.
alwaysApply: false
---

# STATE - Equalização de textos

**Última atualização:** 2026-07-31 por Daniel Vieira (task 1 fechada)

## Onde estamos
Spec aprovada, ADR 0001 aceito e task 1 fechada: `scripts/validate-data.ts` roda as nove regras,
imprime o placar e serve de gate. Baseline de campos vazios gravada em `scripts/.validate-baseline.json`
(678 fichas com lacuna, 3979 células), que é o marco zero da regra de procedência.

Placar de abertura, com `bun run validate-data`:

| Regra | AC | Bloqueantes | Avisos |
|-------|-----|------------|--------|
| `chaves` | AC-2 | 5272 | 0 |
| `formato` | AC-3 | 2084 | 0 |
| `faixas` | AC-4 | 23 | 0 |
| `tipografia` | AC-5 | 434 | 0 |
| `taxonomia` | AC-6 | 75 | 61 |
| `completude` | AC-7 | 2208 | 17 |
| `voz` | AC-8 | 0 | 0 |
| `acentuacao` | AC-9 | 190 | 1 |
| `paridade` | AC-10 | 250 | 0 |

Total: 10536 bloqueantes. Ficha mínima em 154 de 705 (22%).

Task 2 fechada também: a chave das traduções passou a levar o slug (`agua-doce:177`), `chaves` caiu de
5272 para 276 bloqueantes, e os 276 que restam são as 92 fichas que nunca tiveram tradução própria,
que só a cascata (task 17) resolve. Conferido no app: em inglês o Kinguio caía como "Damselfish" e
agora cai no português correto, enquanto a ficha marinha do mesmo id segue traduzida.

Duas coisas que só apareceram ao rodar o app, e não no dado:
1. O `:` é o separador de namespace do i18next, então a busca precisou de `nsSeparator: false`. Sem
   isso a chave nova não resolvia nada e tudo caía no português, o que passaria por "funcionando".
2. Existem cerca de 75 textos em português escritos direto no `.tsx`/`.ts`, fora do i18n, que nenhum
   idioma traduz. Em inglês a ficha mostra "Reino / Filo / Classe" e as tarjas "Agua Doce" e
   "Carnivoro", sem acento. Virou a task 19, proposta, dependendo de uma emenda na spec.

## Próximo passo
Duas decisões antes de seguir:
- **`gh` em água salgada** (SPEC_DEVIATION em `tasks.md`): mover para `densidade` ou limpar. Trava a
  task 4.
- **Emenda da spec** para absorver os textos embutidos no código como AC-12. Se entrar, a task 19
  passa a valer e o validador ganha a regra `embutido`.

Com o `gh` decidido, a fila é task 3 (fusão da duplicata), depois 4 e 5 (formato e faixas), que são
mecânicas e fecham dois ACs de uma vez.

## Decisões vivas
- **Voz de aquarista experiente**, calibrada pelo exemplo na spec. Escolhida sabendo que dá mais
  trabalho de reescrita do que só limpar o texto atual.
- **Dado faltante vem de pesquisa com fonte citada.** É a opção mais lenta das três consideradas,
  escolhida porque um site de referência não pode publicar parâmetro de pH escrito de memória.
- **Formato canônico troca o "a" por hífen** (`24-27 °C` no lugar de `24 a 27 ºC`). O motivo é que
  esses campos não passam pela camada de tradução, então o leitor inglês lê a palavra portuguesa
  hoje. Precisa virar ADR antes da task 4: toca os quatro arquivos e os quatro idiomas de uma vez.
- **Português é a nascente.** `data-*.json` de en/es/ja nunca é editado à mão. Os namespaces de UI
  são a exceção, porque são escritos por idioma.

## Riscos e pontos de atenção
- A task 2 muda o formato das chaves dos quatro `data-*.json`. Se rodar depois de as tasks 9 a 12
  terem escrito muito texto, o retrabalho de cascata é grande. Por isso ela vem cedo.
- O japonês não tem revisor no time. Todo lote de ja fecha como dívida aberta no `journal/`, não como
  pronto.
- A frente de monetização toca os mesmos arquivos de UI que a task 13. Vale coordenar a ordem para
  não gerar conflito bobo em `support.json`.

## Ligações com o board
- Absorve do board os todos soltos: família errada no Betta, duplicata `Polypterus senegalus`,
  colisão de ids nas traduções, números do acervo escritos à mão, limpeza de travessão no
  `fish-agua-doce.ts`, fichas quase vazias (Barbo Rosa, Bagre de Vidro, Bagre Andador, Aruanã Prata),
  e a replicação dos números da página Sobre em en/es/ja.
- Não absorve: normalização de imagens e a frente de monetização.
