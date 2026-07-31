# Journal 0003 - 2026-07-31 - ficha homogenea, com a lacuna visivel

> Entrada **imutavel** do diario desta frente. Uma por handoff (pause). Nunca reescreva entradas
> antigas; corrija criando uma nova entrada. O snapshot mutavel e o `../STATE.md` (estado AGORA);
> este journal e o log de COMO chegou ate aqui (estilo migration).

**Quando:** 2026-07-31
**Quem:** Daniel Vieira (via agente)
**Gatilho:** pause de fim de sessao

## O que aconteceu
- **O pedido foi uma correcao de rota, nao uma task nova.** O Daniel abriu com "eu acho que nao fui
  claro quando solicitei uma equalizacao da base" e mandou duas fichas lado a lado: o Escalar, com
  classificacao taxonomica e seis blocos de texto, e o Altum, sem taxonomia e sem caracteristicas. O
  incomodo nao era o dado faltando, que a frente ja media, era a **secao sumir junto com o dado**.
  Duas fichas nunca tinham o mesmo formato, entao nao dava para distinguir "esta especie nao tem
  dimorfismo descrito" de "esta ficha nao tem essa secao".
- **A ficha de peixe passou a sair sempre igual**, na mesma ordem, nas 704 especies: identificacao
  (outros nomes, familia, origem), parametros (pH, GH, KH, temperatura, tamanho adulto, posicao),
  classificacao taxonomica com os sete postos, e os blocos de texto (caracteristicas, comportamento,
  alimentacao, reproducao, dimorfismo, outras informacoes, fonte). Onde nao ha dado, a linha fica e
  diz "Nao informado", em italico apagado para nao se confundir com conteudo real.
- **O dado nao foi tocado.** Campo vazio continua vazio no arquivo. O `validate-data` roda depois da
  mudanca com os mesmos 2011 bloqueantes e o mesmo placar de ficha minima (176/704). Foi decisao
  explicita: gravar "Nao informado" no dado zeraria o `completude` e transformaria 1624 lacunas reais
  em texto de enfeite.
- **Tres lacunas que a homogeneizacao expos** e que nenhuma regra do validador pegava, porque a
  pagina simplesmente escondia:
  - `enrichment.taxonomia` ausente em **84 das 704** fichas.
  - posto `classe` vazio em **536 das 620** que tem o bloco de taxonomia. Era por isso que o Escalar
    da imagem pulava de Filo para Ordem. O GBIF ja devolve esse campo, entao e enriquecimento, nao
    pesquisa.
  - `outrosNome` vazio em **333 das 704** e `fonte` em **489 das 704**.
- Implementacao: `fallback` opcional no `DetailRow`, no `FactRow` da ficha e no `TaxonomyTree`. Sem a
  prop o componente continua sumindo quando vazio, que e o comportamento das outras fichas; com ela a
  linha fica e assume a lacuna. Chave `detail.notInformed` nos quatro idiomas.
- Verificado no navegador nas duas fichas da imagem do pedido (Altum id 145 e Escalar id 146) e numa
  marinha, em tema claro e escuro. `tsc -b` limpo; `eslint` sem erro nos arquivos tocados (os 71 do
  `bun run lint` seguem os mesmos pre-existentes).

## Decisoes
- **Placeholder mora na apresentacao, nao no dado.** "Nao informado" e renderizado quando o campo
  esta vazio; o arquivo de dados nao muda. Motivo load-bearing: o `completude` (AC-7) e o placar da
  ficha minima medem campo vazio, e escrever o placeholder no dado apagaria a medicao que sustenta a
  frente inteira.
- **`fallback` e opt-in por componente**, nao comportamento novo do `DetailRow`. Plantas, corais e
  doencas usam o mesmo componente e continuam escondendo campo vazio. Motivo: o pedido foi sobre
  peixe, e mudar o padrao global mexeria em tres telas sem ninguem ter olhado.
- **Secoes de midia e de link externo continuam condicionais** (fotos da comunidade, distribuicao
  geografica, saiba mais). Nao sao campo da especie, sao widget que depende de fonte externa; uma
  secao "Distribuicao Geografica: Nao informado" seria ruido, nao lacuna de conteudo.

## Estado ao pausar
- **Proximo passo (naquele momento):** decidir o caso de GH e KH em agua salgada. As 346 fichas
  marinhas agora mostram os dois como "Nao informado", mas marinho **nao tem** esses parametros por
  especie: o `gh` foi limpo justamente porque guardava densidade, que e parametro do sistema, e o
  `kh` ja e opcional la. Sao 692 falsos sinais de trabalho. Tres saidas: esconder os dois nas
  categorias marinhas, criar um segundo texto ("Nao se aplica") ou deixar como esta.
- **Bloqueios abertos:** os mesmos de antes desta sessao. O lote piloto de texto (`lote-01.json`)
  esperando revisao do Daniel, que segura as outras 71 fichas de agua doce e a cascata para en/es/ja;
  as quatro duplicatas de agua doce esperando decisao de fundir; e o japones sem revisor.

## Referencias
- Commit: `b5703c4`
- Artefatos tocados: `src/pages/FishDetailPage.tsx`, `src/components/DetailRow.tsx`,
  `src/components/TaxonomyTree.tsx`, `public/locales/{pt-BR,en,es,ja}/common.json`
- Nao houve mudanca em `spec.md` nem em `tasks.md`: a entrega e de apresentacao, e os AC de conteudo
  seguem medindo o mesmo.
