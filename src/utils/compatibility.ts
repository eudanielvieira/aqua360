export interface SpeciesParams {
  ph: string
  temperatura: string
  gh?: string
  kh?: string
  tipo?: string
  comportamento: string
  alimentacao?: string
  tamanhoAdulto?: string
  nomePopular: string
  nomeCientifico?: string
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

function parseSize(value: string): number | null {
  if (!value) return null
  const match = value.match(/(\d+)\s*cm/i)
  return match ? parseInt(match[1]) : null
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

function lower(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function behaviorScore(a: string, b: string): { score: number; note: string } {
  const isAggressive = (s: string) => {
    const l = lower(s)
    return l.includes('agressiv') || l.includes('territorial') || l.includes('predador')
  }
  const isPeaceful = (s: string) => {
    const l = lower(s)
    return l.includes('pacif') || l.includes('calmo') || l.includes('tranquil') || l.includes('socia') || l.includes('docil')
  }

  const aAgg = isAggressive(a)
  const bAgg = isAggressive(b)
  const aPeace = isPeaceful(a)
  const bPeace = isPeaceful(b)

  if (aAgg && bAgg) return { score: 0.2, note: 'Ambas as especies sao agressivas/territoriais. Alto risco de conflito.' }
  if ((aAgg && bPeace) || (bAgg && aPeace)) return { score: 0.3, note: 'Uma especie e agressiva e a outra pacifica. A pacifica pode sofrer estresse.' }
  if (aPeace && bPeace) return { score: 1.0, note: 'Ambas as especies sao pacificas. Boa convivencia esperada.' }
  if (aAgg || bAgg) return { score: 0.4, note: 'Uma das especies pode ser agressiva. Monitorar a convivencia.' }
  return { score: 0.7, note: 'Comportamento sem conflitos evidentes.' }
}

function predationRisk(a: SpeciesParams, b: SpeciesParams): { score: number; note: string } | null {
  const sizeA = parseSize(a.tamanhoAdulto || '')
  const sizeB = parseSize(b.tamanhoAdulto || '')
  if (!sizeA || !sizeB) return null

  const ratio = Math.max(sizeA, sizeB) / Math.min(sizeA, sizeB)
  const bigger = sizeA > sizeB ? a : b
  const smaller = sizeA > sizeB ? b : a

  const biggerFood = lower(bigger.alimentacao || '')
  const biggerBehavior = lower(bigger.comportamento || '')

  const isCarnivore = biggerFood.includes('carniv') || biggerFood.includes('peixes vivos')
    || biggerFood.includes('peixe') || biggerFood.includes('camar')
  const isPredatory = biggerBehavior.includes('predador') || biggerBehavior.includes('come')
    || biggerFood.includes('filhote') || biggerFood.includes('alevino')

  if (ratio >= 4 && (isCarnivore || isPredatory)) {
    return {
      score: 0,
      note: `RISCO DE PREDACAO: ${bigger.nomePopular} (${sizeA > sizeB ? sizeA : sizeB} cm) pode predar ${smaller.nomePopular} (${sizeA > sizeB ? sizeB : sizeA} cm). Diferenca de tamanho muito grande e dieta carnivora.`,
    }
  }

  if (ratio >= 3 && isCarnivore) {
    return {
      score: 0.2,
      note: `Risco alto: ${bigger.nomePopular} e carnivoro e significativamente maior que ${smaller.nomePopular}. Pode tentar predar.`,
    }
  }

  if (ratio >= 2.5 && isCarnivore) {
    return {
      score: 0.4,
      note: `Risco moderado: ${bigger.nomePopular} e carnivoro e maior que ${smaller.nomePopular}. Monitorar, especialmente com alevinos.`,
    }
  }

  if (ratio >= 2) {
    return {
      score: 0.7,
      note: `Diferenca de tamanho relevante (${Math.max(sizeA, sizeB)} cm vs ${Math.min(sizeA, sizeB)} cm), mas sem risco direto de predacao.`,
    }
  }

  return {
    score: 1.0,
    note: `Tamanhos compativeis (${sizeA} cm e ${sizeB} cm).`,
  }
}

function plantRisk(a: SpeciesParams): { isPlantEater: boolean; note: string } {
  const food = lower(a.alimentacao || '')
  const behavior = lower(a.comportamento || '')

  const eatsPlants = food.includes('vegeta') || food.includes('herbivor') || food.includes('planta')
    || food.includes('alga') || behavior.includes('arranc') || behavior.includes('escav')
    || behavior.includes('decor')

  const destroysPlants = behavior.includes('planta') || behavior.includes('substrato')
    || behavior.includes('escava') || behavior.includes('layout')

  if (eatsPlants || destroysPlants) {
    return {
      isPlantEater: true,
      note: `${a.nomePopular} pode comer ou danificar plantas aquaticas.`,
    }
  }

  return { isPlantEater: false, note: '' }
}

function invertebrateRisk(a: SpeciesParams, b: SpeciesParams): { score: number; note: string } | null {
  const aIsInvert = (a.tipo || '').includes('INVERTEBRAD')
  const bIsInvert = (b.tipo || '').includes('INVERTEBRAD')

  if (!aIsInvert && !bIsInvert) return null

  const fish = aIsInvert ? b : a
  const invert = aIsInvert ? a : b
  const fishFood = lower(fish.alimentacao || '')

  const eatsInverts = fishFood.includes('camar') || fishFood.includes('crustac')
    || fishFood.includes('caracol') || fishFood.includes('molusco')
    || fishFood.includes('invertebrad') || fishFood.includes('carangue')

  if (eatsInverts) {
    return {
      score: 0.1,
      note: `PERIGO: ${fish.nomePopular} se alimenta de invertebrados e pode predar ${invert.nomePopular}.`,
    }
  }

  const fishSize = parseSize(fish.tamanhoAdulto || '')
  const invertSize = parseSize(invert.tamanhoAdulto || '')

  if (fishSize && invertSize && fishSize > invertSize * 3) {
    return {
      score: 0.3,
      note: `${fish.nomePopular} e muito maior que ${invert.nomePopular}. Pode representar risco ao invertebrado.`,
    }
  }

  return {
    score: 0.8,
    note: `Sem risco evidente entre ${fish.nomePopular} e ${invert.nomePopular}.`,
  }
}

export interface CompatibilityResult {
  score: number
  label: string
  color: string
  details: { param: string; score: number; note: string }[]
  warnings: string[]
}

export function checkCompatibility(a: SpeciesParams, b: SpeciesParams): CompatibilityResult {
  const details: { param: string; score: number; note: string }[] = []
  const warnings: string[] = []

  // Tipo de agua
  if (a.tipo && b.tipo) {
    const aFresh = a.tipo.includes('DULCI') || a.tipo.includes('doce')
    const bFresh = b.tipo.includes('DULCI') || b.tipo.includes('doce')
    const aSalt = a.tipo.includes('MARINHO') || a.tipo.includes('salgad')
    const bSalt = b.tipo.includes('MARINHO') || b.tipo.includes('salgad')

    if ((aFresh && bSalt) || (aSalt && bFresh)) {
      details.push({ param: 'Tipo de Agua', score: 0, note: 'Especies de tipos de agua diferentes (doce vs salgada). Incompativeis.' })
      return { score: 0, label: 'Incompativel', color: 'text-red-500', details, warnings }
    }
    details.push({ param: 'Tipo de Agua', score: 1, note: 'Mesmo tipo de agua.' })
  }

  // Predacao por tamanho + dieta
  const pred = predationRisk(a, b)
  if (pred) {
    details.push({ param: 'Risco de Predacao', score: pred.score, note: pred.note })
    if (pred.score === 0) {
      warnings.push(pred.note)
    }
  }

  // Invertebrados
  const invert = invertebrateRisk(a, b)
  if (invert) {
    details.push({ param: 'Peixe vs Invertebrado', score: invert.score, note: invert.note })
    if (invert.score <= 0.3) {
      warnings.push(invert.note)
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
      details.push({ param: 'pH', score: Math.min(overlap * 1.5, 1), note: `Faixa compativel: ${overlapMin.toFixed(1)} a ${overlapMax.toFixed(1)}` })
    } else {
      details.push({ param: 'pH', score: 0, note: `Sem sobreposicao. ${a.nomePopular}: ${a.ph} / ${b.nomePopular}: ${b.ph}` })
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
      details.push({ param: 'Temperatura', score: Math.min(overlap * 1.5, 1), note: `Faixa compativel: ${overlapMin.toFixed(0)} a ${overlapMax.toFixed(0)} graus` })
    } else {
      details.push({ param: 'Temperatura', score: 0, note: `Sem sobreposicao. ${a.nomePopular}: ${a.temperatura} / ${b.nomePopular}: ${b.temperatura}` })
    }
  }

  // GH
  if (a.gh && b.gh) {
    const ghA = parseRange(a.gh)
    const ghB = parseRange(b.gh)
    if (ghA && ghB) {
      const overlap = rangeOverlap(ghA, ghB)
      if (overlap > 0) {
        details.push({ param: 'GH', score: Math.min(overlap * 1.5, 1), note: 'Dureza geral compativel.' })
      } else {
        details.push({ param: 'GH', score: 0, note: 'Dureza geral incompativel.' })
      }
    }
  }

  // Comportamento
  if (a.comportamento || b.comportamento) {
    const beh = behaviorScore(a.comportamento || '', b.comportamento || '')
    details.push({ param: 'Comportamento', score: beh.score, note: beh.note })
  }

  // Avisos sobre plantas
  const plantA = plantRisk(a)
  const plantB = plantRisk(b)
  if (plantA.isPlantEater) warnings.push(plantA.note)
  if (plantB.isPlantEater) warnings.push(plantB.note)

  // Score final
  const scores = details.map(d => d.score)
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5
  const finalScore = Math.round(avg * 100)

  let label: string
  let color: string
  if (finalScore >= 80) { label = 'Excelente'; color = 'text-emerald-500' }
  else if (finalScore >= 60) { label = 'Boa'; color = 'text-blue-500' }
  else if (finalScore >= 40) { label = 'Moderada'; color = 'text-amber-500' }
  else if (finalScore >= 20) { label = 'Baixa'; color = 'text-orange-500' }
  else { label = 'Incompativel'; color = 'text-red-500' }

  return { score: finalScore, label, color, details, warnings }
}
