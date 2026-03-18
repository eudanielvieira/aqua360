import { useState, useMemo } from 'react'
import { fuzzySearch, type FuzzyItem } from '../utils/fuzzySearch'

export function useSearch<T>(items: T[], searchFields: (keyof T)[]) {
  const [query, setQuery] = useState('')

  const fuzzyItems = useMemo((): FuzzyItem[] => {
    return items.map(item => ({
      text: searchFields.map(f => {
        const v = item[f]
        return typeof v === 'string' ? v : ''
      }),
      data: item,
    }))
  }, [items, searchFields])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const results = fuzzySearch(fuzzyItems, query, items.length)
    return results.map(r => r.data as T)
  }, [items, fuzzyItems, query])

  return { query, setQuery, filtered }
}
