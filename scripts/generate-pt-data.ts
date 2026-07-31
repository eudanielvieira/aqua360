// Usage: bun run scripts/generate-pt-data.ts
//
// Extracts translatable fields from species data files
// and writes them as JSON locale files under public/locales/pt-BR/

import { resolve } from 'path'
import type { Fish, Plant, Coral, Disease } from '../src/types'
import { speciesKey, translatableFields, type TranslatableType } from '../src/translatable-fields'

const ROOT = resolve(import.meta.dir, '..')
const LOCALE_DIR = resolve(ROOT, 'public/locales/pt-BR')

// -- Helpers --

function pick(obj: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const field of fields) {
    const value = obj[field]
    if (value !== undefined && value !== null && value !== '') {
      result[field] = value
    }
  }
  return result
}

/**
 * Indexa pelo `speciesKey`, nao pelo id cru. Peixe mora em quatro arquivos com
 * numeracao propria e 92 ids existem em mais de um: chavear so pelo id fazia a
 * ficha seguinte sobrescrever a anterior, e 92 fichas sumiam da traducao.
 */
function buildLocaleMap<T extends { id: number; tipo?: string }>(
  items: T[],
  type: TranslatableType,
): Record<string, Record<string, unknown>> {
  const map: Record<string, Record<string, unknown>> = {}
  for (const item of items) {
    const picked = pick(item as unknown as Record<string, unknown>, translatableFields[type])
    if (Object.keys(picked).length === 0) continue

    const key = speciesKey(item, type)
    if (map[key]) {
      throw new Error(`Chave repetida em ${type}: ${key}. O acervo tem duas fichas com a mesma chave.`)
    }
    map[key] = picked
  }
  return map
}

async function writeLocale(filename: string, data: Record<string, unknown>): Promise<void> {
  const path = resolve(LOCALE_DIR, filename)
  const json = JSON.stringify(data, null, 2) + '\n'
  await Bun.write(path, json)
  const count = Object.keys(data).length
  console.log(`Wrote ${count} entries to ${filename}`)
}

// -- Main --

async function main() {
  console.log('Loading species data...\n')

  // Import all fish data
  const fishAguaDoce: Fish[] = (await import('../src/data/fish-agua-doce')).default
  const fishAguaSalgada: Fish[] = (await import('../src/data/fish-agua-salgada')).default
  const fishInvertebradosAguaDoce: Fish[] = (await import('../src/data/fish-invertebrados-agua-doce')).default
  const fishInvertebradosAguaSalgada: Fish[] = (await import('../src/data/fish-invertebrados-agua-salgada')).default

  const allFish = [
    ...fishAguaDoce,
    ...fishAguaSalgada,
    ...fishInvertebradosAguaDoce,
    ...fishInvertebradosAguaSalgada,
  ]

  // Import plants, corals, diseases
  const plants: Plant[] = (await import('../src/data/plants')).default
  const corals: Coral[] = (await import('../src/data/corals')).default
  const diseases: Disease[] = (await import('../src/data/diseases')).default

  console.log(`Fish: ${allFish.length} species`)
  console.log(`Plants: ${plants.length} species`)
  console.log(`Corals: ${corals.length} species`)
  console.log(`Diseases: ${diseases.length} entries\n`)

  // Build locale maps
  const fishMap = buildLocaleMap(allFish, 'fish')
  const plantMap = buildLocaleMap(plants, 'plant')
  const coralMap = buildLocaleMap(corals, 'coral')
  const diseaseMap = buildLocaleMap(diseases, 'disease')

  // Write locale files
  await writeLocale('data-fish.json', fishMap)
  await writeLocale('data-plants.json', plantMap)
  await writeLocale('data-corals.json', coralMap)
  await writeLocale('data-diseases.json', diseaseMap)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
