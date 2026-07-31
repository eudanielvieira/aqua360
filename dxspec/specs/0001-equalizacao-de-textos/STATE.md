---
name: STATE
description: Memoria local da frente de equalizacao de textos. Onde paramos e por que.
alwaysApply: false
---

# STATE - Equalização de textos

**Última atualização:** 2026-07-31 por Daniel Vieira (abertura da frente)

## Onde estamos
Spec escrita e em review. Nada implementado ainda. O diagnóstico que abriu a frente está na própria
`spec.md`, na tabela de contexto medido, e não precisa ser refeito.

## Próximo passo
Task 1: escrever `scripts/validate-data.ts`. Ele é pré-requisito de tudo, porque é o placar que diz
quanto falta e o gate que impede regressão. Só depois dele a task 2 (rechaveamento) destrava a
cascata para os outros idiomas.

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
