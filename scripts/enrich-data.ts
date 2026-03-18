import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const CACHE_FILE = join(__dirname, '.enrichment-cache.json')
const DATA_DIR = join(__dirname, '../src/data')
const DELAY_MS = 600

type CacheEntry = {
  gbifTaxonKey?: number
  wormsAphiaId?: number
  taxonomia?: {
    reino: string
    filo: string
    classe: string
    ordem: string
    familia: string
    genero: string
    especie: string
  }
  inatPhotoUrls?: string[]
  inatObservationCount?: number
  gbifOccurrenceCount?: number
  enrichedAt: string
  failed?: boolean
}

type Cache = Record<string, CacheEntry>

function loadCache(): Cache {
  if (existsSync(CACHE_FILE)) {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'))
  }
  return {}
}

function saveCache(cache: Cache) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJSON(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  })
  if (!response.ok) return null
  return response.json()
}

async function queryGBIF(name: string): Promise<{
  taxonKey?: number
  taxonomia?: CacheEntry['taxonomia']
  occurrenceCount?: number
}> {
  const data = await fetchJSON(
    `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}&strict=true`
  )
  if (!data || !data.usageKey || data.matchType === 'NONE') return {}

  const taxonomia = {
    reino: data.kingdom || '',
    filo: data.phylum || '',
    classe: data.class || '',
    ordem: data.order || '',
    familia: data.family || '',
    genero: data.genus || '',
    especie: data.species || '',
  }

  let occurrenceCount = 0
  await sleep(DELAY_MS)
  const occ = await fetchJSON(
    `https://api.gbif.org/v1/occurrence/search?taxonKey=${data.usageKey}&hasCoordinate=true&limit=0`
  )
  if (occ && occ.count) {
    occurrenceCount = occ.count
  }

  return { taxonKey: data.usageKey, taxonomia, occurrenceCount }
}

async function queryWoRMS(name: string): Promise<number | undefined> {
  const data = await fetchJSON(
    `https://www.marinespecies.org/rest/AphiaRecordsByName/${encodeURIComponent(name)}?like=false&marine_only=false`
  )
  if (!data || !Array.isArray(data) || data.length === 0) return undefined
  const accepted = data.find((r: any) => r.status === 'accepted') || data[0]
  return accepted?.AphiaID
}

async function queryINaturalist(name: string): Promise<{
  photoUrls: string[]
  observationCount: number
}> {
  const data = await fetchJSON(
    `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(name)}&per_page=3&quality_grade=research&photos=true&order=desc&order_by=votes`
  )
  if (!data || !data.results) return { photoUrls: [], observationCount: 0 }

  const photoUrls: string[] = []
  for (const obs of data.results) {
    if (obs.photos && obs.photos.length > 0) {
      const url = obs.photos[0].url
      if (url) {
        photoUrls.push(url.replace('square', 'medium'))
      }
    }
  }

  return {
    photoUrls: photoUrls.slice(0, 3),
    observationCount: data.total_results || 0,
  }
}

interface DataRecord {
  id: number
  nomeCientifico: string
  enrichment?: any
  [key: string]: any
}

function extractRecords(filePath: string): DataRecord[] {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/const data: (?:Fish|Plant)\[\] = (\[[\s\S]*?\])\n\nexport/)
  if (!match) return []
  return JSON.parse(match[1])
}

function writeRecords(filePath: string, records: DataRecord[], typeName: string) {
  const content = `import type { ${typeName} } from '../types'\n\nconst data: ${typeName}[] = ${JSON.stringify(records, null, 2)}\n\nexport default data\n`
  writeFileSync(filePath, content)
}

