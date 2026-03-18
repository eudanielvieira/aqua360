import { writeFileSync } from 'fs'
import { join } from 'path'

const OUTPUT = join(__dirname, '../src/data/corals.ts')
const DELAY_MS = 600

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJSON(url: string): Promise<any> {
  const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!response.ok) return null
  return response.json()
}

async function enrichSpecies(name: string) {
  const gbif = await fetchJSON(
    `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}&strict=true`
  )
  await sleep(DELAY_MS)

  const inat = await fetchJSON(
    `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(name)}&per_page=3&quality_grade=research&photos=true&order=desc&order_by=votes`
  )
  await sleep(DELAY_MS)

  const photos: string[] = []
  if (inat?.results) {
    for (const obs of inat.results) {
      if (obs.photos?.[0]?.url) {
        photos.push(obs.photos[0].url.replace('square', 'medium'))
      }
    }
  }

  const enrichment: any = { enrichedAt: new Date().toISOString() }

  if (gbif?.usageKey) {
    enrichment.gbifTaxonKey = gbif.usageKey
    enrichment.taxonomia = {
      reino: gbif.kingdom || '',
      filo: gbif.phylum || '',
      classe: gbif.class || '',
      ordem: gbif.order || '',
      familia: gbif.family || '',
      genero: gbif.genus || '',
      especie: gbif.species || '',
    }
  }

  if (photos.length > 0) enrichment.inatPhotoUrls = photos.slice(0, 3)

  return Object.keys(enrichment).length > 1 ? enrichment : undefined
}

interface CoralEntry {
  nomePopular: string
  nomeCientifico: string
  outrosNome: string
  familia: string
  origem: string
  categoria: string
  iluminacao: string
  fluxoAgua: string
  dificuldade: string
  alimentacao: string
  compatibilidade: string
  crescimento: string
  coloracao: string
  descricao: string
}

