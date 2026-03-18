import { useState } from 'react'

interface Props {
  photos: string[]
}

export default function CommunityPhotos({ photos }: Props) {
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set())

  const validPhotos = photos.filter((_, i) => !failedIndexes.has(i))

  if (validPhotos.length === 0) return null

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => {
          if (failedIndexes.has(i)) return null
          return (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={url}
                alt={`Foto da comunidade ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setFailedIndexes(prev => new Set(prev).add(i))}
              />
            </div>
          )
        })}
      </div>
      <p className="text-xs text-text-secondary mt-2">
        Fotos da comunidade via <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">iNaturalist</a>
      </p>
    </div>
  )
}
