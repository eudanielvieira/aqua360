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

**Ultima atualizacao:** 2026-07-31 por Daniel Vieira (terceira pausa do dia)

## Foco atual
- **Monetização.** O site vai passar a ter propaganda e links de afiliado, e o texto do projeto foi
  escrito prometendo o oposto. A página Sobre já está limpa nos quatro idiomas, mas `/apoie` continua
  vendendo "Sem anúncios" como benefício de quem apoia, e não existe em lugar nenhum o aviso de
  divulgação de afiliado. É por aí que a próxima sessão começa.
- Em paralelo, a normalização das ilustrações segue por demanda: chega arte nova pelo chat, entra pela
  esteira. Nesta pausa entraram quatro.

## Frentes
> Uma linha por frente. Status: ativa | on-deck | concluida | pausada.

| Frente | Status | STATE local | Proximo passo (resumo) |
|--------|--------|-------------|------------------------|
| Monetização (propaganda + afiliados) | ativa | - | Tirar a promessa de "Sem anúncios" de `/apoie` (pt e es) e decidir onde entra o aviso de afiliado |
| Normalização de imagens (sem spec própria) | pausada | - | Processar o próximo lote de arte que chegar |
| Colisão de ids nas traduções | on-deck | - | Decidir se rechaveia `data-*.json` por tipo, para acabar com as 74 fichas trocadas em EN/ES/JA |

> Frentes sem pasta propria (ex.: IMP-*) vivem como linha aqui ate virarem feature/spec.

## Bloqueios (cross-frente)
- Nenhum bloqueio técnico. Um alerta de conformidade: enquanto os links de afiliado subirem sem aviso
  de divulgação, o site fica exposto nas regras de programas como o Amazon Associates, que exigem
  aviso visível. Isso é decisão de produto, não trava código.

## Todos soltos (nao pertencem a uma frente ainda)
- [ ] **`/apoie` promete "Sem anúncios".** `support.json` em pt e es tem `benefit.adFree` ("Sem
      anúncios" / "Com seu apoio o Aqua360 continua 100% gratuito e sem propagandas") e a `description`
      diz "tudo gratuito e sem anúncios". Com propaganda no ar isso é falso na página onde a pessoa
      decide doar. O benefício precisa virar outro (por exemplo, apoiar mantém o catálogo crescendo).
- [ ] **Aviso de divulgação de afiliado.** Não existe em nenhuma página. Com os cards de princípio
      removidos, a Sobre agora não fala nada sobre monetização. Decidir o lugar: card novo na Sobre,
      linha no rodapé ou página própria.
- [ ] **Família errada no Betta (id 21).** O campo `familia` diz `Anabantidae`, a taxonomia do GBIF no
      mesmo registro diz `Osphronemidae`, que é o correto, e a ficha mostra as duas coisas. O efeito é
      que "Espécies da mesma família (Anabantidae)" lista só o Gourami Leopardo (*Ctenopoma
      acutirostre*) e deixa de fora os gouramis que são parentes de verdade. Corrigir reagrupa fichas,
      então vale varrer os outros registros onde `familia` divergir da taxonomia enriquecida.
- [ ] **Duplicata Polypterus senegalus.** id 251 "Polypterus Senegalus" (*Polypterus senegalus*) é a
      mesma espécie do id 132 "Bichir do senegal" (*P. senegalus senegalus*). O 251 é quase vazio e
      sem imagem; o 132 é a ficha completa e já tem arte nova. Mesmo padrão das fusões do Barbo
      Denison e do Barbo Sumatra: o 132 sobrevive, absorve pH `6.5 a 7.5`, temperatura e tamanho
      `30 cm` do 251, e o 251 sai. De quebra conserta o `ph` do 132, que hoje é a string `"a"`.
- [ ] **Colisão de ids nas traduções.** `useTranslatedSpecies` busca por `t(species.id)` num único
      namespace `data-fish`, mas água doce e salgada têm numeração própria e 74 ids existem nos dois.
      Em EN/ES/JA essas fichas servem conteúdo de outro peixe: o Kinguio (177) vira "Damselfish", o
      Disco (180) vira "Three-Bar Damselfish". As duas fusões de hoje já eliminaram dois casos. O
      conserto é rechavear os quatro `data-*.json` incluindo o tipo (ex: `agua-doce:194`) e ajustar o
      hook.
- [ ] Replicar em en, es e ja os números corrigidos da página Sobre. Os três seguem dizendo 707 peixes
      e "mais de 788 espécies", e usam `--` como travessão no `story.p2` e nas descrições. As chaves
      batem com o português, então é só trocar os valores. O japonês precisa de alguém que leia, o
      agente só trocaria os números. (A remoção dos textos de "sem propaganda" já foi feita nos quatro.)
- [ ] Números do acervo estão escritos à mão em dois lugares e desencontram sozinhos: nos quatro
      `about.json` e nas contagens fixas de `src/data/fish-index.ts`. Vale derivar do dado, via
      interpolação do i18next, como a home já faz com `count`.
- [ ] Normalizar o resto do acervo. 37 das 731 imagens em `public/images` estão tratadas; o restante
      ainda é o arquivo antigo de 180x135. O caminho é jogar os originais em `source-images/` e rodar
      `bun run normalize-images <nome>`, que já atualiza o manifesto sozinho. Na família Polypteridae
      faltam o Bichir Tigre (130) e o Peixe-Corda (58); o id 251 não tem imagem nenhuma.
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
- **Publicacao e automatica, com atraso de minutos.** Os commits vão para `origin/main` sem que o
  agente rode `git push` (o reflog de `origin/main` registra dezenas de `update by push`). O disparo
  não é instantâneo: na pausa anterior `main` apareceu `ahead 2` e esses commits já estavam publicados
  na sessão seguinte. Antes de afirmar que algo está no ar, rode
  `git fetch origin && git status -sb` em vez de assumir, nos dois sentidos.
- **O script de imagens roda em node, nao em bun.** O alocador do bun quebra com as chamadas nativas
  do sharp e derruba o lote com SIGTRAP. O `package.json` já aponta para `node`.
- **Arte nova chega pelo chat.** O arquivo em resolução cheia fica em
  `~/.claude/image-cache/<sessao>/<n>.png`; basta copiar para `source-images/` com o nome do slug que
  o campo `imagem` do registro exige.

## Historico
> O historico do projeto e o **journal global** append-only em `dxspec/journal.md` (nunca podado).
> O board e snapshot: nao acumule historico aqui. Cada handoff acrescenta uma entrada la.
- Ver `dxspec/journal.md` (ledger cronologico do projeto).
