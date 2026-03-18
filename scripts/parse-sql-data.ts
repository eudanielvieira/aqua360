import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const SQL_FILE = join(__dirname, '../../app-decompiled/resources/assets/apeixonadot.txt')
const OUTPUT_DIR = join(__dirname, '../src/data')

mkdirSync(OUTPUT_DIR, { recursive: true })

const content = readFileSync(SQL_FILE, 'utf-8')
const lines = content.split('\n').filter(l => l.trim().length > 0)

function parseValues(valuesStr: string): string[] {
  const results: string[] = []
  let current = ''
  let inQuote = false
  let i = 0

  while (i < valuesStr.length) {
    const char = valuesStr[i]

    if (char === "'" && !inQuote) {
      inQuote = true
      i++
      continue
    }

    if (char === "'" && inQuote) {
      if (i + 1 < valuesStr.length && valuesStr[i + 1] === "'") {
        current += "'"
        i += 2
        continue
      }
      inQuote = false
      results.push(current)
      current = ''
      i++
      continue
    }

    if (inQuote) {
      current += char
    }

    i++
  }

  return results
}

function parseColumns(line: string): string[] {
  const match = line.match(/\(([^)]+)\)\s*VALUES/i)
  if (!match) return []
  return match[1].split(',').map(c => c.trim())
}

function normalizeColumnName(col: string): string {
  const map: Record<string, string> = {
    'CO2': 'co2',
    'fonte': 'fonte',
    'subTipo': 'subTipo',
  }
  return map[col] || col
}

interface FishRecord {
  id: number
  alimentacao: string
  caracteristica: string
  comportamento: string
  diformismoSexual: string
  familia: string
  gh: string
  imagem: string
  kh: string
  nomeCientifico: string
  nomePopular: string
  origem: string
  outrasInformacoes: string
  outrosNome: string
  ph: string
  posicaoAquario: string
  reproducao: string
  tamanhoAdulto: string
  temperatura: string
  tipo: string
  subTipo: string
  fonte: string
}

interface PlantRecord {
  id: number
  co2: string
  crescimento: string
  dificuldade: string
  estrutura: string
  familia: string
  iluminacao: string
  imagem: string
  nomeCientifico: string
  nomePopular: string
  origem: string
  outrosNome: string
  ph: string
  plantio: string
  porte: string
  posicao: string
  reproducao: string
  substratoFertil: string
  suportaEmersao: string
  tamanho: string
  temperatura: string
  fonte: string
}

interface DiseaseRecord {
  id: number
  nome: string
  nomeCientifico: string
  causa: string
  tratamento: string
  sintoma: string
  imagem: string
}

const allFishFields: (keyof Omit<FishRecord, 'id'>)[] = [
  'alimentacao', 'caracteristica', 'comportamento', 'diformismoSexual',
  'familia', 'gh', 'imagem', 'kh', 'nomeCientifico', 'nomePopular',
  'origem', 'outrasInformacoes', 'outrosNome', 'ph', 'posicaoAquario',
  'reproducao', 'tamanhoAdulto', 'temperatura', 'tipo', 'subTipo', 'fonte'
]

const allPlantFields: (keyof Omit<PlantRecord, 'id'>)[] = [
  'co2', 'crescimento', 'dificuldade', 'estrutura', 'familia',
  'iluminacao', 'imagem', 'nomeCientifico', 'nomePopular', 'origem',
  'outrosNome', 'ph', 'plantio', 'porte', 'posicao', 'reproducao',
  'substratoFertil', 'suportaEmersao', 'tamanho', 'temperatura', 'fonte'
]

const fishes: FishRecord[] = []
const plants: PlantRecord[] = []
const diseases: DiseaseRecord[] = []

let fishId = 1
let plantId = 1
let diseaseId = 1

