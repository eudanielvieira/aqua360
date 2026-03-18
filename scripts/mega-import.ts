import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(__dirname, '../src/data')
const DELAY_MS = 400

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
    enrichment.taxonomia = { reino: gbif.kingdom || '', filo: gbif.phylum || '', classe: gbif.class || '', ordem: gbif.order || '', familia: gbif.family || '', genero: gbif.genus || '', especie: gbif.species || '' }
  }
  const photos: string[] = []
  if (inat?.results) for (const obs of inat.results) if (obs.photos?.[0]?.url) photos.push(obs.photos[0].url.replace('square', 'medium'))
  if (photos.length > 0) enrichment.inatPhotoUrls = photos.slice(0, 3)
  return Object.keys(enrichment).length > 1 ? enrichment : undefined
}

function extractRecords(fp: string): any[] {
  const c = readFileSync(fp, 'utf-8')
  const m = c.match(/const data: (?:Fish|Plant|Coral)\[\] = (\[[\s\S]*?\])\n\nexport/)
  return m ? JSON.parse(m[1]) : []
}
function writeRecords(fp: string, records: any[], type: string) {
  writeFileSync(fp, `import type { ${type} } from '../types'\n\nconst data: ${type}[] = ${JSON.stringify(records, null, 2)}\n\nexport default data\n`)
}
function getNames(records: any[]): Set<string> {
  const s = new Set<string>()
  for (const r of records) { if (r.nomeCientifico) s.add(r.nomeCientifico.toLowerCase()); if (r.nomePopular) s.add(r.nomePopular.toLowerCase()) }
  return s
}

// ======================== MEGA LISTA ========================

