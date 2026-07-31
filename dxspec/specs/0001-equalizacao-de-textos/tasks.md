---
name: tasks
description: Decomposicao e gates da equalizacao de textos. Puxe ao implementar.
alwaysApply: false
---

# Tasks - Equalização e humanização dos textos do acervo

> Cada task mapeia para um ou mais `AC-N` e tem um gate executável. Um commit por task.
> As tasks 9, 10 e 12 não fecham de uma vez: são loops de lote, e cada volta do loop é um commit.

## Plano

| #  | Task | Cobre AC | Depende de | Gate (comando) | Status |
|----|------|----------|------------|----------------|--------|
| 1  | `scripts/validate-data.ts` com as regras `chaves`, `formato`, `faixas`, `tipografia`, `taxonomia`, `completude`, `voz`, `acentuacao`, `paridade`, e placar no fim | AC-1 | - | `bun run validate-data` imprime o placar e sai 0 ou 1 | done |
| 2  | Rechavear `data-*.json` para `<tipo>:<id>` e ajustar `useTranslatedSpecies` e `generate-pt-data` | AC-2 | 1 | `bun run validate-data --rule=chaves` | done (276 restantes, dependem da cascata) |
| 3  | Fundir a duplicata `Polypterus senegalus` (251 sai, 132 absorve e ganha `ph`) | AC-7 | 1 | `bun run validate-data --rule=completude` sem o alerta de duplicata | todo |
| 4  | Normalizar formato de `ph`, `gh`, `kh`, `temperatura`, `tamanhoAdulto` e `posicaoAquario` nos 4 arquivos | AC-3 | 1 | `bun run validate-data --rule=formato` | todo |
| 5  | Corrigir as faixas incoerentes (ids 78, 277, 465 e os três `ph` gravados como `"a"`) e marcar as legítimas com `fonte` | AC-4 | 4 | `bun run validate-data --rule=faixas` | todo |
| 6  | Higiene tipográfica em `src/data/*.ts`: aspas curvas, travessão, espaço duplo, pontuação final | AC-5 | 1 | `bun run validate-data --rule=tipografia --locale=pt-BR` | todo |
| 7  | Alinhar `familia` à taxonomia GBIF nas 75 divergências e revisar as 85 fichas sem taxonomia | AC-6 | 1 | `bun run validate-data --rule=taxonomia` | todo |
| 8  | Preencher as colunas 100% vazias, uma passada por arquivo e campo (salgada: `posicaoAquario`, `tamanhoAdulto`; inv. doce: `posicaoAquario`, `caracteristica`; inv. salgada: `posicaoAquario`) | AC-7 | 4,5 | `bun run validate-data --rule=completude` mostra as colunas zeradas | todo |
| 9  | **Loop:** as 32 fichas esqueleto, em lotes de 20, com `fonte` citada | AC-7 | 8 | `bun run validate-data --rule=completude --lote=<n>` | todo |
| 10 | **Loop:** buracos esparsos de água doce e salgada, lotes de 20, com `fonte` citada | AC-7 | 9 | `bun run validate-data --rule=completude` chega a 100% | todo |
| 11 | Guia de voz em `./voz.md` mais lote piloto de 20 fichas para calibrar antes de escalar | AC-8 | 6 | revisão do usuário no lote piloto, registrada em `journal/` | todo |
| 12 | **Loop:** reescrita dos campos narrativos em lotes de 20, na voz calibrada | AC-8 | 11 | `bun run validate-data --rule=voz --lote=<n>` | todo |
| 13 | Acentuar as 171 strings de UI em `public/locales/pt-BR/` | AC-9 | 1 | `bun run validate-data --rule=acentuacao` | todo |
| 14 | Derivar os totais do acervo do dado (about e home) por interpolação, e apagar as contagens fixas | AC-9 | 13 | `bun run validate-data --rule=acentuacao` mais conferência do número na página | todo |
| 15 | Corrigir as 124 chaves do espanhol em `support`, `guides`, `filters`, `builder` e `search` `[P]` | AC-10 | 1 | `bun run validate-data --rule=paridade` | todo |
| 16 | Cache por hash do texto de origem no `translate-fish`, no lugar do cache por id | AC-11 | 2 | `bun run translate-fish` reenvia só o que mudou | todo |
| 17 | Regras de voz e proibição de travessão dentro do prompt de tradução, e repasse em en/es/ja | AC-5, AC-11 | 12,16 | `bun run validate-data --rule=tipografia` nos 4 idiomas | todo |
| 18 | Instalar o eval de fidelidade no CI com `/spec-ci` | AC-1 | 1 | workflow do GitHub Actions verde | todo |
| 19 | **Proposta, aguarda emenda da spec:** levar para o i18n os ~75 textos em português escritos direto no `.tsx`/`.ts` (`calculators.ts` 19, `AquariumBuilderPage` 13, `compatibility.ts` 9, `SpeciesBadges` 8, `TaxonomyTree` 7 e outros), mais a regra `embutido` no validador | AC-12 (a criar) | 13 | `bun run validate-data --rule=embutido` | proposta |

