import { describe, expect, it } from 'vitest'
import {
  PLACEHOLDER_IMAGE,
  applyImageFallback,
  getPrimaryImage,
  getThumbnail,
} from './image'

describe('image fallbacks', () => {
  it('never returns an empty src for raw image consumers', () => {
    expect(getPrimaryImage('')).toBe(PLACEHOLDER_IMAGE)
    expect(getThumbnail('')).toBe(PLACEHOLDER_IMAGE)
  })

  it('replaces a broken source without keeping a recursive error handler', () => {
    const image = {
      src: '/images/missing.jpg',
      onerror: () => undefined,
    } as unknown as HTMLImageElement

    applyImageFallback({ currentTarget: image })

    expect(image.src).toBe(PLACEHOLDER_IMAGE)
    expect(image.onerror).toBeNull()
  })
})
