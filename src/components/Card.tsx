import { Link } from 'react-router-dom'
import { getPrimaryImage } from '../utils/image'

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
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={getPrimaryImage(image, inatPhotos)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={e => {
            const target = e.target as HTMLImageElement
            target.src = '/images/avatar.jpg'
          }}
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-text truncate">{title}</h3>
        {subtitle && (
          <p className="text-xs text-text-secondary italic truncate mt-0.5">{subtitle}</p>
        )}
      </div>
    </Link>
  )
}
