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

**Ultima atualizacao:** 2026-07-30 por Daniel Vieira

## Foco atual
- Nenhuma frente ativa. O último trabalho (normalização das ilustrações) fechou commitado e verificado
  no navegador, faltando só o deploy.

## Frentes
> Uma linha por frente. Status: ativa | on-deck | concluida | pausada.

| Frente | Status | STATE local | Proximo passo (resumo) |
|--------|--------|-------------|------------------------|
| Normalização de imagens (sem spec própria) | pausada | - | Publicar os 3 commits e processar o próximo lote de ilustrações |

> Frentes sem pasta propria (ex.: IMP-*) vivem como linha aqui ate virarem feature/spec.

## Bloqueios (cross-frente)
- Nenhum.

## Todos soltos (nao pertencem a uma frente ainda)
- [ ] Deploy: os commits `a9f621c`, `d09870f` e `9d58684` estão só no local, nada publicado ainda.
- [ ] Apagar `acara-bandeira.png` na raiz do repositório. É lixo de screenshot do Playwright; a
      remoção foi negada por permissão na sessão do dia 30/07/2026.
- [ ] Normalizar o resto do acervo. 710 dos 724 arquivos em `public/images` ainda são os originais de
      180x135. O caminho é jogar os novos originais em `source-images/` e rodar `bun run normalize-images`,
      que já atualiza o manifesto sozinho.
- [ ] Decidir o que fazer com o slug `symphysodonauequifasciatus`, que tem um typo ("auequi") vindo do
      dado antigo. Renomear exige mexer no arquivo e no campo `imagem` do Acará Disco ao mesmo tempo.
- [ ] 71 erros de lint pré-existentes no projeto, a maioria `no-explicit-any` e `set-state-in-effect`.
      Não vieram deste trabalho, mas seguram qualquer gate de CI que rode `bun run lint`.

## Historico
> O historico do projeto e o **journal global** append-only em `dxspec/journal.md` (nunca podado).
> O board e snapshot: nao acumule historico aqui. Cada handoff acrescenta uma entrada la.
- Ver `dxspec/journal.md` (ledger cronologico do projeto).
