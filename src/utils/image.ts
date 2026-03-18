export function getImageUrl(imageName: string): string {
  if (!imageName) return '/images/avatar.jpg'
  const name = imageName.replace(/\.(jpg|jpeg|png)$/i, '')
  return `/images/${name}.jpg`
}

export function getPrimaryImage(
  localImage: string,
  inatPhotos?: string[],
  wikiPhoto?: string,
): string {
  if (wikiPhoto) return wikiPhoto
  if (inatPhotos && inatPhotos.length > 0) return inatPhotos[0]
  return getImageUrl(localImage)
}

export function getThumbnail(
  localImage: string,
  inatPhotos?: string[],
  wikiPhoto?: string,
): string {
  if (wikiPhoto) return wikiPhoto.replace(/\/\d+px-/, '/300px-')
  if (inatPhotos && inatPhotos.length > 0) {
    return inatPhotos[0].replace('/medium.', '/small.').replace('/medium/', '/small/')
  }
  return getImageUrl(localImage)
}
