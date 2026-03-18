import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getThumbnail } from '../utils/image'
import { ImageOff } from 'lucide-react'

interface Props {
  to: string
  image: string
  title: string
  subtitle: string
  inatPhotos?: string[]
  wikiPhoto?: string
}

export default function Card({ to, image, title, subtitle, inatPhotos, wikiPhoto }: Props) {
  const [imgError, setImgError] = useState(false)
  const src = getThumbnail(image, inatPhotos, wikiPhoto)
  const hasImage = src && src !== '/images/.jpg' && src !== '/images/avatar.jpg'

  return (
    <Link
      to={to}
      className="group bg-card rounded-2xl shadow-sm shadow-black/5 overflow-hidden hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden bg-surface-alt relative">
        {hasImage && !imgError ? (
          <img
            src={src}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-alt">
            <ImageOff size={28} className="text-text-secondary/20 mb-2" />
            <p className="text-[10px] text-text-secondary/40 font-medium px-3 text-center truncate max-w-full">{title}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-3.5">
        <h3 className="font-semibold text-sm text-text truncate leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-xs text-text-secondary italic truncate mt-1">{subtitle}</p>
        )}
      </div>
    </Link>
  )
}
