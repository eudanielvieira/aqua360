import type { Fish } from '../types'

const modules: Record<string, () => Promise<{ default: Fish[] }>> = {
  'agua-doce': () => import('./fish-agua-doce'),
  'agua-salgada': () => import('./fish-agua-salgada'),
  'invertebrados-agua-doce': () => import('./fish-invertebrados-agua-doce'),
  'invertebrados-agua-salgada': () => import('./fish-invertebrados-agua-salgada'),
}

export const fishCategories = [
  {
    "key": "PEIXESDULCICOLAS",
    "slug": "agua-doce",
    "label": "Peixes de Água Doce",
    "count": 260
  },
  {
    "key": "PEIXESMARINHOS",
    "slug": "agua-salgada",
    "label": "Peixes de Água Salgada",
    "count": 346
  },
  {
    "key": "PEIXESINVERTEBRADOSDULCIOLAS",
    "slug": "invertebrados-agua-doce",
    "label": "Invertebrados de Água Doce",
    "count": 68
  },
  {
    "key": "PEIXESINVERTEBRADOSMARINHOS",
    "slug": "invertebrados-agua-salgada",
    "label": "Invertebrados de Água Salgada",
    "count": 38
  }
]

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
