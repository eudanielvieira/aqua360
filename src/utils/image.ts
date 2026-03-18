export function getImageUrl(imageName: string): string {
  if (!imageName) return ''
  const name = imageName.replace(/\.(jpg|jpeg|png)$/i, '')
  return `/images/${name}.jpg`
}

export function getAllImages(
  localImage: string,
  inatPhotos?: string[],
  wikiPhoto?: string,
): string[] {
  const urls: string[] = []
  if (wikiPhoto) urls.push(wikiPhoto)
  if (inatPhotos) {
    for (const url of inatPhotos) {
      if (url && !urls.includes(url)) urls.push(url)
    }
  }
  const local = getImageUrl(localImage)
  if (local && !urls.includes(local)) urls.push(local)
  return urls
}

export function getAllThumbnails(
  localImage: string,
  inatPhotos?: string[],
  wikiPhoto?: string,
): string[] {
  const urls: string[] = []
  if (wikiPhoto) urls.push(wikiPhoto.replace(/\/\d+px-/, '/300px-'))
  if (inatPhotos) {
    for (const url of inatPhotos) {
      if (!url) continue
      const thumb = url.replace('/medium.', '/small.').replace('/medium/', '/small/')
      if (!urls.includes(thumb)) urls.push(thumb)
    }
  }
  const local = getImageUrl(localImage)
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
