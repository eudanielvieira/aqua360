# Journal 0001 - 2026-07-31 - abertura da frente e leva mecanica

> Entrada **imutavel** do diario desta frente. Uma por handoff (pause). Nunca reescreva entradas
> antigas; corrija criando uma nova entrada. O snapshot mutavel e o `../STATE.md` (estado AGORA);
> este journal e o log de COMO chegou ate aqui (estilo migration).

**Quando:** 2026-07-31
**Quem:** Daniel Vieira (via agente)
**Gatilho:** pause de fim de sessao

## O que aconteceu

**Abertura.** A frente nasceu de um pedido amplo ("equalizar e humanizar todos os textos") e virou
spec com diagnostico medido antes de qualquer decisao. Numeros de abertura: 705 fichas, 154 completas
na ficha minima (22%), 1630 lacunas, 92 ids colidindo entre os quatro arquivos, 171 strings de UI em
pt-BR sem acentuacao, 124 chaves que o codigo pedia e o espanhol nao tinha.

**Feito (9 tasks das 20).**
- Task 1: `scripts/validate-data.ts`, nove regras, placar da ficha minima, `--rule/--locale/--lote/
  --full/--json/--snapshot`, sai 1 em bloqueante. Baseline de campos vazios versionada como marco
  zero da regra de procedencia.
- Task 2: chave das traducoes passou a levar o slug (`agua-doce:177`). Campos traduziveis, mapa de
  namespace e funcao de chave sairam para `src/translatable-fields.ts`, no lugar de viverem copiados
  em tres arquivos.
- Task 3: fusao da duplicata Polypterus senegalus (251 sai, 132 absorve). Agua doce: 245 -> 244.
- Tasks 4 e 5: formato canonico do ADR 0001 em 1732 valores, 13 casos decididos um a um, 336 campos
  limpos no marinho, 3 faixas incoerentes resolvidas.
- Task 6: higiene tipografica no acervo em portugues. 128 espacos duplos, 12 travessoes, 7 graus, 48
  pontuacoes finais, mais 24 casos que exigiram leitura.
- Task 7: 75 familias alinhadas ao GBIF, em 23 pares distintos.
- Task 13: 389 palavras acentuadas na UI em pt-BR, a partir de um dicionario levantado do vocabulario
  real dos arquivos (`scripts/pt-acentos.json`, 176 entradas).
- Task 15: 124 chaves do espanhol rechaveadas em cinco namespaces.

**Falta.** Tasks 7b, 8, 9, 10 (pesquisa por especie), 11 e 12 (voz), 14, 16, 17 (cascata), 18, 19.

**Placar.** De 10536 para 2598 bloqueantes. Zerados: `formato`, `faixas`, `taxonomia`, `acentuacao`,
`paridade`. `completude` subiu de 2208 para 2211, que e progresso disfarcado: normalizar revelou campo
vazio antes mascarado por residuo (`ph` gravado como a string `"a"` contava como preenchido).

**Dois bugs achados abrindo o app, nenhum deles previsto na spec.**
1. `/guias` estava em tela branca nos quatro idiomas. `GuidesPage` pedia `t('cyclingSteps')` como
   array e a chave nunca existiu em nenhum locale. Bug anterior a frente.
2. O `:` e o separador de namespace do i18next, entao a chave nova nao resolvia nada e tudo caia no
   portugues. Isso teria passado por "funcionando" numa conferencia so do caso negativo.

## Decisoes

- **Voz de aquarista experiente** na reescrita, calibrada por exemplo na spec. Escolhida sabendo que
  da mais trabalho do que so limpar o texto atual.
- **Dado faltante vem de pesquisa com fonte citada** (FishBase, Seriously Fish, GBIF). A opcao mais
  lenta das tres consideradas, porque site de referencia nao publica pH escrito de memoria. Efeito
  pratico ja visivel na task 5: dois valores com digito perdido viraram campo vazio em vez de palpite.
- **Portugues e a nascente.** `data-*.json` de en/es/ja nunca e editado a mao.
- **Formato canonico troca o "a" por hifen** (`24-27 °C`). Motivo: esses campos nao passam pela camada
  de traducao, entao o leitor ingles lia a preposicao portuguesa. Dificil de reverter -> ADR 0001.
- **`gh` em marinho guardava densidade**, nao dureza, em 334 fichas, exibida com o rotulo "GH".
  Decisao do usuario: limpar, por ser parametro do sistema e nao da especie.
- **A proibicao de aspas curvas do AC-5 estava errada** e foi removida. O acervo tem 478 delas contra
  2 retas e em portugues sao a forma correta: a regra teria piorado 221 fichas.
- **Texto de interface escrito direto no `.tsx` entra na frente** como AC-12 (decisao do usuario).
- **A regra `paridade` passou a ler os `t()` do codigo**, nao so comparar os arquivos de idioma entre
  si. Foi o buraco que deixou `/guias` quebrada em producao sem ninguem ver.

## Estado ao pausar
- **Proximo passo (naquele momento):** task 8, `posicaoAquario` nas 460 fichas em que a coluna esta
  100% vazia, derivando da familia e do que `comportamento` ja descreve.
- **Bloqueios abertos:** nenhum tecnico. Duas pendencias de gente: a task 11 pede revisao do usuario
  num lote piloto de 20 fichas antes de escalar a voz para o acervo, e o japones nao tem revisor.

## Referencias
- Commits: `a8b6d38` (spec), `5dfb3ae` (validador), `7789e9a` (rechaveamento), `94d2893`, `ab9e484`
  (fusao), `0a4502c` (formato e faixas), `b92ad48` (tipografia), `f1c8449` (taxonomia), `d4686df`
  (guias em branco), `d266837` (espanhol), `b5903b7` (acentuacao), `bcc5572` (STATE).
- Artefatos criados: `spec.md`, `tasks.md`, `STATE.md`, `adr-0001-formato-canonico-de-parametros.md`,
  `scripts/validate-data.ts`, `scripts/pt-acentos.json`, `scripts/.validate-baseline.json`,
  `src/translatable-fields.ts`.
- Artefatos tocados: os quatro `src/data/fish-*.ts`, `src/data/fish-index.ts`,
  `src/hooks/useTranslatedSpecies.ts`, `src/pages/GuidesPage.tsx`, `scripts/generate-pt-data.ts`,
  `scripts/translate-fish.ts`, `public/locales/*` e `package.json`.
