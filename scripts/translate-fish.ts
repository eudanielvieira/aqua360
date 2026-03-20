// Usage: ANTHROPIC_API_KEY=sk-... bun run scripts/translate-fish.ts
//
// Translates fish data from pt-BR to en, es, ja using Claude API.
// Uses a cache file to avoid re-translating already done entries.
// Writes results to public/locales/{locale}/data-fish.json

import Anthropic from '@anthropic-ai/sdk'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dir, '..')
const LOCALES_DIR = resolve(ROOT, 'public/locales')
const CACHE_FILE = resolve(import.meta.dir, '.translate-fish-cache.json')

const BATCH_SIZE = 20
const TARGET_LOCALES = ['en', 'es', 'ja'] as const
type Locale = (typeof TARGET_LOCALES)[number]

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish',
  ja: 'Japanese',
}

const client = new Anthropic()

// -- Cache --

type Cache = Record<string, Record<string, Record<string, string>>>

async function loadCache(): Promise<Cache> {
  try {
    const file = Bun.file(CACHE_FILE)
    if (await file.exists()) {
      return await file.json()
    }
  } catch {
    // ignore
  }
  return {}
}

async function saveCache(cache: Cache): Promise<void> {
  await Bun.write(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n')
}

// -- Translation --

async function translateBatch(
  entries: Record<string, Record<string, string>>,
  locale: Locale,
): Promise<Record<string, Record<string, string>>> {
  const langName = LOCALE_NAMES[locale]

  const prompt = `Translate the following aquarium fish data from Brazilian Portuguese to ${langName}.

RULES:
- Keep the JSON structure and keys exactly the same (keys are in Portuguese, only translate VALUES)
- "nomePopular" should be the common name used in ${langName}-speaking countries
- "origem" (origin) should use standard geographic names in ${langName}
- "posicaoAquario" (aquarium position) should be translated naturally
- Keep scientific names unchanged when they appear
- For Japanese, use natural Japanese text (not romaji)
- Return ONLY valid JSON, no markdown fences

INPUT:
${JSON.stringify(entries, null, 2)}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')

  // Extract JSON from response (handle possible markdown fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`Failed to parse translation response for ${locale}`)
  }

  return JSON.parse(jsonMatch[0])
}

// -- Main --

async function main() {
  // Load source data
  const srcPath = resolve(LOCALES_DIR, 'pt-BR/data-fish.json')
  const srcData: Record<string, Record<string, string>> = await Bun.file(srcPath).json()
  const allIds = Object.keys(srcData)

  console.log(`Source: ${allIds.length} fish entries`)
  console.log(`Target locales: ${TARGET_LOCALES.join(', ')}`)
  console.log(`Batch size: ${BATCH_SIZE}\n`)

  const cache = await loadCache()

  for (const locale of TARGET_LOCALES) {
    console.log(`\n--- Translating to ${LOCALE_NAMES[locale]} (${locale}) ---`)

    // Load existing output file if present
    const outPath = resolve(LOCALES_DIR, locale, 'data-fish.json')
    let existing: Record<string, Record<string, string>> = {}
    try {
      const file = Bun.file(outPath)
      if (await file.exists()) {
        existing = await file.json()
      }
    } catch {
      // ignore
    }

    // Merge cache into existing
    if (cache[locale]) {
      existing = { ...existing, ...cache[locale] }
    }

    // Find missing IDs
    const missingIds = allIds.filter((id) => !existing[id])
    console.log(`Already translated: ${allIds.length - missingIds.length}`)
    console.log(`Remaining: ${missingIds.length}`)

    if (missingIds.length === 0) {
      // Still write the file to ensure it's up to date
      await writeOutput(outPath, existing, allIds)
      continue
    }

    // Process in batches
    const totalBatches = Math.ceil(missingIds.length / BATCH_SIZE)
    for (let i = 0; i < missingIds.length; i += BATCH_SIZE) {
      const batchIds = missingIds.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1
      const batchEntries: Record<string, Record<string, string>> = {}

      for (const id of batchIds) {
        batchEntries[id] = srcData[id]
      }

      console.log(`  Batch ${batchNum}/${totalBatches} (${batchIds.length} entries)...`)

      try {
        const translated = await translateBatch(batchEntries, locale)

        // Merge into existing and cache
        for (const id of batchIds) {
          if (translated[id]) {
            existing[id] = translated[id]
            if (!cache[locale]) cache[locale] = {}
            cache[locale][id] = translated[id]
          }
        }

        // Save cache after each batch
        await saveCache(cache)
      } catch (err) {
        console.error(`  ERROR in batch ${batchNum}:`, err)
        console.log('  Saving progress and continuing...')
      }
    }

    // Write final output (sorted by numeric id)
    await writeOutput(outPath, existing, allIds)
  }

  console.log('\nDone!')
}

async function writeOutput(
  outPath: string,
  data: Record<string, Record<string, string>>,
  allIds: string[],
): Promise<void> {
  // Sort by numeric ID
  const sorted: Record<string, Record<string, string>> = {}
  for (const id of allIds.sort((a, b) => Number(a) - Number(b))) {
    if (data[id]) {
      sorted[id] = data[id]
    }
  }

  await Bun.write(outPath, JSON.stringify(sorted, null, 2) + '\n')
  const count = Object.keys(sorted).length
  const locale = outPath.split('/').slice(-2, -1)[0]
  console.log(`  Wrote ${count} entries to ${locale}/data-fish.json`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
