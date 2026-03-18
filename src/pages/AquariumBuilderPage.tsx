import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { loadAllFish } from '../data/fish-index'
import type { Plant, Coral } from '../types'
import { getPrimaryImage } from '../utils/image'
import { fuzzySearch } from '../utils/fuzzySearch'
import PageHeader from '../components/PageHeader'
import { Search, CheckCircle, AlertTriangle, Leaf, Fish as FishIcon, Shell, Gem, Plus } from 'lucide-react'

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
  source: 'fish' | 'plant' | 'invert' | 'coral'
  linkPath: string
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

function overlapRange(a: string, b: string): string {
  const ra = parseRange(a)
  const rb = parseRange(b)
  if (!ra || !rb) return ''
  const min = Math.max(ra.min, rb.min)
  const max = Math.min(ra.max, rb.max)
  if (min > max) return ''
  return `${min.toFixed(1)}-${max.toFixed(1)}`
}

function isFreshwater(tipo: string): boolean { return tipo.includes('DULCI') }
function isSaltwater(tipo: string): boolean { return tipo.includes('MARINHO') }
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
function eatsInverts(s: string): boolean {
  const l = normalize(s)
  return l.includes('camar') || l.includes('crustac') || l.includes('caracol') || l.includes('molusco') || l.includes('invertebrad')
}

interface Recommendation {
  species: SpeciesOption
  score: number
  reasons: string[]
  warnings: string[]
}

function getRecommendations(
  main: SpeciesOption,
  allFish: SpeciesOption[],
  allPlants: SpeciesOption[],
  allInverts: SpeciesOption[],
  allCorals: SpeciesOption[],
): {
  fish: Recommendation[]
  inverts: Recommendation[]
  plants: Recommendation[]
  corals: Recommendation[]
} {
  const mainSize = parseSize(main.tamanhoAdulto)
  const mainAgg = isAggressive(main.comportamento)
  const mainCarn = isCarnivore(main.alimentacao)
  const mainEatsInverts = eatsInverts(main.alimentacao)
  const mainFresh = isFreshwater(main.tipo)
  const mainSalt = isSaltwater(main.tipo)

  // Peixes
  const fishRecs: Recommendation[] = []
  for (const c of allFish) {
    if (c.id === main.id || c.source !== 'fish') continue
    if (mainFresh !== isFreshwater(c.tipo)) continue

    const reasons: string[] = []
    const warnings: string[] = []
    let score = 50

    const phOk = rangesOverlap(main.ph, c.ph)
    const tempOk = rangesOverlap(main.temperatura, c.temperatura)

    if (phOk && main.ph && c.ph) {
      const range = overlapRange(main.ph, c.ph)
      reasons.push(range ? `pH ideal: ${range}` : 'pH compativel')
      score += 10
    } else if (main.ph && c.ph && !phOk) continue

    if (tempOk && main.temperatura && c.temperatura) {
      const range = overlapRange(main.temperatura, c.temperatura)
      reasons.push(range ? `Temp ideal: ${range}` : 'Temperatura compativel')
      score += 10
    } else if (main.temperatura && c.temperatura && !tempOk) continue

    const candSize = parseSize(c.tamanhoAdulto)
    if (mainSize && candSize) {
      const ratio = Math.max(mainSize, candSize) / Math.min(mainSize, candSize)
      if (ratio >= 4 && (mainCarn || isCarnivore(c.alimentacao))) continue
      if (ratio >= 3 && (mainCarn || isCarnivore(c.alimentacao))) {
        warnings.push('Risco de predacao pelo tamanho')
        score -= 20
      } else if (ratio <= 2) {
        reasons.push(`Tamanhos similares (${mainSize}cm / ${candSize}cm)`)
        score += 10
      }
    }

    const candAgg = isAggressive(c.comportamento)
    if (mainAgg && candAgg) {
      warnings.push('Ambos agressivos')
      score -= 15
    } else if ((mainAgg && isPeaceful(c.comportamento)) || (candAgg && isPeaceful(main.comportamento))) {
      warnings.push('Agressivo + pacifico')
      score -= 10
    } else if (isPeaceful(c.comportamento) && isPeaceful(main.comportamento)) {
      reasons.push('Ambos pacificos')
      score += 15
    }

    if (main.posicaoAquario && c.posicaoAquario && normalize(main.posicaoAquario) !== normalize(c.posicaoAquario)) {
      reasons.push(`Niveis diferentes (${main.posicaoAquario} / ${c.posicaoAquario})`)
      score += 5
    }

    if (main.familia && c.familia && normalize(main.familia) === normalize(c.familia)) {
      reasons.push(`Mesma familia (${main.familia})`)
      score += 5
    }

    score = Math.max(0, Math.min(100, score))
    if (score >= 40) fishRecs.push({ species: c, score, reasons, warnings })
  }

  // Invertebrados
  const invertRecs: Recommendation[] = []
  for (const c of allInverts) {
    if (mainFresh !== isFreshwater(c.tipo)) continue

    const reasons: string[] = []
    const warnings: string[] = []
    let score = 55

    if (rangesOverlap(main.ph, c.ph)) { reasons.push('pH compativel'); score += 10 }
    if (rangesOverlap(main.temperatura, c.temperatura)) { reasons.push('Temperatura compativel'); score += 10 }

    if (mainEatsInverts) {
      warnings.push(`${main.nomePopular} se alimenta de invertebrados`)
      score -= 30
    }

    if (mainCarn && mainSize > 15) {
      warnings.push(`${main.nomePopular} e grande e carnivoro`)
      score -= 20
    }

    if (!mainEatsInverts && !mainAgg) {
      reasons.push('Peixe principal nao ameaca invertebrados')
      score += 10
    }

    score = Math.max(0, Math.min(100, score))
    if (score >= 30) invertRecs.push({ species: c, score, reasons, warnings })
  }

  // Plantas
  const plantRecs: Recommendation[] = []
  if (mainFresh) {
    const food = normalize(main.alimentacao)
    const behavior = normalize(main.comportamento)
    const eatsPlants = food.includes('planta') || food.includes('vegeta') || food.includes('herbivor')
      || behavior.includes('arranc') || behavior.includes('escav')

    for (const c of allPlants) {
      const reasons: string[] = []
      const warnings: string[] = []
      let score = 60

      if (rangesOverlap(main.ph, c.ph)) { reasons.push('pH compativel'); score += 10 }
      if (rangesOverlap(main.temperatura, c.temperatura)) { reasons.push('Temperatura compativel'); score += 10 }

      if (eatsPlants) {
        warnings.push(`${main.nomePopular} pode danificar plantas`)
        score -= 25
      } else {
        reasons.push('Peixe nao come plantas')
        score += 5
      }

      score = Math.max(0, Math.min(100, score))
      if (score >= 30) plantRecs.push({ species: c, score, reasons, warnings })
    }
  }

  // Corais (apenas agua salgada)
  const coralRecs: Recommendation[] = []
  if (mainSalt) {
    for (const c of allCorals) {
      const reasons: string[] = []
      const warnings: string[] = []
      let score = 60

      reasons.push('Mesmo ambiente marinho')
      score += 10

      if (mainAgg) {
        warnings.push(`${main.nomePopular} pode danificar corais`)
        score -= 15
      }

      const coralFood = normalize(c.alimentacao)
      if (coralFood.includes('aiptasia') || coralFood.includes('alga')) {
        reasons.push('Ajuda no controle de pragas')
        score += 5
      }

      if (!mainAgg && isPeaceful(main.comportamento)) {
        reasons.push('Peixe pacifico, seguro para corais')
        score += 10
      }

      score = Math.max(0, Math.min(100, score))
      if (score >= 40) coralRecs.push({ species: c, score, reasons, warnings })
    }
  }

  return {
    fish: fishRecs.sort((a, b) => b.score - a.score).slice(0, 20),
    inverts: invertRecs.sort((a, b) => b.score - a.score).slice(0, 10),
    plants: plantRecs.sort((a, b) => b.score - a.score).slice(0, 10),
    corals: coralRecs.sort((a, b) => b.score - a.score).slice(0, 10),
  }
}

