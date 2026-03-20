import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type TranslatableType = 'fish' | 'plant' | 'coral' | 'disease'

const translatableFields: Record<TranslatableType, string[]> = {
  fish: [
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
  ],
  plant: [
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
  ],
  coral: [
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
  ],
  disease: ['nome', 'causa', 'tratamento', 'sintoma'],
}

const namespaceMap: Record<TranslatableType, string> = {
  fish: 'data-fish',
  plant: 'data-plants',
  coral: 'data-corals',
  disease: 'data-diseases',
}

function applyTranslation<T extends { id: number }>(
  species: T,
  type: TranslatableType,
  t: (key: string, options?: Record<string, unknown>) => unknown
): T {
  const translated = t(`${species.id}`, {
    returnObjects: true,
    defaultValue: null,
  })

  if (!translated || typeof translated !== 'object') return species

  const fields = translatableFields[type]
  const translatedRecord = translated as Record<string, string>
  const overlay: Partial<Record<string, string>> = {}

  for (const field of fields) {
    if (translatedRecord[field]) {
      overlay[field] = translatedRecord[field]
    }
  }

  if (Object.keys(overlay).length === 0) return species

  return { ...species, ...overlay }
}

export function useTranslatedSpecies<T extends { id: number }>(
  species: T | null,
  type: TranslatableType
): T | null {
  const { t, i18n } = useTranslation(namespaceMap[type])

  return useMemo(() => {
    if (!species) return null
    if (i18n.language === 'pt-BR') return species

    return applyTranslation(species, type, t)
  }, [species, type, t, i18n.language])
}

export function useTranslatedSpeciesList<T extends { id: number }>(
  speciesList: T[],
  type: TranslatableType
): T[] {
  const { t, i18n } = useTranslation(namespaceMap[type])

  return useMemo(() => {
    if (i18n.language === 'pt-BR') return speciesList

    return speciesList.map((species) => applyTranslation(species, type, t))
  }, [speciesList, type, t, i18n.language])
}