const corals: CoralEntry[] = [
  // Corais Moles
  {
    nomePopular: "Zoanthus",
    nomeCientifico: "Zoanthus sp.",
    outrosNome: "Zoas, Button Polyps",
    familia: "Zoanthidae",
    origem: "Indo-Pacifico, Caribe",
    categoria: "mole",
    iluminacao: "Moderada a alta",
    fluxoAgua: "Moderado",
    dificuldade: "Facil",
    alimentacao: "Fotossintetico, aceita fitoplancton",
    compatibilidade: "Pacifico, pode ser toxico para outros corais por contato",
    crescimento: "Rapido",
    coloracao: "Extremamente variada: verde, laranja, vermelho, azul, rosa, multicolorido",
    descricao: "Um dos corais mais populares no aquarismo marinho pela incrivel variedade de cores e padroes. Formam colonias de polipos circulares. Sao resistentes e otimos para iniciantes. Atencao: algumas especies contem palitoxina, uma toxina potente - nunca manusear sem protecao."
  },
  {
    nomePopular: "Palythoa",
    nomeCientifico: "Palythoa sp.",
    outrosNome: "Paly, Sea Mat",
    familia: "Sphenopidae",
    origem: "Indo-Pacifico, Caribe, Atlantico",
    categoria: "mole",
    iluminacao: "Moderada",
    fluxoAgua: "Moderado",
    dificuldade: "Facil",
    alimentacao: "Fotossintetico, aceita fitoplancton e zooplancton",
    compatibilidade: "Pode ser agressivo, libera toxinas",
    crescimento: "Rapido",
    coloracao: "Marrom, verde, amarelo, com centro contrastante",
    descricao: "Similar aos Zoanthus porem geralmente maiores. Formam tapetes densos de polipos. Extremamente resistentes e de facil manutencao. Contém palitoxina - manusear sempre com luvas."
  },
  {
    nomePopular: "Discosoma",
    nomeCientifico: "Discosoma sp.",
    outrosNome: "Mushroom Coral, Cogumelo",
    familia: "Discosomidae",
    origem: "Indo-Pacifico, Caribe",
    categoria: "mole",
    iluminacao: "Baixa a moderada",
    fluxoAgua: "Baixo a moderado",
    dificuldade: "Facil",
    alimentacao: "Fotossintetico, aceita alimentos particulados",
    compatibilidade: "Pacifico, mas pode cobrir corais vizinhos",
    crescimento: "Moderado",
    coloracao: "Verde, azul, vermelho, roxo, rajado",
    descricao: "Corais em formato de disco/cogumelo, ideais para areas de menor iluminacao no aquario. Muito resistentes e de facil propagacao. Excelente opcao para iniciantes no aquarismo marinho."
  },
  {
    nomePopular: "Ricordea",
    nomeCientifico: "Ricordea florida",
    outrosNome: "Flower Mushroom",
    familia: "Ricordeidae",
    origem: "Caribe, Florida",
    categoria: "mole",
    iluminacao: "Moderada",
    fluxoAgua: "Baixo a moderado",
    dificuldade: "Facil",
    alimentacao: "Fotossintetico, aceita alimentos particulados",
    compatibilidade: "Pacifico",
    crescimento: "Lento a moderado",
    coloracao: "Verde, laranja, azul, rosa, multicolorido",
    descricao: "Um dos coralimorfos mais coloridos e desejados. Tentaculos com pontas arredondadas que lembram bolhas. Variedades raras com multiplas cores sao muito valorizadas no hobby."
  },
  {
    nomePopular: "Xenia",
    nomeCientifico: "Xenia sp.",
    outrosNome: "Pulsing Xenia, Xenia Pulsante",
    familia: "Xeniidae",
    origem: "Indo-Pacifico, Mar Vermelho",
    categoria: "mole",
    iluminacao: "Moderada a alta",
    fluxoAgua: "Moderado",
    dificuldade: "Facil",
    alimentacao: "Fotossintetico",
    compatibilidade: "Pacifico, mas pode se espalhar rapidamente",
    crescimento: "Muito rapido",
    coloracao: "Branco, rosa, creme",
    descricao: "Famoso pelo movimento pulsante de seus polipos, que se abrem e fecham ritmicamente. Cresce muito rapido e pode se tornar invasivo se nao controlado. Visual hipnotizante no aquario."
  },
  {
    nomePopular: "Sarcophyton (Coral Couro)",
    nomeCientifico: "Sarcophyton sp.",
    outrosNome: "Leather Coral, Toadstool",
    familia: "Alcyoniidae",
    origem: "Indo-Pacifico",
    categoria: "mole",
    iluminacao: "Moderada a alta",
    fluxoAgua: "Moderado a forte",
    dificuldade: "Facil",
    alimentacao: "Fotossintetico, aceita fitoplancton",
    compatibilidade: "Pode liberar terpenoides que inibem outros corais",
    crescimento: "Moderado",
    coloracao: "Creme, verde, amarelo",
    descricao: "Coral em formato de cogumelo grande com polipos retrateis na superficie. Muito resistente e de facil manutencao. Pode atingir tamanhos consideraveis. Periodicamente retrai seus polipos e troca a camada externa de mucosa."
  },
  {
    nomePopular: "Sinularia",
    nomeCientifico: "Sinularia sp.",
    outrosNome: "Finger Leather Coral",
    familia: "Alcyoniidae",
    origem: "Indo-Pacifico",
    categoria: "mole",
    iluminacao: "Moderada a alta",
    fluxoAgua: "Moderado",
    dificuldade: "Facil",
    alimentacao: "Fotossintetico",
    compatibilidade: "Pode liberar toxinas quimicas",
    crescimento: "Moderado",
    coloracao: "Creme, verde claro, rosa",
    descricao: "Coral mole com ramificacoes que lembram dedos. Resistente e de facil manutencao. Forma colonias bonitas e volumosas que dao movimento ao aquario."
  },
  // Corais Duros LPS
  {
    nomePopular: "Euphyllia (Hammer/Torch)",
    nomeCientifico: "Euphyllia ancora",
    outrosNome: "Hammer Coral, Anchor Coral",
    familia: "Euphylliidae",
    origem: "Indo-Pacifico",
    categoria: "duro-lps",
    iluminacao: "Moderada",
    fluxoAgua: "Moderado",
    dificuldade: "Moderada",
    alimentacao: "Fotossintetico, aceita mysis e artemia",
    compatibilidade: "Tentaculos podem queimar corais vizinhos",
    crescimento: "Moderado",
    coloracao: "Verde, dourado, roxo com pontas contrastantes",
    descricao: "Um dos LPS mais populares, com tentaculos longos terminados em formato de martelo ou ancora. Movimentam-se com a corrente criando um visual elegante. Necessitam de espaco pois seus tentaculos se estendem bastante."
  },
  {
    nomePopular: "Euphyllia Torch",
    nomeCientifico: "Euphyllia glabrescens",
    outrosNome: "Torch Coral",
    familia: "Euphylliidae",
    origem: "Indo-Pacifico",
    categoria: "duro-lps",
    iluminacao: "Moderada",
    fluxoAgua: "Moderado",
    dificuldade: "Moderada",
    alimentacao: "Fotossintetico, aceita mysis e artemia",
    compatibilidade: "Tentaculos urticantes, manter distancia de outros corais",
    crescimento: "Moderado",
    coloracao: "Verde, dourado com pontas claras ou coloridas",
    descricao: "Tentaculos longos com pontas arredondadas que lembram tochas. Visual impactante especialmente sob iluminacao actinica. Peixes-palhaco podem adota-lo como hospedeiro alternativo a anemonas."
  },
  {
    nomePopular: "Favia / Favites",
    nomeCientifico: "Dipsastraea sp.",
    outrosNome: "Brain Coral, Coral Cerebro",
    familia: "Merulinidae",
    origem: "Indo-Pacifico, Caribe",
    categoria: "duro-lps",
    iluminacao: "Moderada",
    fluxoAgua: "Baixo a moderado",
    dificuldade: "Facil a moderada",
    alimentacao: "Fotossintetico, aceita mysis e alimentos particulados",
    compatibilidade: "Pode estender tentaculos agressores a noite",
    crescimento: "Lento",
    coloracao: "Verde, vermelho, laranja, multicolorido",
    descricao: "Corais cerebro com padroes de cores variados e fascinantes. Formam esqueletos massivos com polipos arredondados. A noite, estendem tentaculos para capturar alimentos. Relativamente faceis de manter."
  },
  {
    nomePopular: "Acanthastrea (Acan)",
    nomeCientifico: "Acanthastrea echinata",
    outrosNome: "Acan Lord",
    familia: "Lobophylliidae",
    origem: "Indo-Pacifico, Australia",
    categoria: "duro-lps",
    iluminacao: "Baixa a moderada",
    fluxoAgua: "Baixo a moderado",
    dificuldade: "Facil a moderada",
    alimentacao: "Fotossintetico, aceita mysis e alimentos carneos",
    compatibilidade: "Pode ser agressivo com corais vizinhos",
    crescimento: "Lento a moderado",
    coloracao: "Extremamente variada: vermelho, verde, laranja, azul, multicolorido",
    descricao: "Altamente valorizado pela diversidade de cores e padroes. Polipos grandes e carnudos que se expandem significativamente quando bem alimentados. Variedades raras atingem altos precos no mercado."
  },
  {
    nomePopular: "Goniopora",
    nomeCientifico: "Goniopora sp.",
    outrosNome: "Flowerpot Coral, Coral Margarida",
    familia: "Poritidae",
    origem: "Indo-Pacifico",
    categoria: "duro-lps",
    iluminacao: "Moderada",
    fluxoAgua: "Moderado",
    dificuldade: "Dificil",
    alimentacao: "Fotossintetico, necessita alimentacao complementar regular",
    compatibilidade: "Pacifico",
    crescimento: "Lento",
    coloracao: "Verde, rosa, vermelho, roxo",
    descricao: "Coral com polipos longos e floridos que criam um visual de jardim subaquatico. Historicamente dificil de manter em aquario, mas tecnicas modernas melhoraram as taxas de sucesso. Necessita alimentacao regular e parametros estaveis."
  },
  // Corais Duros SPS
  {
    nomePopular: "Acropora",
    nomeCientifico: "Acropora sp.",
    outrosNome: "Staghorn Coral",
    familia: "Acroporidae",
    origem: "Indo-Pacifico, Caribe",
    categoria: "duro-sps",
    iluminacao: "Alta",
    fluxoAgua: "Forte",
    dificuldade: "Dificil",
    alimentacao: "Fotossintetico, aceita aminoacidos e fitoplancton",
    compatibilidade: "Sensivel a agressao quimica de outros corais",
    crescimento: "Rapido (para SPS)",
    coloracao: "Extremamente variada: azul, roxo, verde, rosa, creme",
    descricao: "O genero mais iconico dos corais SPS. Forma ramificacoes elaboradas e coloridas. Exige parametros de agua extremamente estaveis, iluminacao forte e fluxo intenso. Recomendado para aquaristas experientes."
  },
  {
    nomePopular: "Montipora",
    nomeCientifico: "Montipora sp.",
    outrosNome: "Monti, Plating Coral",
    familia: "Acroporidae",
    origem: "Indo-Pacifico",
    categoria: "duro-sps",
    iluminacao: "Moderada a alta",
    fluxoAgua: "Moderado a forte",
    dificuldade: "Moderada",
    alimentacao: "Fotossintetico",
    compatibilidade: "Pacifico, pode ser encrostante",
    crescimento: "Moderado a rapido",
    coloracao: "Verde, roxo, laranja, vermelho, azul",
    descricao: "Segundo genero mais popular de SPS. Algumas especies formam placas, outras ramificacoes. Geralmente mais tolerante que Acropora, sendo uma boa porta de entrada para o mundo dos SPS."
  },
  {
    nomePopular: "Stylophora",
    nomeCientifico: "Stylophora pistillata",
    outrosNome: "Cat's Paw, Bird's Nest",
    familia: "Pocilloporidae",
    origem: "Indo-Pacifico, Mar Vermelho",
    categoria: "duro-sps",
    iluminacao: "Moderada a alta",
    fluxoAgua: "Moderado a forte",
    dificuldade: "Moderada",
    alimentacao: "Fotossintetico, aceita fitoplancton",
    compatibilidade: "Pacifico",
    crescimento: "Moderado",
    coloracao: "Rosa, verde, roxo, creme",
    descricao: "Forma ramificacoes densas com pontas arredondadas. Um dos SPS mais resistentes, sendo recomendado como primeiro SPS para aquaristas em transicao. Cresce bem e forma colonias bonitas."
  },
  {
    nomePopular: "Pocillopora",
    nomeCientifico: "Pocillopora damicornis",
    outrosNome: "Cauliflower Coral",
    familia: "Pocilloporidae",
    origem: "Indo-Pacifico",
    categoria: "duro-sps",
    iluminacao: "Moderada a alta",
    fluxoAgua: "Moderado a forte",
    dificuldade: "Moderada",
    alimentacao: "Fotossintetico",
    compatibilidade: "Pacifico, pode hospedar caranguejos simbioticos",
    crescimento: "Rapido",
    coloracao: "Rosa, verde, creme",
    descricao: "Coral ramificado com aspecto de couve-flor. Um dos SPS de crescimento mais rapido e mais faceis de manter. Frequentemente hospeda pequenos caranguejos que ajudam a limpar detritos."
  },
  // Anemonas
  {
    nomePopular: "Anemona Bolha",
    nomeCientifico: "Entacmaea quadricolor",
    outrosNome: "Bubble Tip Anemone, BTA",
    familia: "Actiniidae",
    origem: "Indo-Pacifico, Mar Vermelho",
    categoria: "anemona",
    iluminacao: "Moderada a alta",
    fluxoAgua: "Moderado",
    dificuldade: "Moderada",
    alimentacao: "Fotossintetico, aceita mysis, krill e pedacos de camarao",
    compatibilidade: "Pode se mover e queimar corais vizinhos",
    crescimento: "Moderado, se reproduz por divisao",
    coloracao: "Verde, vermelho, rose, rainbow",
    descricao: "A anemona mais popular no aquarismo marinho e a mais aceita por peixes-palhaco em cativeiro. Tentaculos com pontas em formato de bolha (em condicoes ideais). Pode se reproduzir por divisao assexuada no aquario."
  },
  {
    nomePopular: "Anemona Carpete",
    nomeCientifico: "Stichodactyla haddoni",
    outrosNome: "Haddon's Carpet Anemone",
    familia: "Stichodactylidae",
    origem: "Indo-Pacifico",
    categoria: "anemona",
    iluminacao: "Alta",
    fluxoAgua: "Moderado",
    dificuldade: "Dificil",
    alimentacao: "Fotossintetico, aceita pedacos de peixe e camarao",
    compatibilidade: "Altamente urticante, pode capturar peixes pequenos",
    crescimento: "Lento",
    coloracao: "Verde, azul, roxo, creme",
    descricao: "Anemona de grande porte com tentaculos curtos e densos que formam um tapete. Altamente urticante - pode capturar e consumir peixes desavisados. Necessita substrato arenoso para fixacao. Apenas para aquaristas experientes."
  },
  {
    nomePopular: "Anemona Magnifica",
    nomeCientifico: "Heteractis magnifica",
    outrosNome: "Magnificent Sea Anemone, Ritteri",
    familia: "Stichodactylidae",
    origem: "Indo-Pacifico",
    categoria: "anemona",
    iluminacao: "Alta",
    fluxoAgua: "Moderado a forte",
    dificuldade: "Dificil",
    alimentacao: "Fotossintetico, aceita mysis, krill e pedacos de camarao",
    compatibilidade: "Pode se mover, altamente urticante",
    crescimento: "Lento",
    coloracao: "Roxo, azul, verde com base laranja ou branca",
    descricao: "Uma das anemonas mais bonitas e desejadas, mas tambem uma das mais dificeis de manter. Pode atingir mais de 50 cm de diametro. Hospedeiro natural de varias especies de peixes-palhaco. Exige parametros de agua impecaveis e iluminacao intensa."
  },
]

async function main() {
  console.log('Importando corais com enriquecimento...\n')

  const results: any[] = []
  let id = 1

  for (const coral of corals) {
    console.log(`  ${coral.nomePopular} (${coral.nomeCientifico})`)
    const enrichment = await enrichSpecies(coral.nomeCientifico)

    results.push({
      id: id++,
      ...coral,
      enrichment: enrichment || undefined,
    })
  }

  const content = `import type { Coral } from '../types'\n\nconst data: Coral[] = ${JSON.stringify(results, null, 2)}\n\nexport default data\n`
  writeFileSync(OUTPUT, content)

  const enriched = results.filter(r => r.enrichment).length
  console.log(`\n--- Resumo ---`)
  console.log(`  Total: ${results.length} corais`)
  console.log(`  Enriquecidos: ${enriched}`)
}

main().catch(console.error)