const freshwaterFish: [string, string, string, string, string, string, string, string][] = [
  // [nomePopular, nomeCientifico, familia, tamanho, ph, temp, comportamento, aquarioMinimo]
  // Tetras e Caracideos
  ['Tetra Cardinal', 'Paracheirodon axelrodi', 'Characidae', '4 cm', '5.0 a 7.0', '24 a 28 ºC', 'Pacífico, cardume de 10+', '40 litros'],
  ['Tetra Rummy Nose', 'Hemigrammus bleheri', 'Characidae', '5 cm', '5.5 a 7.0', '24 a 28 ºC', 'Pacífico, cardume de 8+', '60 litros'],
  ['Tetra Fantasma Negro', 'Hyphessobrycon megalopterus', 'Characidae', '5 cm', '6.0 a 7.5', '22 a 28 ºC', 'Pacífico, cardume', '50 litros'],
  ['Tetra Congo', 'Phenacogrammus interruptus', 'Alestidae', '8 cm', '6.0 a 7.5', '24 a 28 ºC', 'Pacífico, cardume', '100 litros'],
  ['Tetra Limão', 'Hyphessobrycon pulchripinnis', 'Characidae', '4 cm', '5.5 a 7.5', '23 a 28 ºC', 'Pacífico, cardume', '40 litros'],
  ['Tetra Ember', 'Hyphessobrycon amandae', 'Characidae', '2 cm', '5.0 a 7.0', '24 a 28 ºC', 'Pacífico, nano cardume', '20 litros'],
  ['Tetra Neon Verde', 'Paracheirodon simulans', 'Characidae', '3 cm', '5.0 a 6.5', '24 a 28 ºC', 'Pacífico, cardume', '30 litros'],
  ['Tetra Glowlight', 'Hemigrammus erythrozonus', 'Characidae', '4 cm', '5.5 a 7.5', '24 a 28 ºC', 'Pacífico, cardume', '40 litros'],
  ['Tetra Serpae', 'Hyphessobrycon eques', 'Characidae', '4 cm', '5.5 a 7.5', '22 a 28 ºC', 'Semi-agressivo, pode morder nadadeiras', '50 litros'],
  ['Tetra Buenos Aires', 'Hyphessobrycon anisitsi', 'Characidae', '7 cm', '6.0 a 8.0', '18 a 28 ºC', 'Semi-agressivo, come plantas', '80 litros'],
  ['Peixe Lápis', 'Nannostomus beckfordi', 'Lebiasinidae', '4 cm', '5.5 a 7.0', '24 a 28 ºC', 'Pacífico, cardume', '30 litros'],
  ['Peixe Lápis Anão', 'Nannostomus marginatus', 'Lebiasinidae', '3 cm', '5.0 a 7.0', '24 a 28 ºC', 'Pacífico, nano cardume', '20 litros'],
  ['Piaba Vidro', 'Prionobrama filigera', 'Characidae', '6 cm', '6.0 a 7.5', '22 a 28 ºC', 'Pacífico, corpo transparente', '60 litros'],
  ['Mato Grosso', 'Hyphessobrycon eques', 'Characidae', '4 cm', '6.0 a 7.5', '22 a 28 ºC', 'Pacífico, cardume colorido', '40 litros'],
  // Barbos e Ciprinideos
  ['Barbo Cereja', 'Puntius titteya', 'Cyprinidae', '5 cm', '6.0 a 7.5', '22 a 28 ºC', 'Pacífico, cardume', '50 litros'],
  ['Barbo Tigre', 'Puntigrus tetrazona', 'Cyprinidae', '7 cm', '6.0 a 7.5', '22 a 28 ºC', 'Semi-agressivo, morde nadadeiras. Manter em grupo 6+', '80 litros'],
  ['Barbo Ouro', 'Barbodes semifasciolatus', 'Cyprinidae', '7 cm', '6.0 a 8.0', '18 a 26 ºC', 'Pacífico, resistente', '80 litros'],
  ['Barbo Denison', 'Sahyadria denisonii', 'Cyprinidae', '12 cm', '6.5 a 7.8', '22 a 26 ºC', 'Pacífico, ativo, cardume', '200 litros'],
  ['Rasbora Arlequim', 'Trigonostigma heteromorpha', 'Cyprinidae', '4 cm', '5.0 a 7.0', '22 a 28 ºC', 'Pacífico, cardume', '40 litros'],
  ['Rasbora Chili', 'Boraras brigittae', 'Cyprinidae', '2 cm', '4.0 a 7.0', '20 a 28 ºC', 'Pacífico, nano cardume', '15 litros'],
  ['Rasbora Mosquito', 'Boraras merah', 'Cyprinidae', '2 cm', '4.0 a 6.5', '22 a 28 ºC', 'Pacífico, nano', '10 litros'],
  ['Danio Pérola Celestial', 'Celestichthys margaritatus', 'Cyprinidae', '2 cm', '6.5 a 7.5', '20 a 26 ºC', 'Pacífico, tímido', '20 litros'],
  ['Peixe Zebra Dourado', 'Danio rerio var. gold', 'Cyprinidae', '5 cm', '6.5 a 7.5', '18 a 26 ºC', 'Pacífico, ativo, cardume', '40 litros'],
  ['White Cloud', 'Tanichthys albonubes', 'Cyprinidae', '4 cm', '6.0 a 8.0', '15 a 22 ºC', 'Pacífico, água fria, cardume', '30 litros'],
  // Corydoras
  ['Corydoras Panda', 'Corydoras panda', 'Callichthyidae', '5 cm', '6.0 a 7.5', '22 a 26 ºC', 'Pacífico, grupo de 6+', '40 litros'],
  ['Corydoras Pigmeu', 'Corydoras pygmaeus', 'Callichthyidae', '2.5 cm', '6.0 a 7.5', '22 a 26 ºC', 'Pacífico, nano, cardume 10+', '20 litros'],
  ['Corydoras Habrosus', 'Corydoras habrosus', 'Callichthyidae', '2.5 cm', '6.0 a 7.5', '22 a 26 ºC', 'Pacífico, nano, grupo 8+', '20 litros'],
  ['Corydoras Albino', 'Corydoras aeneus var. albino', 'Callichthyidae', '7 cm', '6.0 a 8.0', '22 a 28 ºC', 'Pacífico, grupo 6+', '60 litros'],
  ['Corydoras Venezuela', 'Corydoras venezuelanus', 'Callichthyidae', '6 cm', '6.0 a 7.5', '22 a 26 ºC', 'Pacífico, laranja brilhante', '50 litros'],
  ['Corydoras Adolfoi', 'Corydoras adolfoi', 'Callichthyidae', '5 cm', '5.5 a 7.0', '22 a 26 ºC', 'Pacífico, faixa laranja na cabeça', '40 litros'],
  // Ciclídeos Anões
  ['Apisto Cacatuoides', 'Apistogramma cacatuoides', 'Cichlidae', '8 cm', '6.0 a 7.5', '24 a 28 ºC', 'Semi-agressivo na reprodução', '60 litros'],
  ['Ramirezi Electric Blue', 'Mikrogeophagus ramirezi var. electric blue', 'Cichlidae', '6 cm', '5.5 a 7.0', '26 a 30 ºC', 'Pacífico, sensível à qualidade da água', '50 litros'],
  ['Kribensis', 'Pelvicachromis pulcher', 'Cichlidae', '10 cm', '6.0 a 7.5', '24 a 28 ºC', 'Semi-agressivo na reprodução, colorido', '80 litros'],
  // Ciclídeos Grandes
  ['Jack Dempsey', 'Rocio octofasciata', 'Cichlidae', '25 cm', '6.5 a 7.5', '24 a 28 ºC', 'Agressivo, territorial. Pet fish interativo.', '250 litros'],
  ['Texas Cichlid', 'Herichthys cyanoguttatus', 'Cichlidae', '30 cm', '6.5 a 8.0', '22 a 28 ºC', 'Agressivo, territorial', '300 litros'],
  ['Green Terror', 'Andinoacara rivulatus', 'Cichlidae', '30 cm', '6.5 a 8.0', '22 a 28 ºC', 'Agressivo, territorial, cores vibrantes', '300 litros'],
  ['Midas Cichlid', 'Amphilophus citrinellus', 'Cichlidae', '35 cm', '7.0 a 8.0', '24 a 28 ºC', 'Agressivo, territorial. Pet fish que come na mão.', '400 litros'],
  ['Red Devil', 'Amphilophus labiatus', 'Cichlidae', '35 cm', '6.5 a 7.5', '24 a 28 ºC', 'Muito agressivo, territorial. Pet fish.', '400 litros'],
  ['Jaguar Cichlid', 'Parachromis managuensis', 'Cichlidae', '40 cm', '7.0 a 8.5', '24 a 28 ºC', 'Predador agressivo, come peixes menores', '500 litros'],
  ['Dovii', 'Parachromis dovii', 'Cichlidae', '60 cm', '7.0 a 8.0', '24 a 28 ºC', 'Extremamente agressivo, o maior ciclídeo centro-americano', '800 litros'],
  // Ciclídeos Africanos
  ['Yellow Lab', 'Labidochromis caeruleus', 'Cichlidae', '10 cm', '7.5 a 8.5', '24 a 28 ºC', 'Semi-agressivo, um dos mais pacíficos do Malawi', '120 litros'],
  ['Demasoni', 'Pseudotropheus demasoni', 'Cichlidae', '8 cm', '7.5 a 8.5', '24 a 28 ºC', 'Agressivo, manter em grupo 12+ para diluir', '120 litros'],
  ['Frontosa', 'Cyphotilapia frontosa', 'Cichlidae', '35 cm', '7.5 a 9.0', '24 a 28 ºC', 'Semi-agressivo, majestoso, predador lento', '400 litros'],
  ['Venustus', 'Nimbochromis venustus', 'Cichlidae', '25 cm', '7.5 a 8.5', '24 a 28 ºC', 'Predador que se finge de morto para caçar', '300 litros'],
  // Gouramis
  ['Gourami Pérola', 'Trichopodus leeri', 'Osphronemidae', '12 cm', '6.0 a 7.5', '24 a 28 ºC', 'Pacífico, elegante, respira ar atmosférico', '100 litros'],
  ['Gourami Mel', 'Trichogaster chuna', 'Osphronemidae', '5 cm', '6.0 a 7.5', '22 a 28 ºC', 'Pacífico, tímido, colorido', '30 litros'],
  ['Gourami Gigante', 'Osphronemus goramy', 'Osphronemidae', '60 cm', '6.5 a 8.0', '20 a 30 ºC', 'Semi-agressivo. Pet fish que come na mão e reconhece o dono.', '800 litros'],
  ['Gourami Chocolate', 'Sphaerichthys osphromenoides', 'Osphronemidae', '5 cm', '4.0 a 6.0', '25 a 30 ºC', 'Pacífico, difícil, incubador bocal', '40 litros'],
  // Loaches
  ['Botia Palhaço', 'Chromobotia macracanthus', 'Botiidae', '30 cm', '6.0 a 7.5', '24 a 30 ºC', 'Pacífico mas ativo, grupo de 5+. Come caramujos.', '300 litros'],
  ['Kuhli Loach', 'Pangio kuhlii', 'Cobitidae', '10 cm', '5.5 a 7.0', '24 a 30 ºC', 'Pacífico, noturno, parece cobra, grupo de 6+', '60 litros'],
  ['Dojo Loach', 'Misgurnus anguillicaudatus', 'Cobitidae', '25 cm', '6.0 a 8.0', '10 a 25 ºC', 'Pacífico, água fria, reage a pressão atmosférica', '150 litros'],
  ['Hillstream Loach', 'Sewellia lineolata', 'Balitoridae', '6 cm', '6.5 a 7.5', '18 a 24 ºC', 'Pacífico, precisa de forte correnteza', '60 litros'],
  // Bagres
  ['Cascudo Comum', 'Hypostomus plecostomus', 'Loricariidae', '40 cm', '6.0 a 8.0', '22 a 28 ºC', 'Pacífico, come algas, cresce muito', '300 litros'],
  ['Cascudo Bristlenose', 'Ancistrus cirrhosus', 'Loricariidae', '12 cm', '6.0 a 7.5', '22 a 28 ºC', 'Pacífico, excelente comedor de algas', '80 litros'],
  ['Cascudo Zebra', 'Hypancistrus zebra', 'Loricariidae', '8 cm', '6.0 a 7.5', '26 a 30 ºC', 'Pacífico, raro e valorizado, listras preto e branco', '80 litros'],
  ['Cascudo Royal', 'Panaque nigrolineatus', 'Loricariidae', '40 cm', '6.5 a 7.5', '24 a 28 ºC', 'Pacífico, come madeira', '400 litros'],
  ['Bagre de Vidro', 'Kryptopterus vitreolus', 'Siluridae', '8 cm', '6.5 a 7.5', '22 a 28 ºC', 'Pacífico, corpo completamente transparente, cardume', '80 litros'],
  ['Bagre Invertido', 'Synodontis nigriventris', 'Mochokidae', '10 cm', '6.0 a 7.5', '22 a 28 ºC', 'Pacífico, nada de barriga para cima', '80 litros'],
  ['Pimelodus Pintado', 'Pimelodus pictus', 'Pimelodidae', '12 cm', '6.0 a 7.5', '22 a 28 ºC', 'Semi-agressivo, ativo à noite, barbilhões longos', '150 litros'],
  // Vivíparos
  ['Guppy Endler', 'Poecilia wingei', 'Poeciliidae', '3 cm', '6.5 a 8.0', '24 a 28 ºC', 'Pacífico, vivíparo, cores intensas, menor que Guppy', '20 litros'],
  ['Plati Mickey', 'Xiphophorus maculatus var. mickey', 'Poeciliidae', '5 cm', '7.0 a 8.0', '22 a 28 ºC', 'Pacífico, vivíparo, mancha em formato Mickey na cauda', '40 litros'],
  ['Molinésia Vela', 'Poecilia velifera', 'Poeciliidae', '15 cm', '7.5 a 8.5', '24 a 28 ºC', 'Pacífico, nadadeira dorsal enorme, tolera água salobra', '150 litros'],
  // Peixes Especiais
  ['Peixe Elefante', 'Gnathonemus petersii', 'Mormyridae', '25 cm', '6.0 a 7.5', '24 a 28 ºC', 'Pacífico, noturno, usa campo elétrico para navegar', '200 litros'],
  ['Peixe Faca Palhaço', 'Chitala ornata', 'Notopteridae', '80 cm', '6.0 a 7.5', '24 a 28 ºC', 'Predador noturno, come peixes menores. Pet fish.', '800 litros'],
  ['Polypterus Senegalus', 'Polypterus senegalus', 'Polypteridae', '30 cm', '6.5 a 7.5', '24 a 28 ºC', 'Semi-agressivo, peixe primitivo com pulmões', '200 litros'],
  ['Axolote', 'Ambystoma mexicanum', 'Ambystomatidae', '25 cm', '6.5 a 8.0', '14 a 20 ºC', 'Pacífico, anfíbio que não metamorfoseia, água fria', '80 litros'],
  ['Camarão Red Crystal', 'Caridina cantonensis var. CRS', 'Atyidae', '3 cm', '5.5 a 7.0', '20 a 24 ºC', 'Pacífico, ornamental, sensível a parâmetros', '20 litros'],
  ['Camarão Blue Bolt', 'Caridina cantonensis var. blue bolt', 'Atyidae', '3 cm', '5.5 a 6.5', '20 a 24 ºC', 'Pacífico, azul intenso, raro e valorizado', '20 litros'],
  ['Camarão Yellow Fire', 'Neocaridina davidi var. yellow', 'Atyidae', '3 cm', '6.5 a 8.0', '20 a 28 ºC', 'Pacífico, amarelo vibrante, fácil reprodução', '10 litros'],
  ['Camarão Blue Dream', 'Neocaridina davidi var. blue', 'Atyidae', '3 cm', '6.5 a 8.0', '20 a 28 ºC', 'Pacífico, azul veludo, fácil', '10 litros'],
  ['Camarão Orange Sakura', 'Neocaridina davidi var. orange', 'Atyidae', '3 cm', '6.5 a 8.0', '20 a 28 ºC', 'Pacífico, laranja brilhante', '10 litros'],
  ['Caracol Neritina Zebra', 'Neritina natalensis', 'Neritidae', '3 cm', '6.5 a 8.5', '22 a 28 ºC', 'Pacífico, excelente comedor de algas, não reproduz em água doce', '10 litros'],
  ['Caracol Mistério', 'Pomacea bridgesii', 'Ampullariidae', '5 cm', '7.0 a 8.0', '22 a 28 ºC', 'Pacífico, colorido (dourado, azul, rosa), come algas mortas', '20 litros'],
  ['Caracol Assassino', 'Clea helena', 'Nassariidae', '3 cm', '7.0 a 8.0', '22 a 28 ºC', 'Come outros caracóis. Controle biológico de pragas.', '20 litros'],
]

