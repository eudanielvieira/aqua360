import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPrimaryImage } from '../utils/image'

interface Species {
  id: number
  nomePopular: string
  nomeCientifico: string
  familia: string
  imagem: string
  enrichment?: { inatPhotoUrls?: string[] }
}

interface Props {
  currentId: number
  familia: string
  loadAll: () => Promise<Species[]>
  basePath: string
  max?: number
}

export default function SimilarSpecies({ currentId, familia, loadAll, basePath, max = 6 }: Props) {
  const [similar, setSimilar] = useState<Species[]>([])

  useEffect(() => {
    if (!familia) return
    loadAll().then(all => {
      const sameFamily = all
        .filter(s => s.id !== currentId && s.familia.toLowerCase() === familia.toLowerCase())
        .slice(0, max)
      setSimilar(sameFamily)
    })
  }, [currentId, familia, loadAll, max])

  if (similar.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
        Especies da mesma familia ({familia})
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {similar.map(species => (
          <Link
            key={species.id}
            to={`${basePath}/${species.id}`}
            className="group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-alt mb-1.5">
              <img
                src={getPrimaryImage(species.imagem, species.enrichment?.inatPhotoUrls)}
                alt={species.nomePopular}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/avatar.jpg'
                }}
              />
            </div>
            <p className="text-xs font-medium text-text truncate">{species.nomePopular}</p>
            <p className="text-[10px] text-text-secondary italic truncate">{species.nomeCientifico}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
