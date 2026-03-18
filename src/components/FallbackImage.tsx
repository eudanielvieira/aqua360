import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { getAllImages } from '../utils/image'

interface Props {
  localImage: string
  inatPhotos?: string[]
  wikiPhoto?: string
  alt: string
  className?: string
}

export default function FallbackImage({ localImage, inatPhotos, wikiPhoto, alt, className = '' }: Props) {
  const allUrls = getAllImages(localImage, inatPhotos, wikiPhoto)
  const [urlIndex, setUrlIndex] = useState(0)
  const [allFailed, setAllFailed] = useState(false)

  const currentUrl = allUrls[urlIndex]

  const handleError = () => {
    if (urlIndex < allUrls.length - 1) {
      setUrlIndex(prev => prev + 1)
    } else {
      setAllFailed(true)
    }
  }

  if (!currentUrl || allFailed) {
    return (
      <div className={`flex flex-col items-center justify-center bg-surface-alt ${className}`}>
        <ImageOff size={32} className="text-text-secondary/20 mb-2" />
        <p className="text-xs text-text-secondary/40 font-medium">{alt}</p>
      </div>
    )
  }

  return (
    <img
      src={currentUrl}
      alt={alt}
      className={`object-cover ${className}`}
      onError={handleError}
    />
  )
}
