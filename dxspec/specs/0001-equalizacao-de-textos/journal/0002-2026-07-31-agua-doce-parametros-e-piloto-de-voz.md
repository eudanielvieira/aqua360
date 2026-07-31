# Journal 0002 - 2026-07-31 - agua doce: parametros fechados e piloto de voz

> Entrada **imutavel** do diario desta frente. Uma por handoff (pause). Nunca reescreva entradas
> antigas; corrija criando uma nova entrada. O snapshot mutavel e o `../STATE.md` (estado AGORA);
> este journal e o log de COMO chegou ate aqui (estilo migration).

**Quando:** 2026-07-31
**Quem:** Daniel Vieira (via agente)
**Gatilho:** pedido direto do Daniel, "a falta de padrao dos peixes de agua doce me incomoda"

## O que aconteceu

O pedido chegou pelo sintoma, nao pela task: umas fichas com informacao, outras sem, outras quase em
branco. Medido, o sintoma era o AC-7 concentrado em agua doce: 809 celulas vazias nas 244 fichas, 25
delas com 12 dos 13 campos obrigatorios em branco. Escolhemos fechar agua doce inteira antes de olhar
os outros tres arquivos, e fazer o texto por lote com revisao, que e o que a task 11 ja mandava.

**Ferramenta antes do conteudo.** Preencher 809 celulas a mao seria trabalho perdido, entao a leva
comecou por dois scripts, separados de proposito porque tem naturezas diferentes:

- `harvest-fish-params.ts` coleta em fonte publica e guarda em cache. Seriously Fish primeiro,
  FishBase depois. A ordem nao e detalhe: o FishBase publica a faixa climatica do habitat, e o
  Kinguio aparece la como 0 a 41 graus. Verdade sobre o lago, conselho pessimo sobre o aquario.
- `apply-fish-params.ts` grava no formato do ADR 0001, so em campo vazio, e o padrao e simular. Quem
  aplica nunca vai a rede, entao o diff e reproduzivel.

**Quatro correcoes de leitura da fonte** foram necessarias antes dos numeros ficarem confiaveis, e
cada uma tinha sintoma proprio:
1. O bloco de tamanho invadia a secao seguinte e o Midas saiu com 150 cm, medida do movel, nao do
   peixe.
2. A linha de pH as vezes e prosa sobre populacao selvagem em reproducao, e o Apistogramma agassizii
   saiu com pH 3 a 4. Passou a valer so linha que comeca em digito, e o resto cai para o FishBase.
3. Duas geracoes de pagina convivem no Seriously Fish, uma em Celsius e outra em Fahrenheit com o
   Celsius entre parenteses. A segunda estava sendo descartada inteira.
4. O menu de navegacao repete os titulos das secoes em caixa alta, e a extracao das secoes
   narrativas estava capturando o menu. Virou busca sensivel a maiuscula.

**Nove nomes cientificos com o epiteto em maiuscula** apareceram porque a busca falhava neles
("Hyphessobrycon Amandae"). Alem de errado pela regra de nomenclatura, o erro escondia a especie das
duas bases. Corrigidos; a URL da ficha e por id, entao nada quebrou.

**Resultado dos parametros.** origem, pH, GH, KH, temperatura, tamanho adulto e posicao no aquario
estao em 100% das 244 fichas. As 70 origens foram escritas em portugues a mao, a partir da
distribuicao colhida, e vivem em `scripts/origens-pt.json`.

**Piloto de voz.** `voz.md` responde o que a task 11 pedia e o lote 01 traz 20 fichas com os cinco
campos narrativos escritos do zero, 95 celulas. O texto sai do fato colhido e nunca da traducao do
paragrafo da fonte, por duas razoes que se somam: copiaria texto de outra pessoa e traria de volta o
registro de laudo que a frente esta tirando.

**A `fonte` estava vazando anotacao de derivacao.** So apareceu ao abrir a pagina no navegador: o
campo, que o leitor ve rotulado "Fonte", saiu como "Seriously Fish e derivado da dureza (Seriously
Fish) e FishBase". Agora e lista de referencia, a derivacao ficou no relatorio do script, e 136
fichas foram normalizadas.

## Decisoes

- **KH nao tem fonte por especie e passa a ser derivado da dureza**, em banda larga, com a `fonte`
  citando a referencia de onde veio a dureza. Nem Seriously Fish nem FishBase publicam KH. A
  alternativa honesta e tornar `kh` opcional em agua doce, pelo mesmo argumento que ja tirou o campo
  do marinho (quem controla e o sistema, nao a especie). Fica registrada para o Daniel decidir.
- **Dez especies sem dureza publicada tiveram o GH deduzido do perfil de pH.** Ciclideo de lago
  africano em agua dura, Pangio de agua preta em agua mole. Banda larga de proposito.
- **Variedade de aquarismo herda a origem da especie.** "Danio rerio var. gold" e um Danio rerio
  selecionado em cativeiro, e duplicar a entrada faria os dois sairem do lugar quando um fosse
  corrigido.
- **Entrada de comercio no nivel do genero herda do congenere do proprio acervo.** "Corydoras spp."
  quer a mesma agua que o "Corydoras aeneus" que ja esta la.

## O que ficou aberto

- **O lote 01 precisa da revisao do Daniel.** E o bloqueio da task 11, e ele segura as outras 71
  fichas de texto.
- **Tres fichas de agua doce sao duplicata**, invisiveis ao validador porque ele compara o nome
  cientifico como texto cru: 177 Kinguio contra 25 Kinguio (`Carassius auratus` e `Carassius auratus
  auratus`), 178 Espadinha contra 176 Espada (`hellerii` e `helleri`), 205 Microrasbora Galaxy contra
  50 Rasbora Galaxy (`Celestichthys` e `Danio margaritatus`). Fundir apaga rota, mexe no sitemap e nas
  quatro traducoes, entao e decisao do Daniel, com o precedente da task 3.
- **`Trichogaster leerii` (163) e `Trichopodus leeri` (237) sao a mesma especie** sob nomes
  diferentes, e as duas fichas existem. Mesmo caso.