const saltwaterFish: [string, string, string, string, string, string, string, string][] = [
  ['Peixe Palhaço Percula', 'Amphiprion percula', 'Pomacentridae', '8 cm', '8.0 a 8.4', '24 a 27 ºC', 'Semi-agressivo com sua anêmona', '80 litros'],
  ['Peixe Palhaço Clark', 'Amphiprion clarkii', 'Pomacentridae', '12 cm', '8.0 a 8.4', '24 a 27 ºC', 'Semi-agressivo, aceita várias anêmonas', '100 litros'],
  ['Tang Azul (Dory)', 'Paracanthurus hepatus', 'Acanthuridae', '30 cm', '8.0 a 8.4', '24 a 27 ºC', 'Pacífico mas precisa de muito espaço', '400 litros'],
  ['Tang Amarelo', 'Zebrasoma flavescens', 'Acanthuridae', '20 cm', '8.0 a 8.4', '24 a 27 ºC', 'Semi-agressivo com outros tangs', '300 litros'],
  ['Peixe Mandarim', 'Synchiropus splendidus', 'Callionymidae', '6 cm', '8.0 a 8.4', '24 a 27 ºC', 'Pacífico, difícil alimentar, come copépodes', '150 litros'],
  ['Gramma Real', 'Gramma loreto', 'Grammatidae', '8 cm', '8.0 a 8.4', '24 a 27 ºC', 'Semi-agressivo com similares, roxo e amarelo', '80 litros'],
  ['Cardeal de Banggai', 'Pterapogon kauderni', 'Apogonidae', '8 cm', '8.0 a 8.4', '24 a 27 ºC', 'Pacífico, incubador bocal, ameaçado de extinção', '80 litros'],
  ['Gobi Watchman', 'Cryptocentrus cinctus', 'Gobiidae', '8 cm', '8.0 a 8.4', '24 a 27 ºC', 'Pacífico, vive em simbiose com camarão pistola', '80 litros'],
  ['Blenny Bicolor', 'Ecsenius bicolor', 'Blenniidae', '10 cm', '8.0 a 8.4', '24 a 27 ºC', 'Semi-agressivo com similares, come algas', '80 litros'],
  ['Firefish', 'Nemateleotris magnifica', 'Ptereleotridae', '8 cm', '8.0 a 8.4', '24 a 27 ºC', 'Pacífico, tímido, cores incríveis', '60 litros'],
  ['Wrasse Seis Linhas', 'Pseudocheilinus hexataenia', 'Labridae', '8 cm', '8.0 a 8.4', '24 a 27 ºC', 'Semi-agressivo, come parasitas de outros peixes', '80 litros'],
  ['Anjo Flame', 'Centropyge loricula', 'Pomacanthidae', '10 cm', '8.0 a 8.4', '24 a 27 ºC', 'Semi-agressivo, pode beliscar corais', '150 litros'],
  ['Anjo Coral Beauty', 'Centropyge bispinosa', 'Pomacanthidae', '10 cm', '8.0 a 8.4', '24 a 27 ºC', 'Semi-agressivo, relativamente seguro com corais', '150 litros'],
  ['Dottyback Orchid', 'Pseudochromis fridmani', 'Pseudochromidae', '6 cm', '8.0 a 8.4', '24 a 27 ºC', 'Semi-agressivo, roxo vibrante', '60 litros'],
  ['Gobi Citron', 'Gobiodon citrinus', 'Gobiidae', '5 cm', '8.0 a 8.4', '24 a 27 ºC', 'Pacífico, vive em corais Acropora', '40 litros'],
  ['Peixe Papagaio Bicolor', 'Cetoscarus bicolor', 'Scaridae', '80 cm', '8.0 a 8.4', '24 a 27 ºC', 'Pacífico, mas enorme, come corais', '2000 litros'],
  ['Peixe Leão Anão', 'Dendrochirus zebra', 'Scorpaenidae', '18 cm', '8.0 a 8.4', '24 a 27 ºC', 'Predador emboscador, espinhos venenosos', '150 litros'],
  ['Peixe Leão Volitans', 'Pterois volitans', 'Scorpaenidae', '35 cm', '8.0 a 8.4', '24 a 27 ºC', 'Predador, come peixes menores, espinhos venenosos', '400 litros'],
  ['Cavalo Marinho Anão', 'Hippocampus zosterae', 'Syngnathidae', '5 cm', '8.0 a 8.4', '22 a 26 ºC', 'Pacífico, delicado, aquário dedicado', '40 litros'],
  ['Peixe Sapo', 'Antennarius maculatus', 'Antennariidae', '10 cm', '8.0 a 8.4', '24 a 27 ºC', 'Predador emboscador, come peixes do seu tamanho', '80 litros'],
]

