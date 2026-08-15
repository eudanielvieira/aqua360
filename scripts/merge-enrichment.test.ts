import { describe, expect, it } from 'vitest'
import { mergeEnrichment } from './merge-enrichment'

describe('mergeEnrichment', () => {
  it('preserves fields written by other enrichment sources', () => {
    const current = {
      wikiPhotoUrl: 'https://example.com/fish.jpg',
      inatObservationCount: 10,
      customField: 'keep-me',
    }

    const result = mergeEnrichment(current, {
      gbifTaxonKey: 123,
      inatObservationCount: 25,
      enrichedAt: '2026-08-14T12:00:00.000Z',
    })

    expect(result).toEqual({
      wikiPhotoUrl: 'https://example.com/fish.jpg',
      inatObservationCount: 25,
      customField: 'keep-me',
      gbifTaxonKey: 123,
      enrichedAt: '2026-08-14T12:00:00.000Z',
    })
    expect(current).toEqual({
      wikiPhotoUrl: 'https://example.com/fish.jpg',
      inatObservationCount: 10,
      customField: 'keep-me',
    })
  })
})
