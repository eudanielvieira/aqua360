import { Link } from 'react-router-dom'
import { getThumbnail } from '../utils/image'

interface Props {
  to: string
  image: string
  title: string
  subtitle: string
  inatPhotos?: string[]
}

export default function Card({ to, image, title, subtitle, inatPhotos }: Props) {
  return (
    <Link
      to={to}
      className="group bg-card rounded-2xl shadow-sm shadow-black/5 overflow-hidden hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden bg-surface-alt relative">
        <img
          src={getThumbnail(image, inatPhotos)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={e => {
            const target = e.target as HTMLImageElement
            target.src = '/images/avatar.jpg'
          }}
        />
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
