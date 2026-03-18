export function getImageUrl(imageName: string): string {
  if (!imageName) return '/images/avatar.jpg'
  const name = imageName.replace(/\.(jpg|jpeg|png)$/i, '')
  return `/images/${name}.jpg`
}
