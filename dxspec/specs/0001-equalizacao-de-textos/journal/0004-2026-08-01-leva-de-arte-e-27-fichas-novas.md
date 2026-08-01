# Journal 0004 - 2026-08-01 - leva de arte, 27 fichas novas e o lote 02 de voz

> Entrada **imutavel** do diario desta frente. Uma por handoff (pause). Nunca reescreva entradas
> antigas; corrija criando uma nova entrada. O snapshot mutavel e o `../STATE.md` (estado AGORA);
> este journal e o log de COMO chegou ate aqui (estilo migration).

**Quando:** 2026-08-01
**Quem:** Daniel Vieira (via agente)
**Gatilho:** pause de fim de sessao

## O que aconteceu

- **O pedido entrou por imagem, nao por task.** O Daniel largou 86 PNG numa pasta `novos-peixes/` e
  pediu para colocar no ar, avisando que alguns arquivos tinham o nome no proprio arquivo, que havia
  varias corydoras e que provavelmente nem todas estavam no sistema. No meio da sessao completou que
  algumas eram planta e coral. Nao havia coral nenhum no lote.
- **86 arquivos, 76 uteis.** Dez eram duplicata exata por md5 (a serie `08_43_58` repetia a
  `08_43_19/20`). Das 76, **75 entraram** e uma ficou sem destino. O manifesto de arte propria saiu de
  **38 para 113 slugs**.
- **27 fichas novas**, e a razao de existirem e que a arte chegou sem ter onde morar:
  - 18 Corydoradinae: 15 com binomial (`similis`, `splendens`, `Scleromystax barbatus`,
    `Brochis multiradiatus`, `melini`, `duplicareus`, `metae`, `davidsandsi`, `weitzmani`, `eques`,
    `rabauti`, `concolor`, `leopardus`, `trilineatus`, `arcuatus`) e 3 formas sem descricao formal
    (CW009, CW010 e Venezuela Black).
  - 6 variedades de guppy, seguindo o padrao que o acervo ja usava em
    `Poecilia sphenops var. black`.
  - 3 plantas: `Hydrocotyle verticillata`, `Phyllanthus fluitans` e
    `Cryptocoryne crispatula var. tonkinensis`.
  Agua doce foi de 244 para 268 fichas; plantas, de 148 para 151.
- **Sete corys e oito plantas que ja existiam estavam com o campo `imagem` vazio**, ou seja, sem
  imagem nenhuma na tela. A leva fechou esses buracos (aeneus, panda, pygmaeus, habrosus, albino,
  venezuelanus, adolfoi; Java fern, Pistia, Elodea, Bucephalandra, Staurogyne, Monte Carlo, Ambulia e
  Crypto wendtii brown).
- **Lote 02 de voz entregue**: 24 fichas, 144 celulas, escritas pelo `voz.md` a partir do material do
  `harvest-params`. Passa em `--rule=voz --lote=02` sem violacao. Foram necessarias quatro correcoes
  de frase por causa da lista negra, todas por "a mesma" dentro de "com a mesma agua".
- **O placar de agua doce subiu de 72% para 75%** de ficha minima (176/244 para 200/268): as 24
  fichas novas entraram completas, com parametro colhido em fonte e texto na voz nova.
- **O total de bloqueantes subiu de 2011 para 2078**, e isso e esperado: sao 24 fichas novas vezes os
  tres idiomas que faltam, 72 violacoes de `chaves`. E a mesma divida das outras 91 fichas sem
  cascata. Em compensacao `tipografia` caiu de 114 para 109, de carona na limpeza dos textos do
  `/apoie`.
- **Regressao seria causada pelo `bun run enrich`**, achada ao revisar o diff antes de commitar: o
  script regrava o bloco `enrichment` inteiro e **nao preserva `wikiPhotoUrl`**. Foram **372 URLs de
  foto destruidas** (190 em agua doce, 182 em salgada), que sao justamente a imagem de fallback das
  centenas de fichas sem arte propria. Restaurei as 190 de agua doce campo a campo a partir do HEAD e
  reverti agua salgada e os dois arquivos de invertebrados, que nao eram do escopo. **O bug no script
  continua la.**
- **Uma correcao de taxonomia** que so apareceu porque o `enrich` rodou: `Trichogaster leerii` (id
  163) tinha `familia` gravada como `Osphroneminae`, que e subfamilia. Corrigido para
  `Osphronemidae`, conforme o GBIF. O AC-6 voltou a zero.
- **Identificacao das ilustracoes sem nome.** As 30 plantas e os corys sem nome sairam por leitura da
  imagem cruzada com o acervo. Das 10 restantes, 7 o Daniel nomeou depois; para fechar essas, tres
  agentes rodaram em paralelo (Tropheus, Neolamprologus, planta) e cada resultado foi conferido
  contra a `caracteristica` que ja estava gravada na propria ficha. Esse cruzamento resolveu o caso do
  `boulengeri`, que eu nao tinha conseguido cravar sozinho: a ficha dizia "tres ou quatro manchas bem
  definidas", que era exatamente o desenho.
