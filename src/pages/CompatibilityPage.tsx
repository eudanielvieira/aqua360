import { useState, useEffect, useMemo } from 'react'
import { loadAllFish } from '../data/fish-index'
import type { Fish } from '../types'
import { checkCompatibility, type CompatibilityResult, type SpeciesParams } from '../utils/compatibility'
import { getPrimaryImage } from '../utils/image'
import PageHeader from '../components/PageHeader'
import { Search, X, Plus, CheckCircle, AlertTriangle, XCircle, Info, Trash2 } from 'lucide-react'

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

function SpeciesSearch({ species, selectedIds, onAdd }: {
  species: SpeciesOption[]
  selectedIds: Set<number>
  onAdd: (s: SpeciesOption) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const available = species.filter(s => !selectedIds.has(s.id))
    if (!query.trim()) return available.slice(0, 15)
    const q = normalize(query)
    return available.filter(s =>
      normalize(s.nomePopular).includes(q) ||
      normalize(s.nomeCientifico).includes(q)
    ).slice(0, 15)
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
          placeholder="Adicionar especie ao aquario..."
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

interface PairResult {
  a: SpeciesOption
  b: SpeciesOption
  result: CompatibilityResult
}

export default function CompatibilityPage() {
  const [allSpecies, setAllSpecies] = useState<SpeciesOption[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SpeciesOption[]>([])
  const [expandedPair, setExpandedPair] = useState<string | null>(null)

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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHeader
        title="Compatibilidade"
        subtitle="Monte seu aquario e verifique se as especies podem conviver"
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
              Seu aquario ({selected.length} {selected.length === 1 ? 'especie' : 'especies'})
            </p>
            {selected.length > 0 && (
              <button
                onClick={() => { setSelected([]); setExpandedPair(null) }}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-red-500 transition-colors"
              >
                <Trash2 size={12} />
                Limpar
              </button>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {selected.map(s => (
              <SpeciesChip
                key={s.id}
                species={s}
                onRemove={() => {
                  setSelected(prev => prev.filter(x => x.id !== s.id))
                  setExpandedPair(null)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {overallScore !== null && (
        <div className="mt-6 bg-card rounded-2xl shadow-sm shadow-black/5 p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className={`text-4xl font-extrabold ${
                overallScore >= 80 ? 'text-emerald-500'
                : overallScore >= 60 ? 'text-blue-500'
                : overallScore >= 40 ? 'text-amber-500'
                : overallScore >= 20 ? 'text-orange-500'
                : 'text-red-500'
              }`}>
                {overallScore}%
              </div>
              <p className="text-[10px] text-text-secondary font-medium mt-0.5">Geral</p>
            </div>
            <div className="flex-1">
              <div className="w-full h-2.5 rounded-full bg-surface-alt overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${scoreBgColor(overallScore)}`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary mt-1.5">
                {pairs.length} {pairs.length === 1 ? 'combinacao analisada' : 'combinacoes analisadas'}
              </p>
            </div>
          </div>

          {allWarnings.length > 0 && (
            <div className="space-y-2 mb-4">
              {allWarnings.map((warn, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-2">
                  <AlertTriangle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-medium">{warn}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {pairs.map(pair => {
              const key = `${pair.a.id}-${pair.b.id}`
              const isExpanded = expandedPair === key
              return (
                <div key={key}>
                  <button
                    onClick={() => setExpandedPair(isExpanded ? null : key)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-alt/50 hover:bg-surface-alt transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg ${scoreBgColor(pair.result.score)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xs font-bold text-white">{pair.result.score}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text truncate">
                        {pair.a.nomePopular} + {pair.b.nomePopular}
                      </p>
                      <p className={`text-xs font-medium ${pair.result.color}`}>
                        {pair.result.label}
                      </p>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="mt-2 ml-4 space-y-2 pb-2">
                      {pair.result.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-alt/30">
                          <ScoreIcon score={detail.score} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-text">{detail.param}</p>
                            <p className="text-[11px] text-text-secondary mt-0.5">{detail.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-primary/5 flex items-start gap-2.5">
            <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Analise baseada nos parametros ideais de cada especie. Tamanho do aquario,
              quantidade de peixes e decoracao tambem influenciam. Consulte um especialista.
            </p>
          </div>
        </div>
      )}

      {selected.length < 2 && (
        <div className="mt-8 text-center py-6">
          <Plus size={32} className="text-border mx-auto mb-3" />
          <p className="text-sm text-text-secondary">
            {selected.length === 0
              ? 'Adicione especies para montar seu aquario'
              : 'Adicione mais uma especie para ver a compatibilidade'}
          </p>
        </div>
      )}
    </div>
  )
}