## Protocolo do loop
Vale para as tasks 9, 10 e 12, que são as que consomem o acervo inteiro.

1. O validador aponta o próximo lote (as 20 fichas mais críticas ainda pendentes da regra em foco).
2. Critério de ordenação: fichas esqueleto primeiro, depois as de espécies populares em água doce,
   depois o resto por arquivo.
3. Pesquisa e escrita do lote, sempre preenchendo `fonte`.
4. `bun run validate-data` roda inteiro, não só a regra do lote, para pegar regressão.
5. Commit no padrão `Feat: equaliza lote NN (AC-7)` e uma linha em `journal/`.
6. O placar do validador é o progresso: o loop termina quando as regras bloqueantes zeram.

Lotes de 20 e 705 fichas dão a ordem de grandeza de 35 voltas por frente de loop. Não é para fazer
tudo numa sessão, e sim para parar e retomar sem perder o fio.

## Plano de teste
- **Unidade:** as regras do validador testadas contra registros sintéticos, um caso por linha da
  matriz de decisão da spec (obrigatório, opcional, não se aplica por tipo).
- **Integração:** `generate-pt-data` mais `translate-fish` sobre um acervo de amostra, conferindo que
  o rechaveamento não perde nem troca ficha.
- **Aceite:** um comando de validador por AC, como na coluna de gate acima. O placar de
  `bun run validate-data` sem argumento é o gate de aceite da frente inteira.

Hoje o projeto não tem runner de teste. A task 1 traz o validador; se o teste unitário das regras for
o primeiro teste do repositório, ele entra junto com o runner na mesma task.

## Divergências (SPEC_DEVIATION)
> Se a implementação precisar fugir da spec, registre aqui antes de seguir.
- [ ] **Task 1 - `gh` em água salgada guarda densidade, não dureza.** A matriz da spec marcou `gh` como
      não aplicável em marinho supondo o campo vazio. O validador mostrou o oposto: 334 das 346 fichas
      têm `gh` preenchido, e o valor é densidade (`1.023 a 1.025` em 260 delas, mais 8 variações com
      erro de digitação como `1.23 a 1.025` e `1023 a 1.025`). A ficha exibe isso rotulado "GH", que
      para um peixe marinho está simplesmente errado. Resolução pendente de decisão do usuário antes
      da task 4: mover para um campo `densidade`, ou tratar como parâmetro de sistema e limpar.
      Não mexer em `gh` de marinho até decidir.

## Checklist de Definition of Done
- [ ] Todos os AC verdes pelo gate executável (não por inspeção)
- [ ] Nenhum `SPEC_DEVIATION` pendente
- [ ] Decisão do formato canônico de parâmetro registrada como ADR (é difícil de reverter: toca os
      quatro arquivos de dado e os quatro idiomas de uma vez)
- [ ] Spec reflete o que foi construído
- [ ] `dxspec/STATE.md` e `./STATE.md` atualizados