const plants: [string, string, string, string, string, string, string, string][] = [
  // [nomePopular, nomeCientifico, familia, ph, temp, dificuldade, crescimento, posicao]
  ['Rotala Blood Red', 'Rotala macrandra var. mini', 'Lythraceae', '5.5 a 7.0', '22 a 28 ºC', 'Difícil', 'Lento', 'Meio/Fundo'],
  ['Ludwigia Super Red', 'Ludwigia palustris', 'Onagraceae', '5.5 a 7.5', '20 a 28 ºC', 'Fácil', 'Rápido', 'Meio/Fundo'],
  ['Helanthium Tenellum', 'Helanthium tenellum', 'Alismataceae', '5.5 a 7.5', '20 a 28 ºC', 'Fácil', 'Rápido', 'Frente (carpete)'],
  ['Marsilea Hirsuta', 'Marsilea hirsuta', 'Marsileaceae', '6.0 a 7.5', '20 a 28 ºC', 'Fácil', 'Moderado', 'Frente (carpete)'],
  ['Hydrocotyle Tripartita', 'Hydrocotyle tripartita', 'Araliaceae', '6.0 a 7.5', '20 a 28 ºC', 'Fácil', 'Rápido', 'Frente/Meio'],
  ['Pogostemon Helferi', 'Pogostemon helferi', 'Lamiaceae', '6.0 a 7.5', '22 a 28 ºC', 'Moderada', 'Lento', 'Frente'],
  ['Riccia Flutuante', 'Riccia fluitans', 'Ricciaceae', '5.5 a 7.5', '20 a 28 ºC', 'Fácil', 'Rápido', 'Superfície/Decoração'],
  ['Flame Moss', 'Taxiphyllum sp. Flame', 'Hypnaceae', '5.5 a 7.5', '20 a 28 ºC', 'Fácil', 'Lento', 'Decoração'],
  ['Weeping Moss', 'Vesicularia ferriei', 'Hypnaceae', '5.0 a 7.5', '20 a 28 ºC', 'Fácil', 'Lento', 'Decoração'],
  ['Bucephalandra Kedagang', 'Bucephalandra sp. Kedagang', 'Araceae', '5.5 a 7.5', '22 a 28 ºC', 'Fácil', 'Muito lento', 'Decoração'],
  ['Bucephalandra Brownie', 'Bucephalandra sp. Brownie', 'Araceae', '5.5 a 7.5', '22 a 28 ºC', 'Fácil', 'Muito lento', 'Decoração'],
  ['Anubias Nana Petite', 'Anubias barteri var. nana petite', 'Araceae', '6.0 a 8.0', '22 a 28 ºC', 'Muito fácil', 'Muito lento', 'Decoração'],
  ['Anubias Coffeefolia', 'Anubias barteri var. coffeefolia', 'Araceae', '6.0 a 8.0', '22 a 28 ºC', 'Fácil', 'Lento', 'Meio'],
  ['Cryptocoryne Wendtii Brown', 'Cryptocoryne wendtii var. brown', 'Araceae', '6.0 a 8.0', '22 a 28 ºC', 'Fácil', 'Lento', 'Frente/Meio'],
  ['Cryptocoryne Balansae', 'Cryptocoryne crispatula var. balansae', 'Araceae', '6.0 a 8.0', '22 a 28 ºC', 'Fácil', 'Moderado', 'Fundo'],
  ['Vallisneria Nana', 'Vallisneria nana', 'Hydrocharitaceae', '6.0 a 8.0', '20 a 28 ºC', 'Muito fácil', 'Rápido', 'Fundo'],
  ['Vallisneria Gigante', 'Vallisneria americana var. gigantea', 'Hydrocharitaceae', '6.0 a 8.0', '18 a 28 ºC', 'Muito fácil', 'Muito rápido', 'Fundo'],
  ['Sagittaria Subulata', 'Sagittaria subulata', 'Alismataceae', '6.0 a 8.0', '20 a 28 ºC', 'Fácil', 'Rápido', 'Frente/Meio'],
  ['Limnophila Aromatica', 'Limnophila aromatica', 'Plantaginaceae', '6.0 a 7.5', '22 a 28 ºC', 'Moderada', 'Rápido', 'Fundo'],
  ['Hygrophila Pinnatifida', 'Hygrophila pinnatifida', 'Acanthaceae', '6.0 a 7.5', '22 a 28 ºC', 'Moderada', 'Lento', 'Meio/Decoração'],
  ['Proserpinaca Palustris', 'Proserpinaca palustris', 'Haloragaceae', '5.5 a 7.0', '20 a 28 ºC', 'Moderada', 'Lento', 'Meio'],
  ['Myriophyllum Mattogrossense', 'Myriophyllum mattogrossense', 'Haloragaceae', '5.5 a 7.5', '22 a 28 ºC', 'Fácil', 'Rápido', 'Fundo'],
  ['Cabomba Vermelha', 'Cabomba furcata', 'Cabombaceae', '5.5 a 7.0', '22 a 28 ºC', 'Difícil', 'Moderado', 'Fundo'],
  ['Alternanthera Mini', 'Alternanthera reineckii var. mini', 'Amaranthaceae', '5.5 a 7.5', '22 a 28 ºC', 'Moderada', 'Lento', 'Frente/Meio'],
]

