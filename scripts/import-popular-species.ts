import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(__dirname, '../src/data')
const DELAY_MS = 500

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJSON(url: string): Promise<any> {
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}

async function getEnrichment(name: string) {
  const gbif = await fetchJSON(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}&strict=true`)
  await sleep(DELAY_MS)
  const inat = await fetchJSON(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(name)}&per_page=3&quality_grade=research&photos=true&order=desc&order_by=votes`)
  await sleep(DELAY_MS)

  const enrichment: any = { enrichedAt: new Date().toISOString() }
  if (gbif?.usageKey) {
    enrichment.gbifTaxonKey = gbif.usageKey
    enrichment.taxonomia = {
      reino: gbif.kingdom || '', filo: gbif.phylum || '', classe: gbif.class || '',
      ordem: gbif.order || '', familia: gbif.family || '', genero: gbif.genus || '', especie: gbif.species || '',
    }
  }
  const photos: string[] = []
  if (inat?.results) {
    for (const obs of inat.results) {
      if (obs.photos?.[0]?.url) photos.push(obs.photos[0].url.replace('square', 'medium'))
    }
  }
  if (photos.length > 0) enrichment.inatPhotoUrls = photos.slice(0, 3)
  return Object.keys(enrichment).length > 1 ? enrichment : undefined
}

function extractRecords(filePath: string): any[] {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/const data: (?:Fish|Plant|Coral)\[\] = (\[[\s\S]*?\])\n\nexport/)
  if (!match) return []
  return JSON.parse(match[1])
}

function writeRecords(filePath: string, records: any[], typeName: string) {
  writeFileSync(filePath, `import type { ${typeName} } from '../types'\n\nconst data: ${typeName}[] = ${JSON.stringify(records, null, 2)}\n\nexport default data\n`)
}

function getExistingNames(records: any[]): Set<string> {
  const names = new Set<string>()
  for (const r of records) {
    if (r.nomeCientifico) names.add(r.nomeCientifico.toLowerCase())
    if (r.nomePopular) names.add(r.nomePopular.toLowerCase())
  }
  return names
}

