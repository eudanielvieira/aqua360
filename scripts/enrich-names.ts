import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(__dirname, '../src/data')
const CACHE_FILE = join(__dirname, '.names-cache.json')
const DELAY_MS = 500

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJSON(url: string): Promise<any> {
  try {
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

function loadCache(): Record<string, string> {
  if (existsSync(CACHE_FILE)) return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'))
  return {}
}

function saveCache(cache: Record<string, string>) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

async function getVernacularName(scientificName: string): Promise<string | null> {
  // 1. GBIF - buscar nomes vernaculares em portugues
  const gbif = await fetchJSON(
    `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&strict=true`
  )
  if (gbif?.usageKey) {
    await sleep(DELAY_MS)
    const vernacular = await fetchJSON(
      `https://api.gbif.org/v1/species/${gbif.usageKey}/vernacularNames?limit=50`
    )
    if (vernacular?.results) {
      // Priorizar portugues
      const ptName = vernacular.results.find((v: any) =>
        v.language === 'por' || v.language === 'pt'
      )
      if (ptName?.vernacularName) return ptName.vernacularName

      // Ingles como fallback para traduzir
      const enName = vernacular.results.find((v: any) =>
        v.language === 'eng' || v.language === 'en'
      )
      if (enName?.vernacularName) return enName.vernacularName

      // Qualquer nome disponivel
      if (vernacular.results[0]?.vernacularName) return vernacular.results[0].vernacularName
    }
  }

  await sleep(DELAY_MS)

  // 2. iNaturalist - buscar nome comum
  const inat = await fetchJSON(
    `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&per_page=1&locale=pt-BR`
  )
  if (inat?.results?.[0]) {
    const taxon = inat.results[0]
    if (taxon.preferred_common_name) return taxon.preferred_common_name
    if (taxon.english_common_name) return taxon.english_common_name
  }

  return null
}

function needsName(record: any): boolean {
  const pop = (record.nomePopular || '').trim()
  const sci = (record.nomeCientifico || '').trim()

  if (!pop) return true
  if (pop === sci) return true

  // Nome muito curto que parece ser parte do cientifico
  const sciParts = sci.split(' ')
  if (pop === sciParts[sciParts.length - 1]) return true

  return false
}

function extractRecords(filePath: string): any[] {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/const data: (?:Fish|Plant|Coral)\[\] = (\[[\s\S]*?\])\n\nexport/)
  if (!match) return []
  return JSON.parse(match[1])
}

function writeRecords(filePath: string, records: any[], typeName: string) {
  const content = `import type { ${typeName} } from '../types'\n\nconst data: ${typeName}[] = ${JSON.stringify(records, null, 2)}\n\nexport default data\n`
  writeFileSync(filePath, content)
}

// Nomes conhecidos para especies populares que APIs nem sempre retornam em PT
const knownNames: Record<string, string> = {
  'Aphyosemion australe': 'Killi Cauda-de-Lira',
  'Aphyosemion cognatum': 'Killi Cognatum',
  'Aphyosemion striatum': 'Killi Listrado',
  'Austrolebias nigripinnis': 'Peixe Anual Negro',
  'Chromaphyosemion bitaeniatum': 'Killi Duas Faixas',
  'Fundulopanchax spoorembergi': 'Killi Spoorembergi',
  'Leptolebias aureoguttatus': 'Peixe Anual Dourado',
  'Nothobranchius foerschi': 'Killi de Foersch',
  'Nothobranchius guentheri': 'Killi de Guenther',
  'Lamprologus Ornatipinnis': 'Lamprologus Ornatipinnis',
  'Protomelas spilonotus': 'Tanzania',
  'Cyathopharynx Foae': 'Cyathopharynx Foae',
  'Carassius auratus': 'Kinguio / Peixe Dourado',
  'Xiphophorus hellerii': 'Espadinha',
  'Xiphophorus maculatus': 'Plati',
  'Symphysodon discus': 'Disco',
  'Corydoras aeneus': 'Coridora Bronze',
  'Ancistrus sp.': 'Cascudo Ancistrus',
  'Otocinclus affinis': 'Otocinclus',
  'Pangio kuhlii': 'Kuhli Loach / Cobra',
  'Trigonostigma heteromorpha': 'Rasbora Arlequim',
  'Heros severus': 'Acara Severo',
  'Cichla ocellaris': 'Tucunare',
  'Hemichromis lifalili': 'Ciclideo Joia Vermelho',
  'Rasbora espei': 'Rasbora Espei',
  'Boraras brigittae': 'Rasbora Mosquito',
  'Celestichthys margaritatus': 'Celestial Pearl Danio',
  'Tateurndina ocellicauda': 'Gobi Pavao',
  'Stiphodon ornatus': 'Gobi Arco-Iris',
  'Iriatherina werneri': 'Arco-Iris Threadfin',
  'Pseudomugil furcatus': 'Olho Azul de Furcata',
  'Tanichthys albonubes': 'Neon Chines',
  'Pethia conchonius': 'Barbo Rosa',
  'Crossocheilus oblongus': 'Siames Comedor de Algas',
  'Gyrinocheilus aymonieri': 'Comedor de Algas Chines',
  'Pantodon buchholzi': 'Peixe Borboleta Africano',
  'Clarias batrachus': 'Bagre Andador',
  'Apteronotus albifrons': 'Peixe Faca Negro',
  'Eigenmannia virescens': 'Peixe Faca Transparente',
  'Pterapogon kauderni': 'Cardinal de Banggai',
  'Chrysiptera cyanea': 'Donzela Azul',
  'Gobiodon okinawae': 'Gobi Citron',
  'Rhinecanthus aculeatus': 'Peixe Gatilho Picasso',
  'Siganus vulpinus': 'Peixe Raposa',
  'Valenciennea strigata': 'Gobi de Areia',
  'Assessor flavissimus': 'Assessor Amarelo',
  'Hemianthus callitrichoides': 'Cuba / HC',
  'Anubias barteri': 'Anubia',
  'Bucephalandra sp.': 'Bucephalandra',
  'Staurogyne repens': 'Staurogyne',
  'Pogostemon erectus': 'Pogostemon Erectus',
  'Limnophila sessiliflora': 'Ambulia',
  'Microsorum pteropus': 'Samambaia de Java',
  'Vesicularia dubyana': 'Musgo de Java',
}

async function main() {
  console.log('Enriquecendo nomes populares...\n')
  const cache = loadCache()

  const files: { path: string; type: string }[] = [
    { path: 'fish-agua-doce.ts', type: 'Fish' },
    { path: 'fish-agua-salgada.ts', type: 'Fish' },
    { path: 'fish-invertebrados-agua-doce.ts', type: 'Fish' },
    { path: 'fish-invertebrados-agua-salgada.ts', type: 'Fish' },
    { path: 'plants.ts', type: 'Plant' },
    { path: 'corals.ts', type: 'Coral' },
  ]

  let updated = 0
  let skipped = 0
  let notFound = 0

  for (const file of files) {
    const filePath = join(DATA_DIR, file.path)
    if (!existsSync(filePath)) continue

    const records = extractRecords(filePath)
    let fileUpdated = false

    console.log(`\nProcessando ${file.path}...`)

    for (const record of records) {
      if (!needsName(record)) {
        skipped++
        continue
      }

      const sci = (record.nomeCientifico || '').trim()
      if (!sci) { skipped++; continue }

      // Checar nomes conhecidos primeiro
      if (knownNames[sci]) {
        console.log(`  ${sci} -> ${knownNames[sci]} (local)`)
        record.nomePopular = knownNames[sci]
        updated++
        fileUpdated = true
        continue
      }

      // Checar cache
      if (cache[sci]) {
        console.log(`  ${sci} -> ${cache[sci]} (cache)`)
        record.nomePopular = cache[sci]
        updated++
        fileUpdated = true
        continue
      }

      // Buscar na API
      console.log(`  Buscando: ${sci}`)
      const name = await getVernacularName(sci)
      await sleep(DELAY_MS)

      if (name) {
        console.log(`    -> ${name}`)
        cache[sci] = name
        record.nomePopular = name
        updated++
        fileUpdated = true
      } else {
        console.log(`    -> (nao encontrado)`)
        notFound++
      }
    }

    if (fileUpdated) {
      writeRecords(filePath, records, file.type)
    }
    saveCache(cache)
  }

  console.log(`\n--- Resumo ---`)
  console.log(`  Atualizados: ${updated}`)
  console.log(`  Ja tinham nome: ${skipped}`)
  console.log(`  Nao encontrados: ${notFound}`)
}

main().catch(console.error)
