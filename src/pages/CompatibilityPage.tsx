import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { loadAllFish } from '../data/fish-index'
import type { Fish } from '../types'
import { checkCompatibility, type CompatibilityResult, type SpeciesParams } from '../utils/compatibility'
import { fuzzySearch } from '../utils/fuzzySearch'
import { getPrimaryImage } from '../utils/image'
import PageHeader from '../components/PageHeader'
import { Search, X, Plus, CheckCircle, AlertTriangle, XCircle, Info, Trash2, Droplets, Waves, Skull, Heart, Beef, Salad, Cookie } from 'lucide-react'

interface SpeciesOption extends SpeciesParams {
  id: number
  imagem: string
  nomeCientifico: string
  inatPhotos?: string[]
}

function toOption(fish: Fish): SpeciesOption {
  return {
    id: fish.id,
    nomePopular: fish.nomePopular,
    nomeCientifico: fish.nomeCientifico,
    imagem: fish.imagem,
    ph: fish.ph,
    temperatura: fish.temperatura,
    gh: fish.gh,
    kh: fish.kh,
    tipo: fish.tipo,
    comportamento: fish.comportamento,
    alimentacao: fish.alimentacao,
    tamanhoAdulto: fish.tamanhoAdulto,
    inatPhotos: fish.enrichment?.inatPhotoUrls,
  }
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isFreshwater(tipo: string): boolean {
  return tipo.includes('DULCI')
}

function SpeciesSearch({ species, selectedIds, onAdd }: {
  species: SpeciesOption[]
  selectedIds: Set<number>
  onAdd: (s: SpeciesOption) => void
}) {
  const { t } = useTranslation('compatibility')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const available = species.filter(s => !selectedIds.has(s.id))
    if (!query.trim()) return available.slice(0, 15)
    const fuzzyItems = available.map(s => ({ text: [s.nomePopular, s.nomeCientifico], data: s }))
    return fuzzySearch(fuzzyItems, query, 15).map(r => r.data as SpeciesOption)
  }, [species, query, selectedIds])

  return (
    <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-border bg-card">
          {filtered.map(s => (
            <button
              key={s.id}
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onAdd(s); setQuery(''); setOpen(false) }}
              className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-surface-alt transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0">
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
      )}
    </div>
  )
}

function SpeciesChip({ species, onRemove }: { species: SpeciesOption; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-card rounded-xl shadow-sm shadow-black/5">
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0">
        <img
          src={getPrimaryImage(species.imagem, species.inatPhotos)}
          alt={species.nomePopular}
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = '/images/avatar.jpg' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">{species.nomePopular}</p>
        <p className="text-[10px] text-text-secondary italic truncate">{species.nomeCientifico}</p>
      </div>
      <button onClick={onRemove} className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/5 transition-colors">
        <X size={14} />
      </button>
    </div>
  )
}

function ScoreIcon({ score }: { score: number }) {
  if (score >= 0.7) return <CheckCircle size={14} className="text-emerald-500" />
  if (score >= 0.4) return <AlertTriangle size={14} className="text-amber-500" />
  return <XCircle size={14} className="text-red-500" />
}

function scoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

function scoreTextColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  if (score >= 20) return 'text-orange-600'
  return 'text-red-600'
}

function hasConflict(values: string[]): boolean {
  const unique = new Set(values.filter(v => v))
  return unique.size > 1
}

interface PairResult {
  a: SpeciesOption
  b: SpeciesOption
  result: CompatibilityResult
}