const corals: [string, string, string, string, string, string, string, string, string][] = [
  // [nomePopular, nomeCientifico, familia, categoria, dificuldade, iluminacao, fluxo, coloracao, descricao]
  ['Toadstool Grande', 'Sarcophyton ehrenbergi', 'Alcyoniidae', 'mole', 'Fácil', 'Moderada a alta', 'Moderado', 'Creme, verde', 'Versão grande do coral couro. Pode atingir 30cm+ de diâmetro.'],
  ['Clavularia', 'Clavularia sp.', 'Clavulariidae', 'mole', 'Fácil', 'Moderada', 'Moderado', 'Verde, marrom, branco', 'Pólipos em forma de estrela. Forma tapetes em rochas.'],
  ['Nepthea', 'Nephthea sp.', 'Nephtheidae', 'mole', 'Fácil', 'Moderada', 'Moderado a forte', 'Creme, rosa, verde', 'Coral em formato de árvore com ramificações suaves.'],
  ['Lobophytum', 'Lobophytum sp.', 'Alcyoniidae', 'mole', 'Fácil', 'Moderada', 'Moderado', 'Creme, verde', 'Coral couro com superfície lobulada. Muito resistente.'],
  ['Blastomussa', 'Blastomussa merleti', 'Merulinidae', 'duro-lps', 'Fácil', 'Baixa a moderada', 'Baixo', 'Vermelho, verde, bicolor', 'LPS com pólipos grandes e carnudos. Ótimo para iniciantes.'],
  ['Candy Cane Coral', 'Caulastrea furcata', 'Merulinidae', 'duro-lps', 'Fácil', 'Moderada', 'Moderado', 'Verde, marrom com centros verdes', 'LPS em formato de bastão com pólipos redondos nas pontas.'],
  ['Brain Coral (Open)', 'Trachyphyllia geoffroyi', 'Merulinidae', 'duro-lps', 'Fácil', 'Baixa a moderada', 'Baixo', 'Verde, vermelho, multicolor', 'LPS solitário com cores espetaculares. Vive no substrato.'],
  ['Acan Lord', 'Micromussa lordhowensis', 'Lobophylliidae', 'duro-lps', 'Fácil', 'Baixa a moderada', 'Baixo', 'Extremamente variada', 'Altamente colecionável. Variedades raras valem milhares.'],
  ['Seriatopora', 'Seriatopora hystrix', 'Pocilloporidae', 'duro-sps', 'Moderada', 'Alta', 'Forte', 'Rosa, verde, creme', 'SPS com ramificações finas como agulhas. Crescimento rápido.'],
  ['Pavona', 'Pavona decussata', 'Agariciidae', 'duro-sps', 'Moderada', 'Moderada a alta', 'Moderado', 'Verde, marrom', 'SPS encrostante que forma placas. Relativamente tolerante.'],
  ['Anêmona Long Tentacle', 'Macrodactyla doreensis', 'Actiniidae', 'anemona', 'Moderada', 'Moderada a alta', 'Moderado', 'Verde, rosa, roxo', 'Tentáculos muito longos e finos. Enterra o pé no substrato.'],
  ['Anêmona Condy', 'Condylactis gigantea', 'Actiniidae', 'anemona', 'Fácil', 'Moderada', 'Moderado', 'Branco com pontas rosa/roxo', 'Anêmona do Caribe. Fácil mas raramente aceita palhaços.'],
]

