import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'aqua360-favorites'

interface FavoriteItem {
  id: number
  type: 'fish' | 'plant' | 'coral'
  slug?: string
}

function load(): FavoriteItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function save(items: FavoriteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(load)

  useEffect(() => {
    save(favorites)
  }, [favorites])

  const isFavorite = useCallback((id: number, type: string) => {
    return favorites.some(f => f.id === id && f.type === type)
  }, [favorites])

  const toggle = useCallback((id: number, type: 'fish' | 'plant' | 'coral', slug?: string) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === id && f.type === type)
      if (exists) return prev.filter(f => !(f.id === id && f.type === type))
      return [...prev, { id, type, slug }]
    })
  }, [])

  const clear = useCallback(() => setFavorites([]), [])

  return { favorites, isFavorite, toggle, clear, count: favorites.length }
}
