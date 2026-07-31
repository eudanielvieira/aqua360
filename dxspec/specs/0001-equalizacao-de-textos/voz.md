---
name: voz
description: Guia de voz dos campos narrativos da ficha. Puxe antes de escrever ou revisar lote de texto.
alwaysApply: false
---

# Guia de voz dos campos narrativos

> Contrato: [AC-8 da spec](./spec.md). Gate: `bun run validate-data --rule=voz --lote=<n>`.
> Este guia diz o que escrever; o validador só checa o que dá para medir.

## Quem está falando

Um aquarista experiente conversando com quem vai cuidar do peixe. Alguém que já criou a espécie,
já errou com ela e sabe o que costuma dar problema. Não é um laudo técnico nem um verbete de
enciclopédia.

O texto antigo do acervo veio de um dump em registro de laudo. A diferença aparece na primeira frase:

- **Antes:** "São calmos e pacíficos, demonstrando somente uma certa agressividade para com os da
  mesma espécie, quando estão em período de reprodução."
- **Depois:** "É um peixe tranquilo. A briga só aparece entre machos da mesma espécie na época de
  desova, quando um deles já formou o ninho e passa a defender o território. Com outras espécies
  convive bem."

O que mudou: sujeito claro, frase curta, e a informação chega na ordem em que a pessoa precisa dela.

## Regras que o validador cobra

- Nada da lista negra: `Deve-se`, `É recomendável que se`, `O mesmo`, `Os mesmos`, `A mesma`,
  `Faz-se necessário`, `Sendo assim`, `Vale ressaltar`, `Cabe salientar`.
- Média de 22 palavras por frase no lote, no máximo.
- Nenhuma frase acima de 45 palavras.
- Campo narrativo com mais de 40 caracteres termina em pontuação.
- Sem travessão nem meia-risca. Sem espaço duplo, sem tag HTML, sem grau escrito como `º` ou `oC`.

## Regras que o validador não cobra

- **Português acentuado e correto.** Vale para nome de espécie e de rio também.
- **Nada de escrever de memória.** Fato novo vem de fonte consultada, e a `fonte` da ficha registra
  qual. Na dúvida entre dois valores, escreva a lacuna em vez do palpite.
- **Sem a fórmula "X, não Y".** É marca de texto gerado por máquina e aparece rápido demais quando
  se escreve em série.
- **Sem lista de três forçada.** Se são dois itens, são dois.
- **Não repita o que a tabela de parâmetros já mostra.** A ficha exibe pH, dureza, temperatura e
  tamanho ao lado do texto. Repetir o número na prosa gasta a atenção do leitor e cria duas versões
  do mesmo dado para manter em sincronia.

## O que cada campo responde

| Campo | A pergunta que ele responde |
|-------|------------------------------|
| `caracteristica` | Como reconheço este peixe e o que ele tem de particular no corpo |
| `comportamento` | Como ele se dá com os outros, e com quantos da própria espécie ele precisa viver |
| `alimentacao` | O que ele come de fato, e o que costuma dar errado na hora de alimentar |
| `reproducao` | Como ele desova e o que muda no aquário quando o casal se forma |
| `diformismoSexual` | Como separo macho de fêmea olhando |
| `outrasInformacoes` | O que sobra e importa: litragem mínima, cuidado incomum, aviso de porte |

Extensão: duas a cinco frases por campo. Ficha curta e certa vale mais que ficha longa e vaga.

## Casos de borda

- **Espécie monomórfica:** o valor certo de `diformismoSexual` é a frase explícita ("Machos e fêmeas
  são iguais por fora."), nunca o campo vazio. Se dá para separar por comportamento e não por
  aparência, diga isso.
- **Sem relato de reprodução em aquário:** escreva a lacuna ("Não há relato consistente de
  reprodução em aquário."), com a `fonte` apontando a consulta feita.
- **Peixe que fica grande demais para aquário doméstico:** o aviso entra em `outrasInformacoes` e
  precisa ser direto. Quem lê a ficha do Pirarucu tem que sair sabendo que ele passa de dois metros.
- **Nome de comércio que esconde a espécie:** quando a ficha é uma variedade selecionada
  (`Danio rerio var. gold`), o texto fala da variedade e assume que os parâmetros são os da espécie.

## Como escrever a partir da fonte

A coleta (`bun run harvest-params --narrativos`) guarda em cache os trechos das seções de dieta,
comportamento, dimorfismo e reprodução da fonte, em inglês. Esse material é **consulta, não
tradução**: dele saem os fatos, e o texto da ficha é escrito do zero em português. Traduzir o
parágrafo da fonte copiaria o texto de outra pessoa e ainda por cima traria o registro de laudo de
volta.
