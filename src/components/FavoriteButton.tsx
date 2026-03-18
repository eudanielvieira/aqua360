import { Heart } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

interface Props {
  id: number
  type: 'fish' | 'plant' | 'coral'
  slug?: string
  size?: number
}

export default function FavoriteButton({ id, type, slug, size = 20 }: Props) {
  const { isFavorite, toggle } = useFavorites()
  const active = isFavorite(id, type)

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(id, type, slug) }}
      className={`p-2 rounded-xl transition-all ${active ? 'text-rose-500 bg-rose-500/10' : 'text-text-secondary hover:text-rose-500 hover:bg-rose-500/5'}`}
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart size={size} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}
