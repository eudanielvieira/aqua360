import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { loadAllFish } from '../data/fish-index'
import type { Plant } from '../types'
import { getPrimaryImage } from '../utils/image'
import PageHeader from '../components/PageHeader'
import { Search, CheckCircle, AlertTriangle, Leaf, Fish as FishIcon, Plus } from 'lucide-react'

interface SpeciesOption {
  id: number
  nomePopular: string
  nomeCientifico: string
  imagem: string
  ph: string
  temperatura: string
  gh: string
  kh: string
  tipo: string
  comportamento: string
  alimentacao: string
  tamanhoAdulto: string
  posicaoAquario: string
  familia: string
  inatPhotos?: string[]
  source: 'fish' | 'plant'
  slug?: string
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function parseRange(value: string): { min: number; max: number } | null {
  if (!value || value.trim() === '') return null
  const cleaned = value.replace(/[ºª°]?\s*C/gi, '').replace(/,/g, '.').trim()
  const match = cleaned.match(/([\d.]+)\s*(?:a|até|-|~)\s*([\d.]+)/)
  if (match) return { min: parseFloat(match[1]), max: parseFloat(match[2]) }
  const single = cleaned.match(/([\d.]+)/)
  if (single) { const v = parseFloat(single[1]); return { min: v, max: v } }
  return null
}

function parseSize(value: string): number {
  const match = (value || '').match(/(\d+)\s*cm/i)
  return match ? parseInt(match[1]) : 0
}

function rangesOverlap(a: string, b: string): boolean {
  const ra = parseRange(a)
  const rb = parseRange(b)
  if (!ra || !rb) return true
  return Math.max(ra.min, rb.min) <= Math.min(ra.max, rb.max)
}

function isFreshwater(tipo: string): boolean {
  return tipo.includes('DULCI')
}

function isSaltwater(tipo: string): boolean {
  return tipo.includes('MARINHO')
}

function isAggressive(s: string): boolean {
  const l = normalize(s)
  return l.includes('agressiv') || l.includes('territorial') || l.includes('predador')
}

function isPeaceful(s: string): boolean {
  const l = normalize(s)
  return l.includes('pacif') || l.includes('calmo') || l.includes('tranquil') || l.includes('socia') || l.includes('docil')
}

function isCarnivore(s: string): boolean {
  const l = normalize(s)
  return l.includes('carniv') || l.includes('peixes vivos')
}

interface Recommendation {
  species: SpeciesOption
  score: number
  reasons: string[]
  warnings: string[]
}

function getRecommendations(main: SpeciesOption, allFish: SpeciesOption[], allPlants: SpeciesOption[]): {
  fish: Recommendation[]
  plants: Recommendation[]
} {
  const mainSize = parseSize(main.tamanhoAdulto)
  const mainAgg = isAggressive(main.comportamento)
  const mainCarn = isCarnivore(main.alimentacao)
  const mainFresh = isFreshwater(main.tipo)

  const fishRecs: Recommendation[] = []

  for (const candidate of allFish) {
    if (candidate.id === main.id) continue
    if (mainFresh !== isFreshwater(candidate.tipo)) continue
    if (isSaltwater(main.tipo) !== isSaltwater(candidate.tipo)) continue

    const reasons: string[] = []
    const warnings: string[] = []
    let score = 50

    // pH
    if (rangesOverlap(main.ph, candidate.ph)) {
      reasons.push('pH compativel')
      score += 10
    } else if (main.ph && candidate.ph) {
      continue
    }

    // Temperatura
    if (rangesOverlap(main.temperatura, candidate.temperatura)) {
      reasons.push('Temperatura compativel')
      score += 10
    } else if (main.temperatura && candidate.temperatura) {
      continue
    }

    // Tamanho/predacao
    const candSize = parseSize(candidate.tamanhoAdulto)
    if (mainSize && candSize) {
      const ratio = Math.max(mainSize, candSize) / Math.min(mainSize, candSize)
      if (ratio >= 4 && (mainCarn || isCarnivore(candidate.alimentacao))) {
        continue
      }
      if (ratio >= 3 && (mainCarn || isCarnivore(candidate.alimentacao))) {
        warnings.push('Diferenca de tamanho grande com dieta carnivora')
        score -= 20
      } else if (ratio <= 2) {
        reasons.push('Tamanho compativel')
        score += 10
      }
    }

    // Comportamento
    const candAgg = isAggressive(candidate.comportamento)
    const candPeace = isPeaceful(candidate.comportamento)

    if (mainAgg && candAgg) {
      warnings.push('Ambos agressivos/territoriais')
      score -= 15
    } else if (mainAgg && candPeace) {
      warnings.push('Peixe pacifico com parceiro agressivo')
      score -= 10
    } else if (candPeace && isPeaceful(main.comportamento)) {
      reasons.push('Ambos pacificos')
      score += 15
    }

    // Mesma familia
    if (main.familia && candidate.familia && normalize(main.familia) === normalize(candidate.familia)) {
      reasons.push(`Mesma familia (${main.familia})`)
      score += 5
    }

    // Posicao no aquario
    if (main.posicaoAquario && candidate.posicaoAquario) {
      if (normalize(main.posicaoAquario) !== normalize(candidate.posicaoAquario)) {
        reasons.push('Ocupam niveis diferentes do aquario')
        score += 5
      }
    }

    score = Math.max(0, Math.min(100, score))
    if (score >= 40) {
      fishRecs.push({ species: candidate, score, reasons, warnings })
    }
  }

  // Plantas
  const plantRecs: Recommendation[] = []

  if (mainFresh) {
    for (const plant of allPlants) {
      const reasons: string[] = []
      const warnings: string[] = []
      let score = 60

      if (rangesOverlap(main.ph, plant.ph)) {
        reasons.push('pH compativel')
        score += 10
      }

      if (rangesOverlap(main.temperatura, plant.temperatura)) {
        reasons.push('Temperatura compativel')
        score += 10
      }

      // Peixe come planta?
      const food = normalize(main.alimentacao)
      const behavior = normalize(main.comportamento)
      if (food.includes('planta') || food.includes('vegeta') || food.includes('herbivor')
        || behavior.includes('arranc') || behavior.includes('escav')) {
        warnings.push(`${main.nomePopular} pode danificar esta planta`)
        score -= 25
      }

      score = Math.max(0, Math.min(100, score))
      if (score >= 30) {
        plantRecs.push({ species: plant, score, reasons, warnings })
      }
    }
  }

  return {
    fish: fishRecs.sort((a, b) => b.score - a.score).slice(0, 20),
    plants: plantRecs.sort((a, b) => b.score - a.score).slice(0, 10),
  }
}

function RecCard({ rec, linkPrefix }: { rec: Recommendation; linkPrefix: string }) {
  const scoreBg = rec.score >= 70 ? 'bg-emerald-500' : rec.score >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
      <Link to={`${linkPrefix}/${rec.species.id}`} className="block">
        <div className="flex items-center gap-3 p-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0">
            <img
              src={getPrimaryImage(rec.species.imagem, rec.species.inatPhotos)}
              alt={rec.species.nomePopular}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = '/images/avatar.jpg' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-text truncate">{rec.species.nomePopular}</p>
              <span className={`${scoreBg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0`}>{rec.score}%</span>
            </div>
            <p className="text-[10px] text-text-secondary italic truncate">{rec.species.nomeCientifico}</p>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3 flex flex-wrap gap-1">
        {rec.reasons.map((r, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">
            <CheckCircle size={9} />
            {r}
          </span>
        ))}
        {rec.warnings.map((w, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-medium">
            <AlertTriangle size={9} />
            {w}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function AquariumBuilderPage() {
  const [allFish, setAllFish] = useState<SpeciesOption[]>([])
  const [allPlants, setAllPlants] = useState<SpeciesOption[]>([])
  const [loading, setLoading] = useState(true)
  const [mainFish, setMainFish] = useState<SpeciesOption | null>(null)
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(true)

  useEffect(() => {
    Promise.all([
      loadAllFish(),
      import('../data/plants').then(m => m.default),
    ]).then(([fish, plants]) => {
      const fishTypes: Record<string, string> = {
        PEIXESDULCICOLAS: 'agua-doce',
        PEIXESMARINHOS: 'agua-salgada',
        PEIXESINVERTEBRADOSDULCIOLAS: 'invertebrados-agua-doce',
        PEIXESINVERTEBRADOSMARINHOS: 'invertebrados-agua-salgada',
      }
      setAllFish(fish.map(f => ({
        id: f.id,
        nomePopular: f.nomePopular,
        nomeCientifico: f.nomeCientifico,
        imagem: f.imagem,
        ph: f.ph,
        temperatura: f.temperatura,
        gh: f.gh,
        kh: f.kh,
        tipo: f.tipo,
        comportamento: f.comportamento,
        alimentacao: f.alimentacao,
        tamanhoAdulto: f.tamanhoAdulto,
        posicaoAquario: f.posicaoAquario,
        familia: f.familia,
        inatPhotos: f.enrichment?.inatPhotoUrls,
        source: 'fish' as const,
        slug: fishTypes[f.tipo] || 'agua-doce',
      })).sort((a, b) => a.nomePopular.localeCompare(b.nomePopular)))
      setAllPlants((plants as Plant[]).map(p => ({
        id: p.id,
        nomePopular: p.nomePopular,
        nomeCientifico: p.nomeCientifico,
        imagem: p.imagem,
        ph: p.ph,
        temperatura: p.temperatura,
        gh: '',
        kh: '',
        tipo: 'PEIXESDULCICOLAS',
        comportamento: '',
        alimentacao: '',
        tamanhoAdulto: '',
        posicaoAquario: '',
        familia: p.familia,
        inatPhotos: p.enrichment?.inatPhotoUrls,
        source: 'plant' as const,
      })))
      setLoading(false)
    })
  }, [])

  const searchResults = useMemo(() => {
    if (!query.trim()) return allFish.slice(0, 15)
    const q = normalize(query)
    return allFish.filter(s => normalize(s.nomePopular).includes(q) || normalize(s.nomeCientifico).includes(q)).slice(0, 15)
  }, [allFish, query])

  const recommendations = useMemo(() => {
    if (!mainFish) return null
    return getRecommendations(mainFish, allFish, allPlants)
  }, [mainFish, allFish, allPlants])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        title="Montador de Aquario"
        subtitle="Escolha o peixe principal e descubra os melhores companheiros"
      />

      {!mainFish || showSearch ? (
        <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-4">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            {mainFish ? 'Trocar peixe principal' : 'Escolha o peixe principal'}
          </p>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar especie..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoFocus
            />
          </div>
          <div className="mt-2 max-h-72 overflow-y-auto">
            {searchResults.map(s => (
              <button
                key={s.id}
                onClick={() => { setMainFish(s); setShowSearch(false); setQuery('') }}
                className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-surface-alt rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0">
                  <img
                    src={getPrimaryImage(s.imagem, s.inatPhotos)}
                    alt={s.nomePopular}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = '/images/avatar.jpg' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{s.nomePopular}</p>
                  <p className="text-[11px] text-text-secondary italic truncate">{s.nomeCientifico}</p>
                </div>
                <Plus size={16} className="text-primary flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-4">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-3">Peixe principal</p>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-alt flex-shrink-0">
              <img
                src={getPrimaryImage(mainFish.imagem, mainFish.inatPhotos)}
                alt={mainFish.nomePopular}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = '/images/avatar.jpg' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text text-lg">{mainFish.nomePopular}</p>
              <p className="text-xs text-text-secondary italic">{mainFish.nomeCientifico}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {mainFish.ph && <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-alt font-medium text-text-secondary">pH {mainFish.ph}</span>}
                {mainFish.temperatura && <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-alt font-medium text-text-secondary">{mainFish.temperatura}</span>}
                {mainFish.tamanhoAdulto && <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-alt font-medium text-text-secondary">{mainFish.tamanhoAdulto}</span>}
              </div>
            </div>
            <button
              onClick={() => setShowSearch(true)}
              className="text-xs text-primary font-semibold hover:underline flex-shrink-0"
            >
              Trocar
            </button>
          </div>
        </div>
      )}

      {recommendations && (
        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FishIcon size={16} className="text-blue-500" />
              <p className="text-sm font-bold text-text">Peixes Recomendados</p>
              <span className="text-xs text-text-secondary">({recommendations.fish.length})</span>
            </div>
            {recommendations.fish.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {recommendations.fish.map(rec => (
                  <RecCard key={rec.species.id} rec={rec} linkPrefix={`/peixes/${rec.species.slug}`} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary py-4 text-center">Nenhum peixe compativel encontrado</p>
            )}
          </div>

          {recommendations.plants.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Leaf size={16} className="text-emerald-500" />
                <p className="text-sm font-bold text-text">Plantas Recomendadas</p>
                <span className="text-xs text-text-secondary">({recommendations.plants.length})</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {recommendations.plants.map(rec => (
                  <RecCard key={rec.species.id} rec={rec} linkPrefix="/plantas" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
