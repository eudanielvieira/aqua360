---
name: adr-0001
description: Decisao sobre o formato canonico dos campos de parametro das fichas.
alwaysApply: false
---

# ADR 0001 - Formato canônico dos parâmetros

**Data:** 2026-07-31
**Status:** aceito
**Frente:** `dxspec/specs/0001-equalizacao-de-textos/`

## Contexto
Os campos `ph`, `gh`, `kh`, `temperatura` e `tamanhoAdulto` não estão na lista de campos traduzíveis
de `generate-pt-data.ts`, então o valor gravado em `src/data/*.ts` é servido igual nos quatro
idiomas. Hoje o valor dominante é `24 a 27 ºC`: o leitor inglês, espanhol e japonês lê a preposição
portuguesa no meio do parâmetro.

Junto disso convivem formatos desencontrados vindos do dump antigo: 65 registros gravam `26 a 28oC`
com o "o" minúsculo no lugar do sinal de grau, `tamanhoAdulto` aparece em sete formatos diferentes, e
alguns valores são resíduo puro (`ph` gravado como a string `"a"`).

## Decisão
O formato canônico troca a palavra "a" pelo hífen comum (U+002D) e fixa a unidade:

| Campo | Canônico | Exemplo |
|-------|----------|---------|
| `ph`, `gh`, `kh` | `N-N` ou `N`, ponto como separador decimal | `6.5-7.5`, `7.0` |
| `temperatura` | `N-N °C`, sinal de grau U+00B0 | `24-27 °C` |
| `tamanhoAdulto` | `N cm` ou `N-N cm` | `13 cm`, `10-13 cm` |

O separador é hífen, nunca travessão nem meia-risca, que são proibidos em todo texto do projeto.

## Alternativas consideradas
1. **Manter `N a N` e traduzir a preposição por idioma.** Exigiria mover cinco campos numéricos para a
   camada de tradução, quadruplicando o volume traduzido e criando risco de a IA alterar o número.
   Descartada.
2. **Trocar o schema para campos numéricos** (`phMin`, `phMax`, `tempMin`, `tempMax`) e formatar por
   locale na renderização. É o destino certo do dado: permite filtro por faixa, comparação e unidade
   imperial. Descartada **por ora**, não por estar errada: acopla a equalização de texto a uma
   refatoração de tipo, páginas e build. Fica registrada como evolução natural depois desta frente.

## Consequências
- Toca os quatro arquivos de `src/data/` de uma vez, e o efeito aparece nos quatro idiomas junto.
- É difícil de reverter depois que as fichas forem reescritas por cima, por isso entra cedo (task 4,
  antes de qualquer onda de preenchimento ou reescrita).
- O validador passa a rejeitar qualquer valor fora do formato, o que impede o dump antigo de voltar
  por importação nova.
- A migração para campos numéricos, quando vier, fica mais barata: um formato só para fazer o parse,
  em vez de sete.
