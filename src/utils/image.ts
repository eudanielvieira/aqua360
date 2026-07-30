import { NORMALIZED_IMAGES } from '../data/normalized-images'

export function getImageUrl(imageName: string): string {
  if (!imageName) return ''
  const name = imageName.replace(/\.(jpg|jpeg|png)$/i, '')
  return `/images/${name}.jpg`
}

/**
 * Imagem ja tratada em 760x760 com a marca dagua do Aqua360.
 *
 * Essas sao arte propria e ficam na frente das fotos do Wikipedia e do
 * iNaturalist. O restante de public/images ainda e o arquivo antigo de
 * 180x135, que perde para a foto remota e por isso continua no fim.
 *
 * Tambem serve para o layout saber que a imagem e quadrada: onde o
 * espaco e uma faixa larga, a arte precisa de um recorte proprio para
 * nao entrar cortada.
 */
export function isNormalized(imageName: string): boolean {
  if (!imageName) return false
  return NORMALIZED_IMAGES.has(imageName.replace(/\.(jpg|jpeg|png)$/i, ''))
}

export function getAllImages(
  localImage: string,
  inatPhotos?: string[],
  wikiPhoto?: string,
): string[] {
  const urls: string[] = []
  const local = getImageUrl(localImage)
  if (local && isNormalized(localImage)) urls.push(local)
  if (wikiPhoto && !urls.includes(wikiPhoto)) urls.push(wikiPhoto)
  if (inatPhotos) {
    for (const url of inatPhotos) {
      if (url && !urls.includes(url)) urls.push(url)
    }
  }
  if (local && !urls.includes(local)) urls.push(local)
  return urls
}

export function getAllThumbnails(
  localImage: string,
  inatPhotos?: string[],
  wikiPhoto?: string,
): string[] {
  const urls: string[] = []
  const local = getImageUrl(localImage)
  if (local && isNormalized(localImage)) urls.push(local)
  if (wikiPhoto) {
    const thumb = wikiPhoto.replace(/\/\d+px-/, '/300px-')
    if (!urls.includes(thumb)) urls.push(thumb)
  }
  if (inatPhotos) {
    for (const url of inatPhotos) {
      if (!url) continue
      const thumb = url.replace('/medium.', '/small.').replace('/medium/', '/small/')
      if (!urls.includes(thumb)) urls.push(thumb)
    }
  }
  if (local && !urls.includes(local)) urls.push(local)
  return urls
}

// Mantidos para compatibilidade
export function getPrimaryImage(localImage: string, inatPhotos?: string[], wikiPhoto?: string): string {
  return getAllImages(localImage, inatPhotos, wikiPhoto)[0] || ''
}

export function getThumbnail(localImage: string, inatPhotos?: string[], wikiPhoto?: string): string {
  return getAllThumbnails(localImage, inatPhotos, wikiPhoto)[0] || ''
}
