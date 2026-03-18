import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DELAY_MS = 300
function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }

async function fetchJSON(url: string): Promise<any> {
  try {
    const r = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Aqua360/1.0 (aquarium guide)' } })
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}

async function getWikimediaPhoto(scientificName: string): Promise<string | null> {
  // 1. Wikipedia REST API - summary com thumbnail
  const encoded = encodeURIComponent(scientificName.replace(/ /g, '_'))
  const wiki = await fetchJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`)
  await sleep(DELAY_MS)

  if (wiki?.thumbnail?.source) {
    // Pegar versão maior (trocar tamanho no URL)
    return wiki.thumbnail.source.replace(/\/\d+px-/, '/800px-')
  }

  // 2. Tentar sem variante (var., sp.)
  const baseName = scientificName.replace(/\s*var\.\s*\w+/i, '').replace(/\s*sp\.\s*\w*/i, '').replace(/\([^)]+\)/g, '').trim()
  if (baseName !== scientificName && baseName.length > 3) {
    const encoded2 = encodeURIComponent(baseName.replace(/ /g, '_'))
    const wiki2 = await fetchJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded2}`)
    await sleep(DELAY_MS)
    if (wiki2?.thumbnail?.source) {
      return wiki2.thumbnail.source.replace(/\/\d+px-/, '/800px-')
    }
  }

  // 3. Tentar genero
  const genus = scientificName.split(' ')[0]
  if (genus.length >= 4 && genus !== baseName) {
    const encoded3 = encodeURIComponent(genus)
    const wiki3 = await fetchJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded3}`)
    await sleep(DELAY_MS)
    if (wiki3?.thumbnail?.source) {
      return wiki3.thumbnail.source.replace(/\/\d+px-/, '/800px-')
    }
  }

  return null
}

async function processFile(filePath: string, typeName: string): Promise<number> {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(new RegExp(`const data: ${typeName}\\[\\] = (\\[[\\s\\S]*?\\])\\n\\nexport`))
  if (!match) return 0

  const data = JSON.parse(match[1])
  let updated = 0

  for (const record of data) {
    const sci = record.nomeCientifico || ''
    if (!sci) continue

    // Pular se ja tem foto do wikimedia
    const currentPhotos = record.enrichment?.wikiPhotoUrl
    if (currentPhotos) continue

    console.log(`  ${record.nomePopular || sci}`)
    const url = await getWikimediaPhoto(sci)

    if (url) {
      if (!record.enrichment) record.enrichment = { enrichedAt: new Date().toISOString() }
      record.enrichment.wikiPhotoUrl = url
      console.log(`    -> OK`)
      updated++
    } else {
      console.log(`    -> sem foto`)
    }
  }

  writeFileSync(filePath, `import type { ${typeName} } from '../types'\n\nconst data: ${typeName}[] = ${JSON.stringify(data, null, 2)}\n\nexport default data\n`)
  return updated
}

async function main() {
  console.log('Buscando fotos do Wikimedia...\n')
  const dir = join(__dirname, '../src/data')
  let total = 0

  const files: [string, string][] = [
    ['fish-agua-doce.ts', 'Fish'],
    ['fish-agua-salgada.ts', 'Fish'],
    ['fish-invertebrados-agua-doce.ts', 'Fish'],
    ['fish-invertebrados-agua-salgada.ts', 'Fish'],
    ['plants.ts', 'Plant'],
    ['corals.ts', 'Coral'],
  ]

  for (const [file, type] of files) {
    console.log(`\n--- ${file} ---`)
    total += await processFile(join(dir, file), type)
  }

  console.log(`\nTotal com foto Wikimedia: ${total}`)
}

main().catch(console.error)
