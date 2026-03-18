import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DELAY_MS = 400
function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }
async function fetchJSON(url: string): Promise<any> {
  try { const r = await fetch(url, { headers: { Accept: 'application/json' } }); if (!r.ok) return null; return r.json() } catch { return null }
}

function cleanName(name: string): string[] {
  const names = [name]
  // Remove var., sp., etc
  const base = name.replace(/\s*var\.\s*\w+/i, '').replace(/\s*sp\.\s*\w*/i, '').replace(/\([^)]+\)/g, '').trim()
  if (base !== name && base.length > 3) names.push(base)
  // Genero
  const genus = name.split(' ')[0]
  if (genus.length >= 4 && !names.includes(genus)) names.push(genus)
  return names
}

async function getPhotos(name: string): Promise<string[]> {
  const attempts = cleanName(name)
  for (const attempt of attempts) {
    const inat = await fetchJSON(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(attempt)}&per_page=3&quality_grade=research&photos=true&order=desc&order_by=votes`)
    await sleep(DELAY_MS)
    const photos: string[] = []
    if (inat?.results) {
      for (const obs of inat.results) if (obs.photos?.[0]?.url) photos.push(obs.photos[0].url.replace('square', 'medium'))
    }
    if (photos.length > 0) return photos.slice(0, 3)
  }

  // Tentar pelo nome popular
  const inat2 = await fetchJSON(`https://api.inaturalist.org/v1/observations?q=${encodeURIComponent(name.split('|')[0].split('/')[0].trim())}&per_page=3&photos=true&order=desc&order_by=votes`)
  await sleep(DELAY_MS)
  const photos2: string[] = []
  if (inat2?.results) {
    for (const obs of inat2.results) if (obs.photos?.[0]?.url) photos2.push(obs.photos[0].url.replace('square', 'medium'))
  }
  return photos2.slice(0, 3)
}

async function fixFile(filePath: string, typeName: string) {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(new RegExp(`const data: ${typeName}\\[\\] = (\\[[\\s\\S]*?\\])\\n\\nexport`))
  if (!match) return 0
  const data = JSON.parse(match[1])
  let fixed = 0

  for (const record of data) {
    if (record.enrichment?.inatPhotoUrls?.length > 0) continue
    if (record.imagem) continue

    const sci = record.nomeCientifico || ''
    const pop = record.nomePopular || record.nome || ''
    if (!sci && !pop) continue

    console.log(`  ${pop} (${sci})`)
    let photos = await getPhotos(sci)
    if (photos.length === 0 && pop) photos = await getPhotos(pop)

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
  const dir = join(__dirname, '../src/data')
  let total = 0

  console.log('--- Peixes Agua Doce ---')
  total += await fixFile(join(dir, 'fish-agua-doce.ts'), 'Fish')
  console.log('\n--- Invertebrados Marinhos ---')
  total += await fixFile(join(dir, 'fish-invertebrados-agua-salgada.ts'), 'Fish')
  console.log('\n--- Plantas ---')
  total += await fixFile(join(dir, 'plants.ts'), 'Plant')
  console.log('\n--- Corais ---')
  total += await fixFile(join(dir, 'corals.ts'), 'Coral')

  console.log(`\nTotal corrigido: ${total}`)
}

main().catch(console.error)
