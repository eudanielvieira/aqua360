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

**Ultima atualizacao:** 2026-07-31 por Daniel Vieira (abertura da spec 0001, equalizacao de textos)

## Foco atual
- **Equalização de textos (spec 0001).** Frente nova e a maior do projeto. O acervo tem 705 fichas e
  só 154 estão completas na ficha mínima; 92 ids colidem entre os quatro arquivos e fazem 92 fichas
  servirem conteúdo de outro peixe em EN/ES/JA; os parâmetros têm formatos e erros de digitação; e a
  UI em português tem 171 strings sem acentuação. O plano é um validador que serve de placar e gate,
  normalização mecânica, preenchimento com fonte citada e reescrita na voz de aquarista, tudo em
  lotes de 20. Ver `dxspec/specs/0001-equalizacao-de-textos/spec.md`.
- **Monetização.** O site vai passar a ter propaganda e links de afiliado, e o texto do projeto foi
  escrito prometendo o oposto. A página Sobre já está limpa nos quatro idiomas, mas `/apoie` continua
  vendendo "Sem anúncios" como benefício de quem apoia, e não existe em lugar nenhum o aviso de
  divulgação de afiliado.
- Em paralelo, a normalização das ilustrações segue por demanda: chega arte nova pelo chat, entra pela
  esteira. Nesta pausa entraram quatro.

## Frentes
> Uma linha por frente. Status: ativa | on-deck | concluida | pausada.

| Frente | Status | STATE local | Proximo passo (resumo) |
|--------|--------|-------------|------------------------|
| Equalização de textos (0001) | ativa | `dxspec/specs/0001-equalizacao-de-textos/STATE.md` | Nove tasks mecânicas fechadas (placar de 10536 para 2598). Próxima: `posicaoAquario` nas 460 fichas com a coluna vazia (task 8) |
| Monetização (propaganda + afiliados) | ativa | - | Tirar a promessa de "Sem anúncios" de `/apoie` (pt e es) e decidir onde entra o aviso de afiliado |
| Normalização de imagens (sem spec própria) | pausada | - | Processar o próximo lote de arte que chegar |
| Colisão de ids nas traduções | absorvida | `dxspec/specs/0001-equalizacao-de-textos/` | Virou a task 2 da spec 0001. São 92 ids, não 74: a contagem antiga só olhava doce contra salgada |

> Frentes sem pasta propria (ex.: IMP-*) vivem como linha aqui ate virarem feature/spec.

## Bloqueios (cross-frente)
- Nenhum bloqueio técnico. Um alerta de conformidade: enquanto os links de afiliado subirem sem aviso
  de divulgação, o site fica exposto nas regras de programas como o Amazon Associates, que exigem
  aviso visível. Isso é decisão de produto, não trava código.

## Todos soltos (nao pertencem a uma frente ainda)
> Sete todos que estavam aqui viraram task da spec 0001 e saíram desta lista: família errada no Betta,
> duplicata `Polypterus senegalus`, colisão de ids nas traduções, números do acervo escritos à mão,
> limpeza de travessão no `fish-agua-doce.ts`, fichas quase vazias e a replicação dos números da
> página Sobre em en/es/ja. O nome popular repetido entre os ids 16 e 112 também: virou caso de borda
> da spec, com o validador avisando sem bloquear.

- [ ] **`/apoie` promete "Sem anúncios".** `support.json` em pt e es tem `benefit.adFree` ("Sem
      anúncios" / "Com seu apoio o Aqua360 continua 100% gratuito e sem propagandas") e a `description`
      diz "tudo gratuito e sem anúncios". Com propaganda no ar isso é falso na página onde a pessoa
      decide doar. O benefício precisa virar outro (por exemplo, apoiar mantém o catálogo crescendo).
- [ ] **Aviso de divulgação de afiliado.** Não existe em nenhuma página. Com os cards de princípio
      removidos, a Sobre agora não fala nada sobre monetização. Decidir o lugar: card novo na Sobre,
      linha no rodapé ou página própria.
- [ ] Normalizar o resto do acervo. 37 das 731 imagens em `public/images` estão tratadas; o restante
      ainda é o arquivo antigo de 180x135. O caminho é jogar os originais em `source-images/` e rodar
      `bun run normalize-images <nome>`, que já atualiza o manifesto sozinho. Na família Polypteridae
      faltam o Bichir Tigre (130) e o Peixe-Corda (58); o id 251 não tem imagem nenhuma.
- [ ] Decidir o que fazer com o slug `symphysodonauequifasciatus`, que tem um typo ("auequi") vindo do
      dado antigo. Renomear exige mexer no arquivo e no campo `imagem` do Acará Disco ao mesmo tempo.
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
