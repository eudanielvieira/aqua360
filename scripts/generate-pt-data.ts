// Usage: bun run scripts/generate-pt-data.ts
//
// Extracts translatable fields from species data files
// and writes them as JSON locale files under public/locales/pt-BR/

import { resolve } from 'path'
import type { Fish, Plant, Coral, Disease } from '../src/types'

const ROOT = resolve(import.meta.dir, '..')
const LOCALE_DIR = resolve(ROOT, 'public/locales/pt-BR')

// -- Field definitions per data type --

const FISH_TRANSLATABLE_FIELDS: (keyof Fish)[] = [
  'nomePopular',
  'alimentacao',
  'caracteristica',
  'comportamento',
  'diformismoSexual',
  'origem',
  'outrasInformacoes',
  'outrosNome',
  'posicaoAquario',
  'reproducao',
]

const PLANT_TRANSLATABLE_FIELDS: (keyof Plant)[] = [
  'nomePopular',
  'outrosNome',
  'origem',
  'reproducao',
  'co2',
  'crescimento',
  'dificuldade',
  'estrutura',
  'plantio',
  'porte',
  'posicao',
  'substratoFertil',
  'suportaEmersao',
]

const CORAL_TRANSLATABLE_FIELDS: (keyof Coral)[] = [
  'nomePopular',
  'outrosNome',
  'origem',
  'alimentacao',
  'compatibilidade',
  'descricao',
  'coloracao',
  'iluminacao',
  'fluxoAgua',
  'dificuldade',
  'crescimento',
]

const DISEASE_TRANSLATABLE_FIELDS: (keyof Disease)[] = [
  'nome',
  'causa',
  'tratamento',
  'sintoma',
]

// -- Helpers --

function pick<T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const field of fields) {
    const value = obj[field]
    if (value !== undefined && value !== null && value !== '') {
      result[field as string] = value
    }
  }
  return result
}

function buildLocaleMap<T extends { id: number }>(
  items: T[],
  fields: (keyof T)[],
): Record<string, Record<string, unknown>> {
  const map: Record<string, Record<string, unknown>> = {}
  for (const item of items) {
    const picked = pick(item, fields)
    if (Object.keys(picked).length > 0) {
      map[String(item.id)] = picked
    }
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
  const fishMap = buildLocaleMap(allFish, FISH_TRANSLATABLE_FIELDS)
  const plantMap = buildLocaleMap(plants, PLANT_TRANSLATABLE_FIELDS)
  const coralMap = buildLocaleMap(corals, CORAL_TRANSLATABLE_FIELDS)
  const diseaseMap = buildLocaleMap(diseases, DISEASE_TRANSLATABLE_FIELDS)

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