- **Duas identificacoes contrariaram o nome do arquivo:**
  - O arquivo `brichardi.png` **nao e brichardi**. A arte que ja estava publicada no registro 102 e
    que bate com a ficha (virgula preta atras do olho, mancha dourada acima, cauda em lira com
    filamentos). A imagem nova e esguia, de cauda bifurcada e dorsal pontilhada, do genero
    *Cyprichromis*, e foi para o registro 48 (`leptosoma`) com **confianca media**: as barras
    verticais nitidas sao mais tipicas de *C. zonatus*, que o acervo nao tem.
  - O arquivo `blunthead cichlid` **nao e Tropheus**. Corpo amarelo com sete barras pretas e
    nadadeiras escarlates nao existe no genero. O padrao e de femea de *Mesoheros festae*, que nao
    esta no acervo (conferi tambem que nao e `Cichlasoma salvini` nem o Green Terror). Ficou de fora.
- **Os originais sairam do repositorio.** `novos-peixes/` esta vazia e os PNG foram para
  `/Users/danielvieira/projects/aquarismo/ilustracoes/`, dividida em `publicadas/` (75, cada arquivo
  renomeado para o slug do registro que ilustra), `duplicadas/` (10) e `sem-destino/` (1), com um
  `README.md` ligando cada slug ao nome original. Sao 240 MB que nao devem ser versionados.

## Decisoes

- **Variedade de guppy vira ficha propria, uma por arte.** Escolha do Daniel entre tres opcoes. Motivo
  load-bearing: o acervo ja tratava variedade selecionada assim (`Poecilia latipinna var. balloon`,
  `Poecilia sphenops var. black`), e o `voz.md` ja tem regra para o caso ("o texto fala da variedade e
  assume que os parametros sao os da especie").
- **Genero classico `Corydoras` no `nomeCientifico`, nao a revisao de 2024.** Os arquivos vinham
  nomeados com `Hoplisoma`, `Osteogaster`, `Brochis` e `Gastrodermus`, mas o acervo inteiro usa
  `Corydoras`. Trocar em 18 fichas novas criaria duas convencoes no mesmo arquivo. `Scleromystax
  barbatus` e `Brochis multiradiatus` ficaram no genero proprio porque nunca foram `Corydoras` no
  acervo.
- **Ilustracao sem identificacao confiavel nao entra.** Decisao do Daniel no inicio ("deixar de fora
  por ora") e mantida no fim para a `blunthead cichlid`. Motivo: arte na especie errada e pior que
  ficha sem arte, porque ensina o errado e ninguem audita depois.
- **A ficha da `tonkinensis` foi criada a partir da imagem**, e nao o contrario. E a unica da leva em
  que a especie foi escolhida para acomodar a arte. Registrado aqui de proposito: se algum dia a
  identificacao for contestada, esta e a ficha para olhar primeiro. A alternativa era guardar a
  imagem como segunda foto da `balansae`.
- **O `enrich` nao volta a rodar no acervo inteiro antes do bug de `wikiPhotoUrl` ser corrigido.**

## Estado ao pausar

- **Proximo passo (naquele momento):** os bloqueios desta frente nao se moveram. O lote 01 continua
  esperando a revisao do Daniel, e agora o lote 02 esta na mesma fila. A decisao rapida de GH e KH em
  agua salgada tambem segue aberta desde a entrada 0003.
- **Bloqueios abertos:** os mesmos tres de antes (lote piloto sem revisao, quatro duplicatas de agua
  doce sem decisao, japones sem revisor), mais um novo que nao e desta frente mas nasceu aqui: o
  `enrich-data.ts` destroi `wikiPhotoUrl` e nao pode ser rodado ate ser corrigido.

## Referencias

- Commits: `e28e2ea` (fichas e arte), `4d59f23` (AdSense, frente de monetizacao), `42fabc5` (as sete
  ultimas ilustracoes)
- Artefatos tocados: `src/data/fish-agua-doce.ts`, `src/data/plants.ts`,
  `src/data/normalized-images.ts`, `scripts/textos-pt/lote-02.json`, `scripts/origens-pt.json`,
  `public/images/` (75 arquivos novos ou trocados), `public/locales/pt-BR/data-fish.json`,
  `public/locales/pt-BR/data-plants.json`, `./lotes.json`
- Nao houve mudanca em `spec.md` nem em `tasks.md`. O lote 02 e continuacao da task 11, que ja estava
  aberta; as fichas novas nao criam AC novo, entram na mesma medicao do AC-7.
