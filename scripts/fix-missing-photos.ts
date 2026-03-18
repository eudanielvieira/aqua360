import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

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

async function getPhotos(name: string): Promise<string[]> {
  // Tentar nome completo
  let inat = await fetchJSON(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(name)}&per_page=3&quality_grade=research&photos=true&order=desc&order_by=votes`)
  await sleep(DELAY_MS)

  let photos: string[] = []
  if (inat?.results) {
    for (const obs of inat.results) if (obs.photos?.[0]?.url) photos.push(obs.photos[0].url.replace('square', 'medium'))
  }

  if (photos.length > 0) return photos.slice(0, 3)

  // Tentar genero (primeira palavra)
  const genus = name.split(' ')[0].replace(/[^a-zA-Z]/g, '')
  if (genus.length >= 4) {
    inat = await fetchJSON(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(genus)}&per_page=3&quality_grade=research&photos=true&order=desc&order_by=votes`)
    await sleep(DELAY_MS)
    if (inat?.results) {
      for (const obs of inat.results) if (obs.photos?.[0]?.url) photos.push(obs.photos[0].url.replace('square', 'medium'))
    }
  }

  return photos.slice(0, 3)
}

async function fixFile(filePath: string, typeName: string) {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(new RegExp(`const data: ${typeName}\\[\\] = (\\[[\\s\\S]*?\\])\\n\\nexport`))
  if (!match) return 0

  const data = JSON.parse(match[1])
  let fixed = 0

  for (const record of data) {
    if (record.enrichment?.inatPhotoUrls?.length > 0) continue

    const name = record.nomeCientifico || record.nomePopular || ''
    if (!name) continue

    console.log(`  Buscando: ${name}`)
    const photos = await getPhotos(name)

    if (photos.length > 0) {
      if (!record.enrichment) record.enrichment = { enrichedAt: new Date().toISOString() }
      record.enrichment.inatPhotoUrls = photos
      console.log(`    -> ${photos.length} fotos`)
      fixed++
    } else {
      console.log(`    -> sem foto`)
    }
  }

  writeFileSync(filePath, `import type { ${typeName} } from '../types'\n\nconst data: ${typeName}[] = ${JSON.stringify(data, null, 2)}\n\nexport default data\n`)
  return fixed
}

async function main() {
  console.log('Buscando fotos faltantes...\n')

  const dir = join(__dirname, '../src/data')
  let total = 0

  console.log('--- Plantas ---')
  total += await fixFile(join(dir, 'plants.ts'), 'Plant')

  console.log('\n--- Invertebrados Marinhos ---')
  total += await fixFile(join(dir, 'fish-invertebrados-agua-salgada.ts'), 'Fish')

  console.log(`\nTotal corrigido: ${total}`)
}

main().catch(console.error)