async function main() {
  console.log('=== MEGA IMPORT: 500 espécies ===\n')

  // Freshwater fish
  const fwFile = join(DATA_DIR, 'fish-agua-doce.ts')
  const fwRecords = extractRecords(fwFile)
  const fwNames = getNames(fwRecords)
  let fwMaxId = fwRecords.reduce((m: number, r: any) => Math.max(m, r.id), 0)
  let fwAdded = 0

  console.log('--- Peixes Água Doce ---')
  for (const [pop, sci, fam, tam, ph, temp, comp, aqMin] of freshwaterFish) {
    if (fwNames.has(sci.toLowerCase()) || fwNames.has(pop.toLowerCase())) { continue }
    console.log(`  + ${pop}`)
    const e = await getEnrichment(sci)
    fwRecords.push({
      id: ++fwMaxId, alimentacao: '', caracteristica: '', comportamento: comp,
      diformismoSexual: '', familia: fam, gh: '', imagem: '', kh: '',
      nomeCientifico: sci, nomePopular: pop, origem: '', outrasInformacoes: `Aquário mínimo: ${aqMin}.`,
      outrosNome: '', ph, posicaoAquario: '', reproducao: '', tamanhoAdulto: tam,
      temperatura: temp, tipo: 'PEIXESDULCICOLAS', subTipo: '', fonte: '',
      ...(e && { enrichment: e }),
    })
    fwAdded++
  }
  writeRecords(fwFile, fwRecords, 'Fish')
  console.log(`  Total: ${fwAdded}\n`)

  // Saltwater fish
  const swFile = join(DATA_DIR, 'fish-agua-salgada.ts')
  const swRecords = extractRecords(swFile)
  const swNames = getNames(swRecords)
  let swMaxId = swRecords.reduce((m: number, r: any) => Math.max(m, r.id), 0)
  let swAdded = 0

  console.log('--- Peixes Água Salgada ---')
  for (const [pop, sci, fam, tam, ph, temp, comp, aqMin] of saltwaterFish) {
    if (swNames.has(sci.toLowerCase()) || swNames.has(pop.toLowerCase())) { continue }
    console.log(`  + ${pop}`)
    const e = await getEnrichment(sci)
    swRecords.push({
      id: ++swMaxId, alimentacao: '', caracteristica: '', comportamento: comp,
      diformismoSexual: '', familia: fam, gh: '', imagem: '', kh: '',
      nomeCientifico: sci, nomePopular: pop, origem: '', outrasInformacoes: `Aquário mínimo: ${aqMin}.`,
      outrosNome: '', ph, posicaoAquario: '', reproducao: '', tamanhoAdulto: tam,
      temperatura: temp, tipo: 'PEIXESMARINHOS', subTipo: '', fonte: '',
      ...(e && { enrichment: e }),
    })
    swAdded++
  }
  writeRecords(swFile, swRecords, 'Fish')
  console.log(`  Total: ${swAdded}\n`)

  // Plants
  const pFile = join(DATA_DIR, 'plants.ts')
  const pRecords = extractRecords(pFile)
  const pNames = getNames(pRecords)
  let pMaxId = pRecords.reduce((m: number, r: any) => Math.max(m, r.id), 0)
  let pAdded = 0

  console.log('--- Plantas ---')
  for (const [pop, sci, fam, ph, temp, dif, cresc, pos] of plants) {
    if (pNames.has(sci.toLowerCase()) || pNames.has(pop.toLowerCase())) { continue }
    console.log(`  + ${pop}`)
    const e = await getEnrichment(sci)
    pRecords.push({
      id: ++pMaxId, co2: '', crescimento: cresc, dificuldade: dif, estrutura: '',
      familia: fam, iluminacao: '', imagem: '', nomeCientifico: sci, nomePopular: pop,
      origem: '', outrosNome: '', ph, plantio: '', porte: '', posicao: pos,
      reproducao: '', substratoFertil: '', suportaEmersao: '', tamanho: '',
      temperatura: temp, fonte: '', ...(e && { enrichment: e }),
    })
    pAdded++
  }
  writeRecords(pFile, pRecords, 'Plant')
  console.log(`  Total: ${pAdded}\n`)

  // Corals
  const cFile = join(DATA_DIR, 'corals.ts')
  const cRecords = extractRecords(cFile)
  const cNames = getNames(cRecords)
  let cMaxId = cRecords.reduce((m: number, r: any) => Math.max(m, r.id), 0)
  let cAdded = 0

  console.log('--- Corais ---')
  for (const [pop, sci, fam, cat, dif, ilum, fluxo, cor, desc] of corals) {
    if (cNames.has(sci.toLowerCase()) || cNames.has(pop.toLowerCase())) { continue }
    console.log(`  + ${pop}`)
    const e = await getEnrichment(sci)
    cRecords.push({
      id: ++cMaxId, nomePopular: pop, nomeCientifico: sci, outrosNome: '',
      familia: fam, origem: '', categoria: cat, iluminacao: ilum, fluxoAgua: fluxo,
      dificuldade: dif, alimentacao: '', compatibilidade: '', crescimento: '',
      coloracao: cor, descricao: desc, ...(e && { enrichment: e }),
    })
    cAdded++
  }
  writeRecords(cFile, cRecords, 'Coral')
  console.log(`  Total: ${cAdded}\n`)

  console.log(`\n=== RESUMO ===`)
  console.log(`Peixes água doce: +${fwAdded}`)
  console.log(`Peixes água salgada: +${swAdded}`)
  console.log(`Plantas: +${pAdded}`)
  console.log(`Corais: +${cAdded}`)
  console.log(`TOTAL ADICIONADO: ${fwAdded + swAdded + pAdded + cAdded}`)
}

main().catch(console.error)
