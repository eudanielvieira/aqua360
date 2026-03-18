interface SpeciesParams {
  ph: string
  temperatura: string
  gh?: string
  kh?: string
  tipo?: string
  comportamento: string
  nomePopular: string
}

interface RangeResult {
  min: number
  max: number
}

function parseRange(value: string): RangeResult | null {
  if (!value || value.trim() === '') return null
  const cleaned = value.replace(/[ºª°]?\s*C/gi, '').replace(/,/g, '.').trim()
  const match = cleaned.match(/([\d.]+)\s*(?:a|até|-|~)\s*([\d.]+)/)
  if (match) {
    return { min: parseFloat(match[1]), max: parseFloat(match[2]) }
  }
  const single = cleaned.match(/([\d.]+)/)
  if (single) {
    const val = parseFloat(single[1])
    return { min: val, max: val }
  }
  return null
}

function rangeOverlap(a: RangeResult, b: RangeResult): number {
  const overlapMin = Math.max(a.min, b.min)
  const overlapMax = Math.min(a.max, b.max)
  if (overlapMin > overlapMax) return 0

  const overlapSize = overlapMax - overlapMin
  const totalSize = Math.max(a.max, b.max) - Math.min(a.min, b.min)
  if (totalSize === 0) return 1
  return overlapSize / totalSize
}

function behaviorScore(a: string, b: string): { score: number; note: string } {
  const lower = (s: string) => s.toLowerCase()
  const isAggressive = (s: string) => {
    const l = lower(s)
    return l.includes('agressiv') || l.includes('territorial') || l.includes('predador')
  }
  const isPeaceful = (s: string) => {
    const l = lower(s)
    return l.includes('pacíf') || l.includes('calmo') || l.includes('tranquil') || l.includes('sociá') || l.includes('dócil')
  }

  const aAgg = isAggressive(a)
  const bAgg = isAggressive(b)
  const aPeace = isPeaceful(a)
  const bPeace = isPeaceful(b)

  if (aAgg && bAgg) return { score: 0.2, note: 'Ambas as espécies são agressivas/territoriais. Alto risco de conflito.' }
  if (aAgg && bPeace) return { score: 0.3, note: 'Uma espécie é agressiva e a outra pacífica. A pacífica pode sofrer estresse.' }
  if (bAgg && aPeace) return { score: 0.3, note: 'Uma espécie é agressiva e a outra pacífica. A pacífica pode sofrer estresse.' }
  if (aPeace && bPeace) return { score: 1.0, note: 'Ambas as espécies são pacíficas. Boa convivência esperada.' }
  if (aAgg || bAgg) return { score: 0.4, note: 'Uma das espécies pode ser agressiva. Monitorar a convivência.' }
  return { score: 0.7, note: 'Comportamento sem conflitos evidentes.' }
}

export interface CompatibilityResult {
  score: number
  label: string
  color: string
  details: { param: string; score: number; note: string }[]
}

export function checkCompatibility(a: SpeciesParams, b: SpeciesParams): CompatibilityResult {
  const details: { param: string; score: number; note: string }[] = []

  // Tipo de agua
  if (a.tipo && b.tipo) {
    const aFresh = a.tipo.includes('DULCI') || a.tipo.includes('doce')
    const bFresh = b.tipo.includes('DULCI') || b.tipo.includes('doce')
    const aSalt = a.tipo.includes('MARINHO') || a.tipo.includes('salgad')
    const bSalt = b.tipo.includes('MARINHO') || b.tipo.includes('salgad')

    if ((aFresh && bSalt) || (aSalt && bFresh)) {
      details.push({ param: 'Tipo de Água', score: 0, note: 'Espécies de tipos de água diferentes (doce vs salgada). Incompatíveis.' })
    } else {
      details.push({ param: 'Tipo de Água', score: 1, note: 'Mesmo tipo de água.' })
    }
  }

  // pH
  const phA = parseRange(a.ph)
  const phB = parseRange(b.ph)
  if (phA && phB) {
    const overlap = rangeOverlap(phA, phB)
    const overlapMin = Math.max(phA.min, phB.min)
    const overlapMax = Math.min(phA.max, phB.max)
    if (overlap > 0) {
      details.push({ param: 'pH', score: Math.min(overlap * 1.5, 1), note: `Faixa compatível: ${overlapMin.toFixed(1)} a ${overlapMax.toFixed(1)}` })
    } else {
      details.push({ param: 'pH', score: 0, note: `Sem sobreposição. ${a.nomePopular}: ${a.ph} / ${b.nomePopular}: ${b.ph}` })
    }
  }

  // Temperatura
  const tempA = parseRange(a.temperatura)
  const tempB = parseRange(b.temperatura)
  if (tempA && tempB) {
    const overlap = rangeOverlap(tempA, tempB)
    const overlapMin = Math.max(tempA.min, tempB.min)
    const overlapMax = Math.min(tempA.max, tempB.max)
    if (overlap > 0) {
      details.push({ param: 'Temperatura', score: Math.min(overlap * 1.5, 1), note: `Faixa compatível: ${overlapMin.toFixed(0)} a ${overlapMax.toFixed(0)} graus` })
    } else {
      details.push({ param: 'Temperatura', score: 0, note: `Sem sobreposição. ${a.nomePopular}: ${a.temperatura} / ${b.nomePopular}: ${b.temperatura}` })
    }
  }

  // GH
  if (a.gh && b.gh) {
    const ghA = parseRange(a.gh)
    const ghB = parseRange(b.gh)
    if (ghA && ghB) {
      const overlap = rangeOverlap(ghA, ghB)
      if (overlap > 0) {
        details.push({ param: 'GH', score: Math.min(overlap * 1.5, 1), note: 'Dureza geral compatível.' })
      } else {
        details.push({ param: 'GH', score: 0, note: 'Dureza geral incompatível.' })
      }
    }
  }

  // Comportamento
  if (a.comportamento || b.comportamento) {
    const beh = behaviorScore(a.comportamento || '', b.comportamento || '')
    details.push({ param: 'Comportamento', score: beh.score, note: beh.note })
  }

  // Score final
  const waterType = details.find(d => d.param === 'Tipo de Água')
  if (waterType && waterType.score === 0) {
    return {
      score: 0,
      label: 'Incompatível',
      color: 'text-red-500',
      details,
    }
  }

  const scores = details.map(d => d.score)
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5
  const finalScore = Math.round(avg * 100)

  let label: string
  let color: string
  if (finalScore >= 80) { label = 'Excelente'; color = 'text-emerald-500' }
  else if (finalScore >= 60) { label = 'Boa'; color = 'text-blue-500' }
  else if (finalScore >= 40) { label = 'Moderada'; color = 'text-amber-500' }
  else if (finalScore >= 20) { label = 'Baixa'; color = 'text-orange-500' }
  else { label = 'Incompatível'; color = 'text-red-500' }

  return { score: finalScore, label, color, details }
}
