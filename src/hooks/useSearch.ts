import { useState, useMemo } from 'react'

export function useSearch<T>(items: T[], searchFields: (keyof T)[]) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const lower = query.toLowerCase()
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        return typeof value === 'string' && value.toLowerCase().includes(lower)
      })
    )
  }, [items, query, searchFields])

  return { query, setQuery, filtered }
}