async function enrichRecord(name: string, cache: Cache): Promise<CacheEntry> {
  if (cache[name] && cache[name].enrichedAt && !cache[name].failed) {
    return cache[name]
  }

  console.log(`  Enriquecendo: ${name}`)
  const entry: CacheEntry = { enrichedAt: new Date().toISOString() }

  try {
    const gbif = await queryGBIF(name)
    if (gbif.taxonKey) {
      entry.gbifTaxonKey = gbif.taxonKey
      entry.taxonomia = gbif.taxonomia
      entry.gbifOccurrenceCount = gbif.occurrenceCount
    }
    await sleep(DELAY_MS)

    const aphiaId = await queryWoRMS(name)
    if (aphiaId) {
      entry.wormsAphiaId = aphiaId
    }
    await sleep(DELAY_MS)

    const inat = await queryINaturalist(name)
    if (inat.photoUrls.length > 0) {
      entry.inatPhotoUrls = inat.photoUrls
    }
    entry.inatObservationCount = inat.observationCount
    await sleep(DELAY_MS)
  } catch (err) {
    console.log(`    ERRO: ${(err as Error).message}`)
    entry.failed = true
  }

  cache[name] = entry
  return entry
}

async function processFile(filePath: string, typeName: string, cache: Cache): Promise<{ enriched: number, skipped: number, failed: number }> {
  const records = extractRecords(filePath)
  let enriched = 0
  let skipped = 0
  let failed = 0

  for (const record of records) {
    const name = record.nomeCientifico?.trim()
    if (!name || name.length < 3) {
      skipped++
      continue
    }

    const entry = await enrichRecord(name, cache)

    if (entry.failed) {
      failed++
      continue
    }

    const enrichment: any = {}
    if (entry.gbifTaxonKey) enrichment.gbifTaxonKey = entry.gbifTaxonKey
    if (entry.wormsAphiaId) enrichment.wormsAphiaId = entry.wormsAphiaId
    if (entry.taxonomia) enrichment.taxonomia = entry.taxonomia
    if (entry.inatPhotoUrls && entry.inatPhotoUrls.length > 0) enrichment.inatPhotoUrls = entry.inatPhotoUrls
    if (entry.inatObservationCount) enrichment.inatObservationCount = entry.inatObservationCount
    if (entry.gbifOccurrenceCount) enrichment.gbifOccurrenceCount = entry.gbifOccurrenceCount
    enrichment.enrichedAt = entry.enrichedAt

    if (Object.keys(enrichment).length > 1) {
      record.enrichment = enrichment
      enriched++
    } else {
      skipped++
    }
  }

  writeRecords(filePath, records, typeName)
  return { enriched, skipped, failed }
}

async function main() {
  console.log('Iniciando enriquecimento de dados...\n')
  const cache = loadCache()

  const fishFiles = [
    'fish-agua-doce.ts',
    'fish-agua-salgada.ts',
    'fish-invertebrados-agua-doce.ts',
    'fish-invertebrados-agua-salgada.ts',
  ]

  let totalEnriched = 0
  let totalSkipped = 0
  let totalFailed = 0

  for (const file of fishFiles) {
    const filePath = join(DATA_DIR, file)
    if (!existsSync(filePath)) continue
    console.log(`\nProcessando ${file}...`)
    const result = await processFile(filePath, 'Fish', cache)
    totalEnriched += result.enriched
    totalSkipped += result.skipped
    totalFailed += result.failed
    saveCache(cache)
  }

  const plantsPath = join(DATA_DIR, 'plants.ts')
  if (existsSync(plantsPath)) {
    console.log(`\nProcessando plants.ts...`)
    const result = await processFile(plantsPath, 'Plant', cache)
    totalEnriched += result.enriched
    totalSkipped += result.skipped
    totalFailed += result.failed
    saveCache(cache)
  }

  console.log(`\n--- Resumo ---`)
  console.log(`  Enriquecidos: ${totalEnriched}`)
  console.log(`  Ignorados: ${totalSkipped}`)
  console.log(`  Falhas: ${totalFailed}`)
  console.log(`  Cache salvo em: ${CACHE_FILE}`)
}

main().catch(console.error)
