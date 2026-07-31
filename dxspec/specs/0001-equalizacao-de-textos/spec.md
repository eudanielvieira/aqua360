---
name: spec
description: Contrato da equalizacao e humanizacao dos textos do acervo. Base enquanto a frente esta ativa.
alwaysApply: true
---

# Spec - Equalização e humanização dos textos do acervo

> **Fonte da verdade.** Status: rascunho
> Os critérios de aceite são (a) o contrato com o negócio, (b) o oráculo de teste,
> (c) o prompt para o agente de IA implementar.

## Resumo
Todo texto do Aqua360 passa a seguir um padrão único de formato, completude e voz, com o português
como nascente e en/es/ja gerados a partir dele, e um validador executável que mede o progresso e
impede regressão.

## Contexto medido (2026-07-31)
Números levantados na abertura da frente, para não perder a régua entre sessões.

| Fato | Medida |
|------|--------|
| Fichas no acervo de peixes e invertebrados | 705 (245 doce, 346 salgada, 76 inv. doce, 38 inv. salgada) |
| Chaves em `pt-BR/data-fish.json` | 613, ou seja 92 fichas se sobrescrevem |
| Ids colidindo entre os quatro arquivos | 92 ids, 184 fichas envolvidas |
| Fichas completas na ficha mínima de 9 campos | 154 de 705 (22%) |
| Lacunas na ficha mínima | 1630 células |
| Fichas esqueleto (1 a 3 campos preenchidos) | 32, entre elas Kinguio, Disco, Platy, Coridora e Tucunaré |
| Colunas 100% vazias | água salgada: `kh`, `posicaoAquario`, `reproducao`, `diformismoSexual`; inv. doce: `gh`, `kh`, `posicaoAquario`, `caracteristica`; inv. salgada: `gh`, `posicaoAquario` |
| Campo `fonte` preenchido | 68 de 705 |
| Registros com temperatura no formato `26 a 28oC` | 65 |
| Faixas incoerentes | pH `85 a 9.0` (id 78), pH `8 a 0` (id 277), temperatura `24 a 2 ºC` (id 465), três `ph` gravados como `"a"` |
| `familia` divergindo da taxonomia GBIF | 75 fichas |
| Fichas com aspas curvas herdadas do dump | 185 |
| Travessões em `en/data-fish.json` | 141 |
| Strings de UI em pt-BR sem acentuação | 171 de 518 |
| Chaves que o código pede e o espanhol não tem | 124, em `support`, `guides`, `filters`, `builder` e `search` |

Consequência prática das duas últimas linhas: quem navega em espanhol lê português nessas telas hoje,
porque `fallbackLng` é `pt-BR`.

## Decisões tomadas
1. **Voz de aquarista experiente.** Os campos narrativos deixam o registro de laudo e passam a falar
   como quem já criou o animal, sem perder rigor. Referência de calibragem:
   - Antes: "São calmos e pacíficos, demonstrando somente uma certa agressividade para com os da mesma
     espécie, quando estão em período de reprodução."
   - Depois: "É um peixe tranquilo. A briga só aparece entre machos da mesma espécie na época de
     desova, quando um deles já formou o ninho e passa a defender o território. Com outras espécies
     convive bem."
2. **Dado faltante vem de pesquisa com fonte citada** (FishBase, Seriously Fish, GBIF), preenchendo o
   campo `fonte`. Nada de parâmetro escrito de memória sem procedência.
3. **Português é a nascente.** en/es/ja saem da cascata, nunca são editados à mão em `data-*.json`.
   As exceções são os namespaces de UI, que são escritos por idioma.
4. **Execução em lotes de 20 fichas**, cada ciclo fechando em `lote -> validador -> commit`.

## Formato canônico dos parâmetros
Hoje esses campos não passam pela camada de tradução: o leitor inglês lê `24 a 27 ºC`, com o "a"
português no meio. O formato canônico troca a palavra por hífen, que serve aos quatro idiomas.

| Campo | Canônico | Exemplo | Hoje |
|-------|----------|---------|------|
| `ph`, `gh`, `kh` | `N-N` ou `N` (ponto decimal) | `6.5-7.5`, `7.0` | `8.0 a 9.0` |
| `temperatura` | `N-N °C` (sinal de grau U+00B0) | `24-27 °C` | `24 a 27 ºC` e `26 a 28oC` |
| `tamanhoAdulto` | `N cm` ou `N-N cm` | `13 cm`, `10-13 cm` | 7 formatos, um deles com um parágrafo inteiro |
| `posicaoAquario` | vocabulário fechado | `Fundo`, `Meio`, `Topo`, `Todo o aquário`, `Vidros e superfícies` | 5 valores livres |

O hífen usado é o hífen comum (U+002D), nunca travessão ou meia-risca.

## Critérios de aceite

### AC-1: O validador é o placar e o gate
- **Dado** o acervo em `src/data/*.ts` e os arquivos em `public/locales/`
- **Quando** rodar `bun run validate-data`
- **Então** a saída lista, regra a regra, quantas violações existem e em quais registros, imprime o
  percentual de fichas que atendem à ficha mínima, e o processo sai com código 1 se houver qualquer
  violação bloqueante e 0 se não houver

