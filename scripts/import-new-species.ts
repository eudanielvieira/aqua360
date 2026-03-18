import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const WISHLIST_FILE = join(__dirname, 'species-wishlist.json')
const DATA_DIR = join(__dirname, '../src/data')
const DELAY_MS = 600

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

function extractRecords(filePath: string): any[] {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/const data: (?:Fish|Plant)\[\] = (\[[\s\S]*?\])\n\nexport/)
  if (!match) return []
  return JSON.parse(match[1])
}

function writeRecords(filePath: string, records: any[], typeName: string) {
  const content = `import type { ${typeName} } from '../types'\n\nconst data: ${typeName}[] = ${JSON.stringify(records, null, 2)}\n\nexport default data\n`
  writeFileSync(filePath, content)
}

function getExistingNames(records: any[]): Set<string> {
  const names = new Set<string>()
  for (const r of records) {
    if (r.nomeCientifico) names.add(r.nomeCientifico.toLowerCase())
  }
  return names
}

function getMaxId(records: any[]): number {
  return records.reduce((max: number, r: any) => Math.max(max, r.id || 0), 0)
}

async function queryGBIF(name: string) {
  const data = await fetchJSON(
    `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}&strict=true`
  )
  if (!data || !data.usageKey || data.matchType === 'NONE') return null

  return {
    gbifTaxonKey: data.usageKey,
    taxonomia: {
      reino: data.kingdom || '',
      filo: data.phylum || '',
      classe: data.class || '',
      ordem: data.order || '',
      familia: data.family || '',
      genero: data.genus || '',
      especie: data.species || '',
    },
    vernacularName: '',
    family: data.family || '',
  }
}

async function queryINatPhotos(name: string): Promise<string[]> {
  const data = await fetchJSON(
    `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(name)}&per_page=3&quality_grade=research&photos=true&order=desc&order_by=votes`
  )
  if (!data?.results) return []

  const urls: string[] = []
  for (const obs of data.results) {
    if (obs.photos?.[0]?.url) {
      urls.push(obs.photos[0].url.replace('square', 'medium'))
    }
  }
  return urls.slice(0, 3)
}

async function main() {
  const wishlist = JSON.parse(readFileSync(WISHLIST_FILE, 'utf-8'))

  const fishFiles: Record<string, string> = {
    'peixes-agua-doce': 'fish-agua-doce.ts',
    'peixes-agua-salgada': 'fish-agua-salgada.ts',
  }

  let totalAdded = 0
  let totalSkipped = 0

  for (const [category, fileName] of Object.entries(fishFiles)) {
    const speciesList = wishlist[category] as string[] | undefined
    if (!speciesList || speciesList.length === 0) continue

    const filePath = join(DATA_DIR, fileName)
    if (!existsSync(filePath)) continue

    const records = extractRecords(filePath)
    const existingNames = getExistingNames(records)
    let nextId = getMaxId(records) + 1

    console.log(`\nProcessando ${category} (${fileName})...`)

    for (const name of speciesList) {
      if (existingNames.has(name.toLowerCase())) {
        console.log(`  Ignorado (já existe): ${name}`)
        totalSkipped++
        continue
      }

      console.log(`  Importando: ${name}`)
      const gbif = await queryGBIF(name)
      await sleep(DELAY_MS)

      const photos = await queryINatPhotos(name)
      await sleep(DELAY_MS)

      const newRecord: any = {
        id: nextId++,
        alimentacao: '',
        caracteristica: '',
        comportamento: '',
        diformismoSexual: '',
        familia: gbif?.family || '',
        gh: '',
        imagem: '',
        kh: '',
        nomeCientifico: gbif?.taxonomia.especie || name,
        nomePopular: name.split(' ').pop() || name,
        origem: '',
        outrasInformacoes: '',
        outrosNome: '',
        ph: '',
        posicaoAquario: '',
        reproducao: '',
        tamanhoAdulto: '',
        temperatura: '',
        tipo: category === 'peixes-agua-doce' ? 'PEIXESDULCICOLAS' : 'PEIXESMARINHOS',
        subTipo: '',
        fonte: '',
      }

      if (gbif || photos.length > 0) {
        newRecord.enrichment = {
          ...(gbif?.gbifTaxonKey && { gbifTaxonKey: gbif.gbifTaxonKey }),
          ...(gbif?.taxonomia && { taxonomia: gbif.taxonomia }),
          ...(photos.length > 0 && { inatPhotoUrls: photos }),
          enrichedAt: new Date().toISOString(),
        }
      }

      records.push(newRecord)
      totalAdded++
    }

    writeRecords(filePath, records, 'Fish')
  }

  // Plantas
  const plantSpecies = wishlist['plantas'] as string[] | undefined
  if (plantSpecies && plantSpecies.length > 0) {
    const filePath = join(DATA_DIR, 'plants.ts')
    if (existsSync(filePath)) {
      const records = extractRecords(filePath)
      const existingNames = getExistingNames(records)
      let nextId = getMaxId(records) + 1

      console.log(`\nProcessando plantas...`)

      for (const name of plantSpecies) {
        if (existingNames.has(name.toLowerCase())) {
          console.log(`  Ignorado (já existe): ${name}`)
          totalSkipped++
          continue
        }

        console.log(`  Importando: ${name}`)
        const gbif = await queryGBIF(name)
        await sleep(DELAY_MS)

        const photos = await queryINatPhotos(name)
        await sleep(DELAY_MS)

        const newRecord: any = {
          id: nextId++,
          co2: '',
          crescimento: '',
          dificuldade: '',
          estrutura: '',
          familia: gbif?.family || '',
          iluminacao: '',
          imagem: '',
          nomeCientifico: gbif?.taxonomia.especie || name,
          nomePopular: name.split(' ').pop() || name,
          origem: '',
          outrosNome: '',
          ph: '',
          plantio: '',
          porte: '',
          posicao: '',
          reproducao: '',
          substratoFertil: '',
          suportaEmersao: '',
          tamanho: '',
          temperatura: '',
          fonte: '',
        }

        if (gbif || photos.length > 0) {
          newRecord.enrichment = {
            ...(gbif?.gbifTaxonKey && { gbifTaxonKey: gbif.gbifTaxonKey }),
            ...(gbif?.taxonomia && { taxonomia: gbif.taxonomia }),
            ...(photos.length > 0 && { inatPhotoUrls: photos }),
            enrichedAt: new Date().toISOString(),
          }
        }

        records.push(newRecord)
        totalAdded++
      }

      writeRecords(filePath, records, 'Plant')
    }
  }

  console.log(`\n--- Resumo ---`)
  console.log(`  Adicionados: ${totalAdded}`)
  console.log(`  Ignorados (já existem): ${totalSkipped}`)
}

main().catch(console.error)
