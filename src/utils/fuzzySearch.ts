function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

function bestSubstringDistance(query: string, text: string): number {
  if (text.length < query.length) return levenshtein(query, text)
  let best = Infinity
  for (let i = 0; i <= text.length - query.length; i++) {
    const sub = text.substring(i, i + query.length)
    const dist = levenshtein(query, sub)
    if (dist < best) best = dist
    if (best === 0) return 0
  }
  return best
}

export interface FuzzyItem {
  text: string[]
  data: any
}

export interface FuzzyResult {
  data: any
  score: number
  matchType: 'exact' | 'contains' | 'fuzzy'
}

export function fuzzySearch(items: FuzzyItem[], query: string, maxResults = 30): FuzzyResult[] {
  if (!query || query.trim().length < 2) return []

  const q = normalize(query.trim())
  const results: FuzzyResult[] = []
  const maxDistance = Math.max(1, Math.floor(q.length * 0.35))

  for (const item of items) {
    let bestScore = Infinity
    let matchType: 'exact' | 'contains' | 'fuzzy' = 'fuzzy'

    for (const field of item.text) {
      const f = normalize(field)
      if (!f) continue

      if (f === q) {
        bestScore = 0
        matchType = 'exact'
        break
      }

      if (f.includes(q)) {
        const score = 0.1 + (f.indexOf(q) / f.length) * 0.2
        if (score < bestScore) {
          bestScore = score
          matchType = 'contains'
        }
        continue
      }

      if (q.includes(f.substring(0, Math.min(f.length, q.length)))) {
        const score = 0.3
        if (score < bestScore) {
          bestScore = score
          matchType = 'contains'
        }
        continue
      }

      const words = f.split(/\s+/)
      let wordMatch = false
      for (const word of words) {
        if (word.startsWith(q.substring(0, 3))) {
          const dist = levenshtein(q, word)
          const score = 0.4 + (dist / Math.max(q.length, word.length))
          if (score < bestScore && dist <= maxDistance + 1) {
            bestScore = score
            matchType = 'fuzzy'
            wordMatch = true
          }
        }
      }
      if (wordMatch) continue

      const dist = bestSubstringDistance(q, f)
      if (dist <= maxDistance) {
        const score = 0.5 + (dist / q.length)
        if (score < bestScore) {
          bestScore = score
          matchType = 'fuzzy'
        }
      }
    }

    if (bestScore < 1) {
      results.push({ data: item.data, score: bestScore, matchType })
    }
  }

  return results
    .sort((a, b) => a.score - b.score)
    .slice(0, maxResults)
}