for (const line of lines) {
  const valuesMatch = line.match(/VALUES\s*\((.+)\)\s*$/i)
  if (!valuesMatch) continue

  const columns = parseColumns(line)
  const values = parseValues(valuesMatch[1])

  if (line.includes('tb_peixes')) {
    const fish: any = { id: fishId++ }
    for (const field of allFishFields) {
      fish[field] = ''
    }
    columns.forEach((col, i) => {
      const key = normalizeColumnName(col)
      if (key in fish) {
        fish[key] = values[i] || ''
      }
    })
    fishes.push(fish as FishRecord)
  } else if (line.includes('tb_plantas')) {
    const plant: any = { id: plantId++ }
    for (const field of allPlantFields) {
      plant[field] = ''
    }
    columns.forEach((col, i) => {
      const key = normalizeColumnName(col)
      if (key in plant) {
        plant[key] = values[i] || ''
      }
    })
    plants.push(plant as PlantRecord)
  } else if (line.includes('tb_doenca')) {
    const disease: any = { id: diseaseId++ }
    disease.nome = ''
    disease.nomeCientifico = ''
    disease.causa = ''
    disease.tratamento = ''
    disease.sintoma = ''
    disease.imagem = ''
    columns.forEach((col, i) => {
      const key = normalizeColumnName(col)
      if (key in disease) {
        disease[key] = values[i] || ''
      }
    })
    diseases.push(disease as DiseaseRecord)
  }
}

const fishTypes: Record<string, string> = {
  PEIXESDULCICOLAS: 'agua-doce',
  PEIXESMARINHOS: 'agua-salgada',
  PEIXESINVERTEBRADOSDULCIOLAS: 'invertebrados-agua-doce',
  PEIXESINVERTEBRADOSMARINHOS: 'invertebrados-agua-salgada',
}

const fishByType: Record<string, FishRecord[]> = {}
for (const fish of fishes) {
  const slug = fishTypes[fish.tipo] || 'outros'
  if (!fishByType[slug]) fishByType[slug] = []
  fishByType[slug].push(fish)
}

for (const [slug, items] of Object.entries(fishByType)) {
  const filename = `fish-${slug}.ts`
  const fileContent = `import type { Fish } from '../types'\n\nconst data: Fish[] = ${JSON.stringify(items, null, 2)}\n\nexport default data\n`
  writeFileSync(join(OUTPUT_DIR, filename), fileContent)
  console.log(`  ${filename}: ${items.length} registros`)
}

const fishIndexContent = `import type { Fish } from '../types'

const modules: Record<string, () => Promise<{ default: Fish[] }>> = {
${Object.keys(fishByType).map(slug => `  '${slug}': () => import('./fish-${slug}'),`).join('\n')}
}

export const fishCategories = ${JSON.stringify(
  Object.entries(fishTypes).map(([key, slug]) => ({
    key,
    slug,
    label: key === 'PEIXESDULCICOLAS' ? 'Peixes de \u00c1gua Doce'
      : key === 'PEIXESMARINHOS' ? 'Peixes de \u00c1gua Salgada'
      : key === 'PEIXESINVERTEBRADOSDULCIOLAS' ? 'Invertebrados de \u00c1gua Doce'
      : 'Invertebrados de \u00c1gua Salgada',
    count: fishByType[slug]?.length || 0,
  })),
  null, 2
)}

export async function loadFishByType(slug: string): Promise<Fish[]> {
  const loader = modules[slug]
  if (!loader) return []
  const mod = await loader()
  return mod.default
}

export async function loadAllFish(): Promise<Fish[]> {
  const all = await Promise.all(Object.values(modules).map(fn => fn()))
  return all.flatMap(m => m.default)
}
`
writeFileSync(join(OUTPUT_DIR, 'fish-index.ts'), fishIndexContent)

const plantsContent = `import type { Plant } from '../types'\n\nconst data: Plant[] = ${JSON.stringify(plants, null, 2)}\n\nexport default data\n`
writeFileSync(join(OUTPUT_DIR, 'plants.ts'), plantsContent)

const diseasesContent = `import type { Disease } from '../types'\n\nconst data: Disease[] = ${JSON.stringify(diseases, null, 2)}\n\nexport default data\n`
writeFileSync(join(OUTPUT_DIR, 'diseases.ts'), diseasesContent)

console.log(`\nDados convertidos com sucesso:`)
console.log(`  Peixes: ${fishes.length}`)
console.log(`  Plantas: ${plants.length}`)
console.log(`  Doen\u00e7as: ${diseases.length}`)

const outros = fishByType['outros']
if (outros && outros.length > 0) {
  console.log(`\n  AVISO: ${outros.length} peixes sem categoria (tipo vazio) em fish-outros.ts`)
}
