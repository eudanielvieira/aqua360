---
name: STATE
description: BOARD de frentes - roteador fino que o hook carrega. Aponta pro STATE local de cada frente.
alwaysApply: true
---

# STATE (Board) - Frentes de trabalho

> **Board.** Roteador, nao a memoria detalhada. O hook `SessionStart` carrega este arquivo; daqui
> voce vai pro **STATE local** da frente em foco (`dxspec/specs/NNNN-*/STATE.md`). Cada frente guarda
> sua propria memoria junto do seu artefato, pra nao desconectar do todo.
>
> **Convencao de pastas:** `dxspec/` = fonte da verdade de engenharia (SDD: board, specs, mapas).
> Swagger/OpenAPI/docs de API NAO ficam aqui, vao em `api-docs/` ou sao gerados.

**Ultima atualizacao:** 2026-07-31 por Daniel Vieira

## Foco atual
- Nenhuma frente ativa. A normalização das ilustrações roda por demanda: chega arte nova, entra pela
  esteira. O trabalho de hoje está commitado, verificado no navegador e publicado.

## Frentes
> Uma linha por frente. Status: ativa | on-deck | concluida | pausada.

| Frente | Status | STATE local | Proximo passo (resumo) |
|--------|--------|-------------|------------------------|
| Normalização de imagens (sem spec própria) | pausada | - | Processar o próximo lote de arte que chegar |
| Colisão de ids nas traduções | on-deck | - | Decidir se rechaveia `data-*.json` por tipo, para acabar com as 74 fichas trocadas em EN/ES/JA |

> Frentes sem pasta propria (ex.: IMP-*) vivem como linha aqui ate virarem feature/spec.

## Bloqueios (cross-frente)
- Nenhum.

## Todos soltos (nao pertencem a uma frente ainda)
- [ ] **Colisão de ids nas traduções.** `useTranslatedSpecies` busca por `t(species.id)` num único
      namespace `data-fish`, mas água doce e salgada têm numeração própria e 74 ids existem nos dois.
      Em EN/ES/JA essas fichas servem conteúdo de outro peixe: o Kinguio (177) vira "Damselfish", o
      Disco (180) vira "Three-Bar Damselfish". As duas fusões de hoje já eliminaram dois casos. O
      conserto é rechavear os quatro `data-*.json` incluindo o tipo (ex: `agua-doce:194`) e ajustar o
      hook.
- [ ] Normalizar o resto do acervo. 33 das 724 imagens em `public/images` estão tratadas; o restante
      ainda é o arquivo antigo de 180x135. O caminho é jogar os originais em `source-images/` e rodar
      `bun run normalize-images <nome>`, que já atualiza o manifesto sozinho.
- [ ] Escrever ficha para registros quase vazios que apareceram nas levas de imagem: Barbo Rosa (197),
      Bagre de Vidro (244), Bagre Andador (201) e Aruanã Prata (213). O modelo é o Arco-Íris Threadfin
      (194), pesquisado em Seriously Fish e FishBase, com o campo `fonte` preenchido.
- [ ] Decidir o que fazer com o slug `symphysodonauequifasciatus`, que tem um typo ("auequi") vindo do
      dado antigo. Renomear exige mexer no arquivo e no campo `imagem` do Acará Disco ao mesmo tempo.
- [ ] Limpeza de texto no `fish-agua-doce.ts`: 9 ocorrências de travessão ou meia-risca em campos que
      aparecem na ficha, mais textos truncados como "Rios Amazonas e Solim" (id 10) e erros de digitação
      como "Bacia do rios" (id 11).
- [ ] Nome popular repetido entre os ids 16 (*Aulonocara jacobfreibergi*) e 112 (*Nimbochromis
      venustus*). Não é duplicata de registro, são espécies diferentes com o mesmo nome popular.
- [ ] 71 erros de lint pré-existentes no projeto, a maioria `no-explicit-any` e `set-state-in-effect`.
      Não vieram deste trabalho, mas seguram qualquer gate de CI que rode `bun run lint`.

## Notas de operacao
- **Publicacao e automatica.** Os commits vao para `origin/main` logo depois de criados, sem que o
  agente rode `git push` (o reflog de `origin/main` registra 64 `update by push`). Não existe fila de
  commits locais esperando deploy; assuma que o que foi commitado já está publicado.
- **O script de imagens roda em node, nao em bun.** O alocador do bun quebra com as chamadas nativas
  do sharp e derruba o lote com SIGTRAP. O `package.json` já aponta para `node`.
- **Arte nova chega pelo chat.** O arquivo em resolução cheia fica em
  `~/.claude/image-cache/<sessao>/<n>.png`; basta copiar para `source-images/` com o nome do slug que
  o campo `imagem` do registro exige.

## Historico
> O historico do projeto e o **journal global** append-only em `dxspec/journal.md` (nunca podado).
> O board e snapshot: nao acumule historico aqui. Cada handoff acrescenta uma entrada la.
- Ver `dxspec/journal.md` (ledger cronologico do projeto).