// ====== PEIXES POPULARES COM TAMANHO DE AQUARIO ======
const popularFish = [
  // Nano/pequenos (ate 20L)
  { nomePopular: 'Betta Fêmea', nomeCientifico: 'Betta splendens', familia: 'Osphronemidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '5 cm', ph: '6.0 a 7.5', temperatura: '24 a 28 ºC', comportamento: 'Pacífico (fêmeas podem viver em grupo). Menos agressivo que o macho.', alimentacao: 'Onívoro, aceita rações, artêmias e bloodworms.', outrasInformacoes: 'Aquário mínimo: 10 litros. Fêmeas podem conviver em grupos de 5+ em aquários de 40L+.', posicaoAquario: 'Todo o Aquário' },
  { nomePopular: 'Killifish Gardneri', nomeCientifico: 'Fundulopanchax gardneri', familia: 'Nothobranchiidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '6 cm', ph: '6.0 a 7.0', temperatura: '22 a 26 ºC', comportamento: 'Pacífico, pode ser mantido em casais.', alimentacao: 'Carnívoro, prefere alimentos vivos.', outrasInformacoes: 'Aquário mínimo: 20 litros. Excelente para nano aquários.', posicaoAquario: 'Meio do Aquário' },
  { nomePopular: 'Microrasbora Galaxy', nomeCientifico: 'Celestichthys margaritatus', familia: 'Cyprinidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '2 cm', ph: '6.5 a 7.5', temperatura: '20 a 26 ºC', comportamento: 'Pacífico, vive em cardume de 8+.', alimentacao: 'Onívoro, aceita micro rações e artêmias.', outrasInformacoes: 'Aquário mínimo: 15 litros. Um dos menores peixes de aquário.', posicaoAquario: 'Meio do Aquário' },

  // Pequenos (20-60L)
  { nomePopular: 'Molinésia Negra', nomeCientifico: 'Poecilia sphenops var. black', familia: 'Poeciliidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '8 cm', ph: '7.0 a 8.5', temperatura: '24 a 28 ºC', comportamento: 'Pacífico, vivíparo, reproduz facilmente.', alimentacao: 'Onívoro com tendência herbívora, come algas.', outrasInformacoes: 'Aquário mínimo: 40 litros. Tolera água levemente salobra.', posicaoAquario: 'Todo o Aquário' },
  { nomePopular: 'Molinésia Balão', nomeCientifico: 'Poecilia latipinna var. balloon', familia: 'Poeciliidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '6 cm', ph: '7.0 a 8.5', temperatura: '24 a 28 ºC', comportamento: 'Pacífico, corpo arredondado por seleção genética.', alimentacao: 'Onívoro, aceita rações e algas.', outrasInformacoes: 'Aquário mínimo: 40 litros. Variação ornamental da Molinésia.', posicaoAquario: 'Todo o Aquário' },
  { nomePopular: 'Colisa Lalia', nomeCientifico: 'Trichogaster lalius', familia: 'Osphronemidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '5 cm', ph: '6.0 a 7.5', temperatura: '24 a 28 ºC', comportamento: 'Pacífico mas tímido. Machos podem ser territoriais entre si.', alimentacao: 'Onívoro, aceita rações, artêmias e dáfnias.', outrasInformacoes: 'Aquário mínimo: 30 litros. Cores vibrantes em vermelho e azul.', posicaoAquario: 'Meio do Aquário' },
  { nomePopular: 'Limpa-vidro', nomeCientifico: 'Otocinclus vittatus', familia: 'Loricariidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '4 cm', ph: '6.0 a 7.5', temperatura: '22 a 28 ºC', comportamento: 'Pacífico, vive em grupo de 5+. Excelente comedor de algas.', alimentacao: 'Herbívoro, alimenta-se de algas e biofilme.', outrasInformacoes: 'Aquário mínimo: 30 litros. O melhor peixe para controle de algas em aquários plantados.', posicaoAquario: 'Vidros e superfícies' },

  // Médios (60-200L)
  { nomePopular: 'Acará Bandeira Koi', nomeCientifico: 'Pterophyllum scalare var. koi', familia: 'Cichlidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '15 cm', ph: '6.0 a 7.5', temperatura: '24 a 28 ºC', comportamento: 'Semi-agressivo na reprodução, pacífico em comunitários.', alimentacao: 'Onívoro, aceita rações, artêmias e pequenos peixes.', outrasInformacoes: 'Aquário mínimo: 100 litros. Variação ornamental com cores branca e laranja.', posicaoAquario: 'Meio do Aquário' },
  { nomePopular: 'Ciclídeo Papagaio', nomeCientifico: 'Hybrid (Blood Parrot)', familia: 'Cichlidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '20 cm', ph: '6.5 a 7.5', temperatura: '24 a 28 ºC', comportamento: 'Semi-agressivo, territorial mas não predador. Interativo com o dono.', alimentacao: 'Onívoro, aceita rações, camarões e frutas.', outrasInformacoes: 'Aquário mínimo: 150 litros. Híbrido ornamental, cores vibrantes. Considerado pet fish.', posicaoAquario: 'Todo o Aquário' },
  { nomePopular: 'Tetra Diamante', nomeCientifico: 'Moenkhausia pittieri', familia: 'Characidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '6 cm', ph: '6.0 a 7.0', temperatura: '24 a 28 ºC', comportamento: 'Pacífico, vive em cardume de 8+.', alimentacao: 'Onívoro, aceita rações e alimentos vivos.', outrasInformacoes: 'Aquário mínimo: 60 litros. Escamas brilhantes que refletem a luz.', posicaoAquario: 'Meio do Aquário' },
  { nomePopular: 'Peixe Arco-Íris Boesemani', nomeCientifico: 'Melanotaenia boesemani', familia: 'Melanotaeniidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '10 cm', ph: '7.0 a 8.0', temperatura: '24 a 28 ºC', comportamento: 'Pacífico, ativo, vive em cardume de 6+.', alimentacao: 'Onívoro, aceita todos os tipos de alimentos.', outrasInformacoes: 'Aquário mínimo: 100 litros. Cores azul e laranja deslumbrantes nos machos.', posicaoAquario: 'Meio do Aquário' },

  // Grandes (200L+)
  { nomePopular: 'Aruanã Prata', nomeCientifico: 'Osteoglossum bicirrhosum', familia: 'Osteoglossidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '100 cm', ph: '6.0 a 7.0', temperatura: '24 a 28 ºC', comportamento: 'Predador de superfície. Salta fora do aquário se não tiver tampa. Reconhece o dono.', alimentacao: 'Carnívoro, aceita peixes vivos, camarões, insetos e rações.', outrasInformacoes: 'Aquário mínimo: 1000 litros (jumbo). Um dos peixes mais majestosos do aquarismo. Pet fish que come na mão.', posicaoAquario: 'Superfície' },
  { nomePopular: 'Pirarucu', nomeCientifico: 'Arapaima gigas', familia: 'Arapaimidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '300 cm', ph: '6.0 a 7.5', temperatura: '24 a 28 ºC', comportamento: 'Predador imponente. Respira ar atmosférico. Necessita tampa reforçada.', alimentacao: 'Carnívoro, aceita peixes, camarões e rações para grandes peixes.', outrasInformacoes: 'Aquário mínimo: 5000 litros (tanque). Maior peixe de água doce da América do Sul. Proibido em alguns estados.', posicaoAquario: 'Todo o Aquário' },
  { nomePopular: 'Arraia Motoro', nomeCientifico: 'Potamotrygon motoro', familia: 'Potamotrygonidae', tipo: 'PEIXESDULCICOLAS', tamanhoAdulto: '50 cm (disco)', ph: '6.0 a 7.0', temperatura: '24 a 28 ºC', comportamento: 'Calmo mas possui ferrão venenoso na cauda. Necessita substrato de areia fina.', alimentacao: 'Carnívoro, aceita camarões, minhocas, peixes e rações.', outrasInformacoes: 'Aquário mínimo: 500 litros. Necessita licença do IBAMA em alguns estados.', posicaoAquario: 'Fundo do Aquário' },
  { nomePopular: 'Peixe Palhaço Tomate', nomeCientifico: 'Amphiprion frenatus', familia: 'Pomacentridae', tipo: 'PEIXESMARINHOS', tamanhoAdulto: '12 cm', ph: '8.0 a 8.4', temperatura: '24 a 27 ºC', comportamento: 'Semi-agressivo, territorial com sua anêmona. Vive em par.', alimentacao: 'Onívoro, aceita rações, artêmias e mysis.', outrasInformacoes: 'Aquário mínimo: 100 litros. Forma simbiose com anêmonas.', posicaoAquario: 'Meio do Aquário' },
]

// ====== PLANTAS ORNAMENTAIS ======
const ornamentalPlants = [
  { nomePopular: 'Espada Amazônica', nomeCientifico: 'Echinodorus amazonicus', familia: 'Alismataceae', ph: '6.0 a 8.0', temperatura: '20 a 28 ºC', dificuldade: 'Fácil', iluminacao: '0.5 Watts/Litro', crescimento: 'Rápido', posicao: 'Fundo', descExtra: 'Uma das plantas mais populares do aquarismo. Folhas longas e verdes.'},
  { nomePopular: 'Elódea', nomeCientifico: 'Egeria densa', familia: 'Hydrocharitaceae', ph: '5.0 a 9.0', temperatura: '10 a 28 ºC', dificuldade: 'Muito fácil', iluminacao: '0.3 Watts/Litro', crescimento: 'Muito rápido', posicao: 'Fundo', descExtra: 'Planta oxigenadora ideal para iniciantes. Cresce em qualquer condição.'},
  { nomePopular: 'Lentilha d\'Água', nomeCientifico: 'Lemna minor', familia: 'Araceae', ph: '5.0 a 8.0', temperatura: '10 a 30 ºC', dificuldade: 'Muito fácil', iluminacao: '0.2 Watts/Litro', crescimento: 'Explosivo', posicao: 'Superfície', descExtra: 'Planta flutuante que cobre a superfície rapidamente. Alimento natural para peixes herbívoros.'},
  { nomePopular: 'Pistia (Alface d\'Água)', nomeCientifico: 'Pistia stratiotes', familia: 'Araceae', ph: '6.0 a 7.5', temperatura: '22 a 30 ºC', dificuldade: 'Fácil', iluminacao: 'Alta', crescimento: 'Rápido', posicao: 'Superfície', descExtra: 'Planta flutuante decorativa com raízes que servem de abrigo para alevinos.'},
  { nomePopular: 'Vitória-Régia (mini)', nomeCientifico: 'Nymphaea gardneriana', familia: 'Nymphaeaceae', ph: '6.0 a 7.5', temperatura: '22 a 30 ºC', dificuldade: 'Moderada', iluminacao: 'Alta', crescimento: 'Moderado', posicao: 'Superfície', descExtra: 'Versão menor da Vitória-Régia amazônica. Folhas flutuantes ornamentais.'},
  { nomePopular: 'Musgo Christmas', nomeCientifico: 'Vesicularia montagnei', familia: 'Hypnaceae', ph: '5.5 a 7.5', temperatura: '20 a 28 ºC', dificuldade: 'Fácil', iluminacao: '0.3 Watts/Litro', crescimento: 'Lento', posicao: 'Decoração', descExtra: 'Musgo que cresce em formato de árvore de Natal. Ótimo para hardscape.'},
  { nomePopular: 'Monte Carlo', nomeCientifico: 'Micranthemum tweediei', familia: 'Linderniaceae', ph: '6.0 a 7.5', temperatura: '20 a 28 ºC', dificuldade: 'Moderada', iluminacao: '0.8 Watts/Litro', crescimento: 'Moderado', posicao: 'Frente (carpete)', descExtra: 'Forma tapete verde denso. Alternativa mais fácil que a HC Cuba.'},
  { nomePopular: 'Samambaia de Sumatra', nomeCientifico: 'Ceratopteris thalictroides', familia: 'Pteridaceae', ph: '6.0 a 8.0', temperatura: '22 a 28 ºC', dificuldade: 'Fácil', iluminacao: '0.5 Watts/Litro', crescimento: 'Rápido', posicao: 'Meio/Flutuante', descExtra: 'Pode ser plantada ou deixada flutuando. Produz mudas nas folhas.'},
  { nomePopular: 'Lotus Tigre', nomeCientifico: 'Nymphaea lotus', familia: 'Nymphaeaceae', ph: '5.5 a 7.5', temperatura: '22 a 28 ºC', dificuldade: 'Fácil', iluminacao: '0.5 Watts/Litro', crescimento: 'Rápido', posicao: 'Meio', descExtra: 'Folhas vermelhas/marrons com manchas. Uma das plantas mais ornamentais.'},
  { nomePopular: 'Planta Espada Rubin', nomeCientifico: 'Echinodorus barthii', familia: 'Alismataceae', ph: '6.0 a 8.0', temperatura: '22 a 28 ºC', dificuldade: 'Fácil', iluminacao: '0.5 Watts/Litro', crescimento: 'Moderado', posicao: 'Meio/Fundo', descExtra: 'Folhas vermelhas intensas. Ponto focal em aquários plantados.'},
]

// ====== CORAIS ORNAMENTAIS EXTRAS ======
const extraCorals = [
  { nomePopular: 'Green Star Polyps (GSP)', nomeCientifico: 'Pachyclavularia violacea', familia: 'Briareidae', categoria: 'mole', iluminacao: 'Moderada', fluxoAgua: 'Moderado', dificuldade: 'Muito fácil', alimentacao: 'Fotossintético', compatibilidade: 'Pode se espalhar e cobrir rochas', crescimento: 'Muito rápido', coloracao: 'Verde fluorescente sobre base púrpura', descricao: 'Um dos corais mais fáceis e resistentes. Tapete verde brilhante que se espalha sobre rochas. Ideal para iniciantes em reef.' },
  { nomePopular: 'Kenya Tree', nomeCientifico: 'Capnella sp.', familia: 'Nephtheidae', categoria: 'mole', iluminacao: 'Baixa a moderada', fluxoAgua: 'Moderado', dificuldade: 'Muito fácil', alimentacao: 'Fotossintético', compatibilidade: 'Pacífico, pode se desprender e colonizar novas áreas', crescimento: 'Rápido', coloracao: 'Marrom, rosa claro', descricao: 'Coral em formato de árvore que se reproduz facilmente soltando fragmentos. Muito resistente.' },
  { nomePopular: 'Hammer Coral (Wall)', nomeCientifico: 'Euphyllia parancora', familia: 'Euphylliidae', categoria: 'duro-lps', iluminacao: 'Moderada', fluxoAgua: 'Moderado', dificuldade: 'Moderada', alimentacao: 'Fotossintético, aceita mysis', compatibilidade: 'Tentáculos podem queimar vizinhos', crescimento: 'Lento', coloracao: 'Verde, dourado com pontas rosa', descricao: 'Versão wall do Hammer com crescimento diferente. Tentáculos em formato de martelo com movimentos hipnóticos.' },
  { nomePopular: 'Duncan Coral', nomeCientifico: 'Duncanopsammia axifuga', familia: 'Dendrophylliidae', categoria: 'duro-lps', iluminacao: 'Baixa a moderada', fluxoAgua: 'Baixo a moderado', dificuldade: 'Fácil', alimentacao: 'Fotossintético, aceita mysis e artêmia', compatibilidade: 'Pacífico', crescimento: 'Moderado', coloracao: 'Verde, rosa, creme', descricao: 'LPS de fácil manutenção com pólipos grandes e bonitos. Se alimenta ativamente quando oferecido comida.' },
  { nomePopular: 'Torch Coral (Gold)', nomeCientifico: 'Euphyllia glabrescens var. gold', familia: 'Euphylliidae', categoria: 'duro-lps', iluminacao: 'Moderada', fluxoAgua: 'Moderado', dificuldade: 'Moderada', alimentacao: 'Fotossintético, aceita mysis', compatibilidade: 'Urticante, manter distância', crescimento: 'Lento', coloracao: 'Dourado intenso com pontas brilhantes', descricao: 'Variação gold muito valorizada. Tentáculos dourados que brilham sob luz actínica.' },
  { nomePopular: 'Pulsing Xenia', nomeCientifico: 'Xenia elongata', familia: 'Xeniidae', categoria: 'mole', iluminacao: 'Moderada', fluxoAgua: 'Moderado', dificuldade: 'Fácil', alimentacao: 'Fotossintético', compatibilidade: 'Pode invadir áreas', crescimento: 'Muito rápido', coloracao: 'Branco, creme, rosa', descricao: 'Versão pulsante da Xenia com movimento rítmico constante. Visual hipnotizante.' },
]

async function main() {
  console.log('Importando espécies populares...\n')

  // PEIXES
  const fishFile = join(DATA_DIR, 'fish-agua-doce.ts')
  const saltFile = join(DATA_DIR, 'fish-agua-salgada.ts')
  const freshRecords = extractRecords(fishFile)
  const saltRecords = extractRecords(saltFile)
  const existingFish = new Set([...getExistingNames(freshRecords), ...getExistingNames(saltRecords)])
  let freshMaxId = freshRecords.reduce((m: number, r: any) => Math.max(m, r.id), 0)
  let saltMaxId = saltRecords.reduce((m: number, r: any) => Math.max(m, r.id), 0)
  let addedFish = 0

  for (const fish of popularFish) {
    if (existingFish.has(fish.nomeCientifico.toLowerCase()) || existingFish.has(fish.nomePopular.toLowerCase())) {
      console.log(`  Peixe existe: ${fish.nomePopular}`)
      continue
    }
    console.log(`  Importando peixe: ${fish.nomePopular}`)
    const enrichment = await getEnrichment(fish.nomeCientifico)
    const record: any = {
      id: fish.tipo === 'PEIXESMARINHOS' ? ++saltMaxId : ++freshMaxId,
      alimentacao: fish.alimentacao || '', caracteristica: '', comportamento: fish.comportamento || '',
      diformismoSexual: '', familia: fish.familia || '', gh: '', imagem: '',
      kh: '', nomeCientifico: fish.nomeCientifico, nomePopular: fish.nomePopular,
      origem: '', outrasInformacoes: fish.outrasInformacoes || '', outrosNome: '',
      ph: fish.ph || '', posicaoAquario: fish.posicaoAquario || '',
      reproducao: '', tamanhoAdulto: fish.tamanhoAdulto || '',
      temperatura: fish.temperatura || '', tipo: fish.tipo, subTipo: '', fonte: '',
      ...(enrichment && { enrichment }),
    }
    if (fish.tipo === 'PEIXESMARINHOS') saltRecords.push(record)
    else freshRecords.push(record)
    addedFish++
  }

  writeRecords(fishFile, freshRecords, 'Fish')
  writeRecords(saltFile, saltRecords, 'Fish')
  console.log(`\n  Peixes adicionados: ${addedFish}`)

  // PLANTAS
  const plantsFile = join(DATA_DIR, 'plants.ts')
  const plantRecords = extractRecords(plantsFile)
  const existingPlants = getExistingNames(plantRecords)
  let plantMaxId = plantRecords.reduce((m: number, r: any) => Math.max(m, r.id), 0)
  let addedPlants = 0

  for (const p of ornamentalPlants) {
    if (existingPlants.has(p.nomeCientifico.toLowerCase()) || existingPlants.has(p.nomePopular.toLowerCase())) {
      console.log(`  Planta existe: ${p.nomePopular}`)
      continue
    }
    console.log(`  Importando planta: ${p.nomePopular}`)
    const enrichment = await getEnrichment(p.nomeCientifico)
    plantRecords.push({
      id: ++plantMaxId, co2: '', crescimento: p.crescimento || '', dificuldade: p.dificuldade || '',
      estrutura: '', familia: p.familia || '', iluminacao: p.iluminacao || '', imagem: '',
      nomeCientifico: p.nomeCientifico, nomePopular: p.nomePopular, origem: '',
      outrosNome: '', ph: p.ph || '', plantio: '', porte: '', posicao: p.posicao || '',
      reproducao: '', substratoFertil: '', suportaEmersao: '', tamanho: '',
      temperatura: p.temperatura || '', fonte: '',
      ...(enrichment && { enrichment }),
    })
    addedPlants++
  }

  writeRecords(plantsFile, plantRecords, 'Plant')
  console.log(`  Plantas adicionadas: ${addedPlants}`)

  // CORAIS
  const coralsFile = join(DATA_DIR, 'corals.ts')
  const coralRecords = extractRecords(coralsFile)
  const existingCorals = getExistingNames(coralRecords)
  let coralMaxId = coralRecords.reduce((m: number, r: any) => Math.max(m, r.id), 0)
  let addedCorals = 0

  for (const c of extraCorals) {
    if (existingCorals.has(c.nomeCientifico.toLowerCase()) || existingCorals.has(c.nomePopular.toLowerCase())) {
      console.log(`  Coral existe: ${c.nomePopular}`)
      continue
    }
    console.log(`  Importando coral: ${c.nomePopular}`)
    const enrichment = await getEnrichment(c.nomeCientifico)
    coralRecords.push({
      id: ++coralMaxId, nomePopular: c.nomePopular, nomeCientifico: c.nomeCientifico,
      outrosNome: '', familia: c.familia || '', origem: '', categoria: c.categoria,
      iluminacao: c.iluminacao || '', fluxoAgua: c.fluxoAgua || '', dificuldade: c.dificuldade || '',
      alimentacao: c.alimentacao || '', compatibilidade: c.compatibilidade || '',
      crescimento: c.crescimento || '', coloracao: c.coloracao || '', descricao: c.descricao || '',
      ...(enrichment && { enrichment }),
    })
    addedCorals++
  }

  writeRecords(coralsFile, coralRecords, 'Coral')
  console.log(`  Corais adicionados: ${addedCorals}`)

  console.log(`\n--- Total adicionado: ${addedFish} peixes, ${addedPlants} plantas, ${addedCorals} corais ---`)
}

main().catch(console.error)
