import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DELAY_MS = 500
function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }
async function fetchJSON(url: string): Promise<any> {
  try { const r = await fetch(url, { headers: { Accept: 'application/json' } }); if (!r.ok) return null; return r.json() } catch { return null }
}

async function getUniquePhotos(name: string, offset: number): Promise<string[]> {
  // Buscar com offset para pegar fotos diferentes
  const inat = await fetchJSON(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(name)}&per_page=1&page=${offset + 1}&quality_grade=research&photos=true&order=desc&order_by=votes`)
  await sleep(DELAY_MS)
  const photos: string[] = []
  if (inat?.results) {
    for (const obs of inat.results) if (obs.photos?.[0]?.url) photos.push(obs.photos[0].url.replace('square', 'medium'))
  }
  return photos
}

async function main() {
  const filePath = join(__dirname, '../src/data/plants.ts')
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/const data: Plant\[\] = (\[[\s\S]*?\])\n\nexport/)
  if (!match) return
  const data = JSON.parse(match[1])

  // Encontrar URLs duplicadas
  const urlToRecords: Record<string, any[]> = {}
  for (const d of data) {
    const url = d.enrichment?.inatPhotoUrls?.[0]
    if (!url) continue
    if (!urlToRecords[url]) urlToRecords[url] = []
    urlToRecords[url].push(d)
  }

  let fixed = 0
  for (const [url, records] of Object.entries(urlToRecords)) {
    if (records.length <= 1) continue

    console.log(`\nDuplicada (${records.length}x): ${records.map(r => r.nomePopular).join(', ')}`)

    // Manter a primeira, buscar novas para as demais
    for (let i = 1; i < records.length; i++) {
      const record = records[i]
      const sci = record.nomeCientifico || ''

      // Tentar nome completo com offset
      console.log(`  Buscando para: ${record.nomePopular} (${sci})`)
      let photos = await getUniquePhotos(sci, i * 3)

      // Se nao achou ou achou a mesma, tentar com nome popular
      if (photos.length === 0 || photos[0] === url) {
        photos = await getUniquePhotos(record.nomePopular, i * 2)
      }

      // Se ainda é a mesma, tentar com offset maior
      if (photos.length > 0 && photos[0] === url) {
        photos = await getUniquePhotos(sci.split(' ')[0], i * 5 + 10)
      }

      if (photos.length > 0 && photos[0] !== url) {
        record.enrichment.inatPhotoUrls = photos
        console.log(`    -> nova foto encontrada`)
        fixed++
      } else {
        console.log(`    -> mantendo (sem alternativa)`)
      }
    }
  }

  writeFileSync(filePath, `import type { Plant } from '../types'\n\nconst data: Plant[] = ${JSON.stringify(data, null, 2)}\n\nexport default data\n`)
  console.log(`\nTotal corrigido: ${fixed}`)
}

main().catch(console.error)