### AC-2: Nenhuma ficha se perde na camada de tradução
- **Dado** que os quatro arquivos de peixes têm numeração própria e 92 ids colidem
- **Quando** rodar `bun run parse-data` e abrir `public/locales/*/data-fish.json`
- **Então** cada arquivo tem exatamente uma chave por ficha do acervo, no formato `<tipo>:<id>`
  (ex.: `agua-doce:194`), nenhuma sobrescreve outra, e abrir a ficha do Kinguio em EN, ES e JA mostra
  o conteúdo do Kinguio e não o de outra espécie

### AC-3: Parâmetros num formato único
- **Dado** os campos `ph`, `gh`, `kh`, `temperatura`, `tamanhoAdulto` e `posicaoAquario`
- **Quando** rodar `bun run validate-data`
- **Então** todo valor não vazio casa com o formato canônico da tabela acima, e o validador acusa
  zero violação de formato

### AC-4: Faixas coerentes
- **Dado** um campo de faixa preenchido
- **Quando** rodar `bun run validate-data`
- **Então** o mínimo nunca é maior que o máximo, pH fica em `4.0-10.0`, temperatura em `4-35 °C` e
  tamanho em `0.5-400 cm`; valor fora disso só passa se o registro trouxer `fonte` preenchida
  justificando (caso do Axolote, `14-20 °C`)

### AC-5: Higiene tipográfica em todos os idiomas
- **Dado** qualquer texto voltado ao usuário, em `src/data/*.ts` ou em `public/locales/`
- **Quando** rodar `bun run validate-data`
- **Então** não existe travessão nem meia-risca, nem espaço duplo, nem `--` usado como travessão, nem
  tag HTML ou entidade solta; e todo campo narrativo com mais de 40 caracteres termina em pontuação
  final

Aspas curvas saíram deste critério na task 6. A versão original as proibia por serem herança do dump,
mas o acervo tem 478 delas contra 2 aspas retas, e em português elas são a forma tipograficamente
correta. Trocar seria churn contra a norma do próprio texto.

### AC-6: `familia` bate com a taxonomia
- **Dado** uma ficha com `enrichment.taxonomia.familia` preenchida
- **Quando** rodar `bun run validate-data`
- **Então** o campo `familia` é igual à família da taxonomia, e o bloco "espécies da mesma família"
  da ficha agrupa pela mesma string que o cabeçalho exibe

### AC-7: Ficha mínima completa e com procedência
- **Dado** a matriz de obrigatoriedade por tipo de registro (abaixo)
- **Quando** rodar `bun run validate-data`
- **Então** 100% das fichas têm todos os campos marcados como obrigatórios para o seu tipo
  preenchidos, e toda ficha que recebeu campo novo nesta frente tem `fonte` preenchida com a
  referência consultada

### AC-8: Voz de aquarista nos campos narrativos
- **Dado** os campos `caracteristica`, `comportamento`, `alimentacao`, `reproducao`,
  `diformismoSexual` e `outrasInformacoes` de um lote já processado
- **Quando** rodar `bun run validate-data`
- **Então** nenhum texto do lote contém as construções de laudo da lista negra (`Deve-se`,
  `É recomendável que se`, `O mesmo`, `Os mesmos`, `Faz-se necessário`, `Sendo assim`), a média de
  palavras por frase do lote fica em 22 ou menos, nenhuma frase passa de 45 palavras, e o lote está
  marcado como revisado no `journal/` da frente

### AC-9: UI em português acentuada e com números derivados
- **Dado** os 15 namespaces de UI em `public/locales/pt-BR/`
- **Quando** rodar `bun run validate-data`
- **Então** zero strings caem na regra de acentuação faltante, e os totais do acervo exibidos em
  `about` e na home vêm de contagem sobre o dado por interpolação do i18next, não escritos à mão

### AC-10: Paridade de chaves entre os quatro idiomas
- **Dado** o conjunto de chaves que o código consome via `t()`
- **Quando** rodar `bun run validate-data`
- **Então** en, es e ja têm todas essas chaves com valor próprio, zero chave cai no fallback pt-BR
  por ausência, e nenhum idioma tem chave órfã que o código não usa

### AC-11: Cascata só retraduz o que mudou
- **Dado** um campo de ficha editado em português
- **Quando** rodar `bun run translate-fish`
- **Então** só as fichas cujo texto de origem mudou de hash são reenviadas, o resultado de en/es/ja
  passa nas mesmas regras do AC-5, e o japonês entra em `journal/` como pendente de revisão humana

### AC-12: nenhum texto de interface escrito direto no código
- **Dado** os arquivos `.tsx` e `.ts` de `src/`, fora de `src/data/`
- **Quando** rodar `bun run validate-data --rule=embutido`
- **Então** nenhum literal em português voltado ao usuário aparece fora do i18n, e o que hoje está
  embutido (rótulos da taxonomia, tarjas de espécie, nomes e descrições das calculadoras, veredito de
  compatibilidade, textos do montador) passa a vir de `t()` com chave nos quatro idiomas