function RecCard({ rec }: { rec: Recommendation }) {
  const scoreBg = rec.score >= 70 ? 'bg-emerald-500' : rec.score >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="bg-card rounded-xl shadow-sm shadow-black/5 overflow-hidden">
      <Link to={rec.species.linkPath} className="block">
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

function Section({ icon: Icon, color, title, count, children }: {
  icon: typeof FishIcon; color: string; title: string; count: number; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} />
        <p className="text-sm font-bold text-text">{title}</p>
        <span className="text-xs text-text-secondary">({count})</span>
      </div>
      {children}
    </div>
  )
}

export default function AquariumBuilderPage() {
  const [allFish, setAllFish] = useState<SpeciesOption[]>([])
  const [allInverts, setAllInverts] = useState<SpeciesOption[]>([])
  const [allPlants, setAllPlants] = useState<SpeciesOption[]>([])
  const [allCorals, setAllCorals] = useState<SpeciesOption[]>([])
  const [loading, setLoading] = useState(true)
  const [mainFish, setMainFish] = useState<SpeciesOption | null>(null)
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(true)

  useEffect(() => {
    const fishTypes: Record<string, string> = {
      PEIXESDULCICOLAS: 'agua-doce',
      PEIXESMARINHOS: 'agua-salgada',
      PEIXESINVERTEBRADOSDULCIOLAS: 'invertebrados-agua-doce',
      PEIXESINVERTEBRADOSMARINHOS: 'invertebrados-agua-salgada',
    }

    Promise.all([
      loadAllFish(),
      import('../data/plants').then(m => m.default),
      import('../data/corals').then(m => m.default),
    ]).then(([fish, plants, corals]) => {
      const fishList: SpeciesOption[] = []
      const invertList: SpeciesOption[] = []

      for (const f of fish) {
        const isInvert = f.tipo.includes('INVERTEBRAD')
        const slug = fishTypes[f.tipo] || 'agua-doce'
        const opt: SpeciesOption = {
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
          source: isInvert ? 'invert' : 'fish',
          linkPath: `/peixes/${slug}/${f.id}`,
        }
        if (isInvert) invertList.push(opt)
        else fishList.push(opt)
      }

      setAllFish(fishList.sort((a, b) => a.nomePopular.localeCompare(b.nomePopular)))
      setAllInverts(invertList.sort((a, b) => a.nomePopular.localeCompare(b.nomePopular)))
      setAllPlants((plants as Plant[]).map(p => ({
        id: p.id, nomePopular: p.nomePopular, nomeCientifico: p.nomeCientifico,
        imagem: p.imagem, ph: p.ph, temperatura: p.temperatura, gh: '', kh: '',
        tipo: 'PEIXESDULCICOLAS', comportamento: '', alimentacao: '', tamanhoAdulto: '',
        posicaoAquario: '', familia: p.familia, inatPhotos: p.enrichment?.inatPhotoUrls,
        source: 'plant' as const, linkPath: `/plantas/${p.id}`,
      })))
      setAllCorals((corals as Coral[]).map(c => ({
        id: c.id, nomePopular: c.nomePopular, nomeCientifico: c.nomeCientifico,
        imagem: '', ph: '', temperatura: '', gh: '', kh: '',
        tipo: 'PEIXESINVERTEBRADOSMARINHOS', comportamento: c.compatibilidade || '',
        alimentacao: c.alimentacao || '', tamanhoAdulto: '', posicaoAquario: '',
        familia: c.familia, inatPhotos: c.enrichment?.inatPhotoUrls,
        source: 'coral' as const, linkPath: `/corais/${c.id}`,
      })))
      setLoading(false)
    })
  }, [])

  const searchResults = useMemo(() => {
    if (!query.trim()) return allFish.slice(0, 15)
    const fuzzyItems = allFish.map(s => ({ text: [s.nomePopular, s.nomeCientifico], data: s }))
    return fuzzySearch(fuzzyItems, query, 15).map(r => r.data as SpeciesOption)
  }, [allFish, query])

  const recommendations = useMemo(() => {
    if (!mainFish) return null
    return getRecommendations(mainFish, allFish, allPlants, allInverts, allCorals)
  }, [mainFish, allFish, allPlants, allInverts, allCorals])

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
                  <img src={getPrimaryImage(s.imagem, s.inatPhotos)} alt={s.nomePopular}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = '/images/avatar.jpg' }} />
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
              <img src={getPrimaryImage(mainFish.imagem, mainFish.inatPhotos)} alt={mainFish.nomePopular}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = '/images/avatar.jpg' }} />
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
            <button onClick={() => setShowSearch(true)} className="text-xs text-primary font-semibold hover:underline flex-shrink-0">
              Trocar
            </button>
          </div>
        </div>
      )}

      {recommendations && (
        <div className="mt-6 space-y-8">
          {recommendations.fish.length > 0 && (
            <Section icon={FishIcon} color="text-blue-500" title="Peixes Recomendados" count={recommendations.fish.length}>
              <div className="grid gap-2 sm:grid-cols-2">
                {recommendations.fish.map(rec => <RecCard key={rec.species.id} rec={rec} />)}
              </div>
            </Section>
          )}

          {recommendations.inverts.length > 0 && (
            <Section icon={Shell} color="text-emerald-500" title="Invertebrados Recomendados" count={recommendations.inverts.length}>
              <div className="grid gap-2 sm:grid-cols-2">
                {recommendations.inverts.map(rec => <RecCard key={rec.species.id} rec={rec} />)}
              </div>
            </Section>
          )}

          {recommendations.plants.length > 0 && (
            <Section icon={Leaf} color="text-green-500" title="Plantas Recomendadas" count={recommendations.plants.length}>
              <div className="grid gap-2 sm:grid-cols-2">
                {recommendations.plants.map(rec => <RecCard key={rec.species.id} rec={rec} />)}
              </div>
            </Section>
          )}

          {recommendations.corals.length > 0 && (
            <Section icon={Gem} color="text-violet-500" title="Corais Recomendados" count={recommendations.corals.length}>
              <div className="grid gap-2 sm:grid-cols-2">
                {recommendations.corals.map(rec => <RecCard key={rec.species.id} rec={rec} />)}
              </div>
            </Section>
          )}

          {recommendations.fish.length === 0 && recommendations.plants.length === 0 && recommendations.inverts.length === 0 && recommendations.corals.length === 0 && (
            <p className="text-sm text-text-secondary py-4 text-center">Nenhuma recomendacao encontrada para esta especie</p>
          )}
        </div>
      )}
    </div>
  )
}
