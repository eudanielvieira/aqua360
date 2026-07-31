import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  namespaceMap,
  speciesKey,
  translatableFields,
  type TranslatableType,
} from '../translatable-fields'

function applyTranslation<T extends { id: number }>(
  species: T,
  type: TranslatableType,
  t: (key: string, options?: Record<string, unknown>) => unknown
): T {
  // nsSeparator: false porque a chave de peixe leva o slug junto ("agua-doce:194")
  // e o ":" e justamente o separador de namespace do i18next. Sem isso ele
  // procuraria a chave "194" num namespace "agua-doce" que nao existe.
  const translated = t(speciesKey(species, type), {
    returnObjects: true,
    defaultValue: null,
    nsSeparator: false,
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
