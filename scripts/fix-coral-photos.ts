import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DATA_FILE = join(__dirname, '../src/data/corals.ts')
const DELAY_MS = 600

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJSON(url: string): Promise<any> {
  try {
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}

// Nomes mais especificos para buscar fotos melhores
const searchNames: Record<string, string> = {
  'Zoanthus sp.': 'Zoanthus',
  'Palythoa sp.': 'Palythoa',
  'Discosoma sp.': 'Discosoma',
  'Xenia sp.': 'Xenia',
  'Sarcophyton sp.': 'Sarcophyton',
  'Sinularia sp.': 'Sinularia',
  'Dipsastraea sp.': 'Favia',
  'Goniopora sp.': 'Goniopora',
  'Acropora sp.': 'Acropora millepora',
  'Montipora sp.': 'Montipora capricornis',
}

async function getPhotos(name: string): Promise<string[]> {
  const searchName = searchNames[name] || name

  // Tentar iNaturalist com nome generico do genero
  const inat = await fetchJSON(
    `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(searchName)}&per_page=3&quality_grade=research&photos=true&order=desc&order_by=votes`
  )

  const photos: string[] = []
  if (inat?.results) {
    for (const obs of inat.results) {
      if (obs.photos?.[0]?.url) {
        photos.push(obs.photos[0].url.replace('square', 'medium'))
      }
    }
  }

  return photos.slice(0, 3)
}

async function main() {
  const content = readFileSync(DATA_FILE, 'utf-8')
  const match = content.match(/const data: Coral\[\] = (\[[\s\S]*?\])\n\nexport/)
  if (!match) { console.log('Erro ao ler dados'); return }

  const data = JSON.parse(match[1])
  let fixed = 0

  for (const coral of data) {
    const hasPhoto = coral.enrichment?.inatPhotoUrls?.length > 0
    if (hasPhoto) continue

    console.log(`Buscando fotos: ${coral.nomePopular} (${coral.nomeCientifico})`)
    const photos = await getPhotos(coral.nomeCientifico)
    await sleep(DELAY_MS)

    if (photos.length > 0) {
      if (!coral.enrichment) coral.enrichment = {}
      coral.enrichment.inatPhotoUrls = photos
      coral.enrichment.enrichedAt = new Date().toISOString()
      console.log(`  -> ${photos.length} fotos encontradas`)
      fixed++
    } else {
      console.log(`  -> nenhuma foto`)
    }
  }

  const output = `import type { Coral } from '../types'\n\nconst data: Coral[] = ${JSON.stringify(data, null, 2)}\n\nexport default data\n`
  writeFileSync(DATA_FILE, output)

  console.log(`\nCorrigidos: ${fixed}`)
}

main().catch(console.error)