## Matriz de decisão: obrigatoriedade por campo e tipo de registro
> Define o que "ficha completa" significa e impede o validador de exigir de um caramujo o que só faz
> sentido num ciclídeo. `obrig` = bloqueia o AC-7. `opc` = preenche quando houver dado.
> `n/a` = não se aplica, validador ignora.

| Campo | Peixe doce | Peixe salgado | Invert. doce | Invert. salgado | AC |
|-------|-----------|---------------|--------------|-----------------|-----|
| `nomePopular` | obrig | obrig | obrig | obrig | AC-7 |
| `nomeCientifico` | obrig | obrig | obrig | obrig | AC-7 |
| `familia` | obrig | obrig | obrig | obrig | AC-6, AC-7 |
| `origem` | obrig | obrig | obrig | obrig | AC-7 |
| `ph` | obrig | obrig | obrig | obrig | AC-3, AC-4, AC-7 |
| `temperatura` | obrig | obrig | obrig | obrig | AC-3, AC-4, AC-7 |
| `gh` | obrig | n/a | obrig | n/a | AC-3 |
| `kh` | obrig | n/a | obrig | n/a | AC-3 |
| `tamanhoAdulto` | obrig | obrig | obrig | obrig | AC-3, AC-4, AC-7 |
| `posicaoAquario` | obrig | obrig | obrig | obrig | AC-3, AC-7 |
| `alimentacao` | obrig | obrig | obrig | obrig | AC-7, AC-8 |
| `comportamento` | obrig | obrig | obrig | obrig | AC-7, AC-8 |
| `caracteristica` | obrig | obrig | obrig | obrig | AC-7, AC-8 |
| `reproducao` | obrig | opc | opc | opc | AC-8 |
| `diformismoSexual` | obrig | opc | opc | opc | AC-8 |
| `outrasInformacoes` | opc | opc | opc | opc | AC-8 |
| `outrosNome` | opc | opc | opc | opc | - |
| `fonte` | obrig se editado | obrig se editado | obrig se editado | obrig se editado | AC-7 |
| `imagem` | n/a nesta frente | n/a | n/a | n/a | - |

Razão das linhas `n/a`: em água salgada o aquarista controla salinidade e alcalinidade do sistema
inteiro, não da espécie, então `gh` e `kh` por ficha seriam ruído. `imagem` pertence à frente de
normalização de imagens e não bloqueia nada aqui.

Em marinho, `n/a` para `gh` significa **campo vazio**, não campo ignorado. O importador antigo gravou
densidade ali (`1.023 a 1.025` em 260 das 334 fichas preenchidas), exibida na página com o rótulo
"GH", que para um peixe marinho está errado. Como o valor é do sistema e não da espécie, ele sai do
dado na task 4. A densidade de referência do marinho passa a ser assunto do guia, uma vez, em vez de
repetir o mesmo número em 334 fichas.

Onde `diformismoSexual` é obrigatório e a espécie é monomórfica, o valor correto é a frase explícita
("Machos e fêmeas são iguais por fora."), nunca o campo vazio.

## Casos de borda e erros
- **Faixa legítima fora da escala padrão** (Axolote a `14-20 °C`, Dojo Loach a `10-25 °C`): passa se
  tiver `fonte`, senão vira violação bloqueante.
- **Espécie sem dado publicado** para um campo obrigatório: o valor é a frase que assume a lacuna
  ("Não há relato consistente de reprodução em aquário."), com `fonte` apontando a consulta feita.
  Campo vazio nunca é resposta aceitável para obrigatório.
- **Duplicata de registro** (id 251 x id 132, Polypterus senegalus): o registro completo sobrevive e
  absorve os campos do incompleto, o incompleto sai, e o id removido não pode voltar a ser reusado.
- **Nome popular repetido entre espécies diferentes** (17 casos, ex.: ids 16 e 112): não é duplicata,
  não funde. O validador avisa mas não bloqueia.
- **Retradução com falha de API no meio do lote**: o cache grava o que já veio, o lote seguinte
  retoma pelos hashes pendentes, e nenhum arquivo é escrito pela metade.
- **Japonês:** o agente troca o texto, mas nenhum lote de ja é dado como fechado sem revisão de quem
  leia o idioma. Fica registrado em `journal/` como dívida aberta.

## Fora de escopo
> Vinculante. Não implemente nada aqui.
- Normalizar as imagens que faltam. É a frente própria de normalização, já no board.
- Trocar o schema de `Fish` para campos numéricos (`phMin`/`phMax`) com formatação por locale. É o
  destino certo do dado de parâmetro, mas não nesta frente: aqui o valor continua string, só que num
  formato único e validado.
- Escrever fichas para espécies novas que ainda não estão no acervo.
- Os 71 erros de lint pré-existentes.
- A frente de monetização (`/apoie`, aviso de afiliado). Toca os mesmos arquivos de UI, mas é decisão
  de produto e corre por fora.

## Rastreabilidade
- Board: `dxspec/STATE.md`
- Memória da frente: `./STATE.md` e `./journal/`
- Tasks: `./tasks.md`
