export interface EnrichmentData {
  gbifTaxonKey?: number
  wormsAphiaId?: number
  taxonomia?: {
    reino: string
    filo: string
    classe: string
    ordem: string
    familia: string
    genero: string
    especie: string
  }
  inatPhotoUrls?: string[]
  inatObservationCount?: number
  gbifOccurrenceCount?: number
  enrichedAt?: string
  wikiPhotoUrl?: string
  [key: string]: unknown
}

/**
 * Atualiza somente os campos que esta rodada de enriquecimento conhece.
 * Fontes mantidas por outros scripts, como wikiPhotoUrl, sobrevivem.
 */
export function mergeEnrichment(
  current: EnrichmentData | undefined,
  incoming: EnrichmentData,
): EnrichmentData {
  return { ...current, ...incoming }
}