function ComparisonTable({ selected, pairs }: { selected: SpeciesOption[]; pairs: PairResult[] }) {
  const { t } = useTranslation(['compatibility', 'common'])
  if (selected.length < 2) return null

  const params: { key: keyof SpeciesOption; label: string }[] = [
    { key: 'ph', label: 'pH' },
    { key: 'temperatura', label: 'Temperatura' },
    { key: 'gh', label: 'GH' },
    { key: 'kh', label: 'KH' },
    { key: 'tamanhoAdulto', label: 'Tamanho' },
  ]

  // Calcular score e pior problema de cada especie
  const speciesIssues = new Map<number, { worstScore: number; reason: string }>()
  for (const s of selected) {
    let worstScore = 100
    let reason = ''
    for (const pair of pairs) {
      if (pair.a.id !== s.id && pair.b.id !== s.id) continue
      if (pair.result.score < worstScore) {
        worstScore = pair.result.score
        const other = pair.a.id === s.id ? pair.b : pair.a
        const worstDetail = pair.result.details.reduce((min, d) => d.score < min.score ? d : min, pair.result.details[0])
        if (worstDetail) {
          reason = `${worstDetail.param}: incompativel com ${other.nomePopular}`
        }
        if (pair.result.warnings.length > 0) {
          reason = pair.result.warnings[0]
        }
      }
    }
    speciesIssues.set(s.id, { worstScore, reason })
  }

  return (
    <div className="mt-4 bg-card rounded-2xl shadow-sm shadow-black/5 overflow-hidden">
      <div className="p-4 pb-2">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{t('compatibility:comparisonTable')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left p-3 font-semibold text-text-secondary w-28"></th>
              {selected.map(s => {
                const issue = speciesIssues.get(s.id)
                const isBad = issue && issue.worstScore < 40
                return (
                  <th key={s.id} className={`p-3 text-center min-w-[110px] ${isBad ? 'bg-red-500/5' : ''}`}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-10 h-10 rounded-lg overflow-hidden ${isBad ? 'ring-2 ring-red-500 ring-offset-1' : 'bg-surface-alt'}`}>
                        <img
                          src={getPrimaryImage(s.imagem, s.inatPhotos)}
                          alt={s.nomePopular}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = '/images/avatar.jpg' }}
                        />
                      </div>
                      <span className={`font-bold truncate max-w-[100px] ${isBad ? 'text-red-600' : 'text-text'}`}>{s.nomePopular}</span>
                      {isBad && issue?.reason && (
                        <span className="text-[9px] text-red-500 font-medium leading-tight text-center max-w-[110px]">
                          {issue.reason}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {params.map(param => {
              const values = selected.map(s => (s[param.key] as string) || '-')
              const conflict = hasConflict(values)
              return (
                <tr key={param.key} className={`border-b border-border/40 ${conflict ? 'bg-red-500/3' : ''}`}>
                  <td className="p-3 font-semibold text-text-secondary">{param.label}</td>
                  {selected.map((s, i) => {
                    const isBad = speciesIssues.get(s.id)?.worstScore ?? 100
                    return (
                      <td key={s.id} className={`p-3 text-center font-medium ${isBad < 40 ? 'bg-red-500/5' : ''} ${conflict ? 'text-amber-600 dark:text-amber-400' : 'text-text'}`}>
                        {values[i]}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr className="border-b border-border/40">
              <td className="p-3 font-semibold text-text-secondary">{t('compatibility:water')}</td>
              {selected.map(s => {
                const fresh = isFreshwater(s.tipo || '')
                const isBad = speciesIssues.get(s.id)?.worstScore ?? 100
                return (
                  <td key={s.id} className={`p-3 text-center ${isBad < 40 ? 'bg-red-500/5' : ''}`}>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${fresh ? 'bg-cyan-500/10 text-cyan-600' : 'bg-blue-500/10 text-blue-600'}`}>
                      {fresh ? <Droplets size={10} /> : <Waves size={10} />}
                      {fresh ? t('common:water.fresh') : t('common:water.salt')}
                    </span>
                  </td>
                )
              })}
            </tr>
            <tr className="border-b border-border/40">
              <td className="p-3 font-semibold text-text-secondary">{t('compatibility:diet')}</td>
              {selected.map(s => {
                const food = normalize(s.alimentacao || '')
                const isCarn = food.includes('carniv') || food.includes('peixes vivos')
                const isHerb = food.includes('herbivor') || food.includes('vegeta')
                const isOmni = food.includes('onivor')
                const label = isCarn ? t('common:diet.carnivore') : isHerb ? t('common:diet.herbivore') : isOmni ? t('common:diet.omnivore') : '-'
                const Icon = isCarn ? Beef : isHerb ? Salad : Cookie
                const color = isCarn ? 'bg-red-500/10 text-red-600' : isHerb ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                const isBad = speciesIssues.get(s.id)?.worstScore ?? 100
                return (
                  <td key={s.id} className={`p-3 text-center ${isBad < 40 ? 'bg-red-500/5' : ''}`}>
                    {label !== '-' ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${color}`}>
                        <Icon size={10} />
                        {label}
                      </span>
                    ) : <span className="text-text-secondary">-</span>}
                  </td>
                )
              })}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-text-secondary">{t('compatibility:temperament')}</td>
              {selected.map(s => {
                const b = normalize(s.comportamento || '')
                const isAgg = b.includes('agressiv') || b.includes('territorial')
                const isPeace = b.includes('pacif') || b.includes('calmo') || b.includes('tranquil')
                const isBad = speciesIssues.get(s.id)?.worstScore ?? 100
                return (
                  <td key={s.id} className={`p-3 text-center ${isBad < 40 ? 'bg-red-500/5' : ''}`}>
                    {(isAgg || isPeace) ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${isAgg ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {isAgg ? <Skull size={10} /> : <Heart size={10} />}
                        {isAgg ? t('common:temperament.aggressive') : t('common:temperament.peaceful')}
                      </span>
                    ) : <span className="text-text-secondary">-</span>}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function CompatibilityPage() {
  const { t } = useTranslation(['compatibility', 'common'])
  const [allSpecies, setAllSpecies] = useState<SpeciesOption[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SpeciesOption[]>([])

  useEffect(() => {
    loadAllFish().then(fish => {
      setAllSpecies(fish.map(toOption).sort((a, b) => a.nomePopular.localeCompare(b.nomePopular)))
      setLoading(false)
    })
  }, [])

  const selectedIds = useMemo(() => new Set(selected.map(s => s.id)), [selected])

  const pairs = useMemo((): PairResult[] => {
    if (selected.length < 2) return []
    const results: PairResult[] = []
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        results.push({
          a: selected[i],
          b: selected[j],
          result: checkCompatibility(selected[i], selected[j]),
        })
      }
    }
    return results.sort((a, b) => a.result.score - b.result.score)
  }, [selected])

  const overallScore = pairs.length > 0
    ? Math.round(pairs.reduce((sum, p) => sum + p.result.score, 0) / pairs.length)
    : null

  const allWarnings = useMemo(() => {
    const warns = new Set<string>()
    pairs.forEach(p => p.result.warnings.forEach(w => warns.add(w)))
    return Array.from(warns)
  }, [pairs])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">{t('common:loading')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        title={t('compatibility:title')}
        subtitle={t('compatibility:subtitle')}
      />

      <SpeciesSearch
        species={allSpecies}
        selectedIds={selectedIds}
        onAdd={s => setSelected(prev => [...prev, s])}
      />

      {selected.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {t('compatibility:yourAquarium')} ({selected.length} {selected.length === 1 ? t('common:species') : t('common:speciesPlural')})
            </p>
            <button
              onClick={() => setSelected([])}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
              {t('common:clear')}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {selected.map(s => (
              <SpeciesChip key={s.id} species={s} onRemove={() => setSelected(prev => prev.filter(x => x.id !== s.id))} />
            ))}
          </div>
        </div>
      )}

      {overallScore !== null && (
        <>
          <div className="mt-6 bg-card rounded-2xl shadow-sm shadow-black/5 p-5">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-4xl font-extrabold ${scoreTextColor(overallScore)}`}>
                  {overallScore}%
                </div>
                <p className="text-[10px] text-text-secondary font-medium mt-0.5">{t('compatibility:overall')}</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-2.5 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreBgColor(overallScore)}`}
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1.5">
                  {pairs.length} {pairs.length === 1 ? t('common:combination') : t('common:combinationPlural')} analisadas
                </p>
              </div>
            </div>

            {allWarnings.length > 0 && (
              <div className="space-y-2 mt-4">
                {allWarnings.map((warn, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-2">
                    <AlertTriangle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-medium">{warn}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ComparisonTable selected={selected} pairs={pairs} />

          <div className="mt-4 bg-card rounded-2xl shadow-sm shadow-black/5 p-5">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('compatibility:analysisTitle')}</p>
            <div className="space-y-3">
              {pairs.map(pair => {
                const key = `${pair.a.id}-${pair.b.id}`
                return (
                  <div key={key} className="rounded-xl bg-surface-alt/50 overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <div className={`w-8 h-8 rounded-lg ${scoreBgColor(pair.result.score)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xs font-bold text-white">{pair.result.score}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">
                          {pair.a.nomePopular} + {pair.b.nomePopular}
                        </p>
                      </div>
                      <span className={`text-xs font-bold ${pair.result.color} flex-shrink-0`}>{pair.result.label}</span>
                    </div>
                    <div className="px-3 pb-3 grid gap-1.5">
                      {pair.result.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-card/50">
                          <ScoreIcon score={detail.score} />
                          <p className="text-[11px] text-text-secondary flex-1"><span className="font-semibold text-text">{detail.param}:</span> {detail.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-primary/5 flex items-start gap-2.5">
              <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {t('compatibility:analysisNote')}
              </p>
            </div>
          </div>
        </>
      )}

      {selected.length < 2 && (
        <div className="mt-8 text-center py-6">
          <Plus size={32} className="text-border mx-auto mb-3" />
          <p className="text-sm text-text-secondary">
            {selected.length === 0
              ? t('compatibility:addSpecies')
              : t('compatibility:addOneMore')}
          </p>
        </div>
      )}
    </div>
  )
}
