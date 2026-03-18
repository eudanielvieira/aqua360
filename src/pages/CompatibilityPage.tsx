import { useState, useEffect, useMemo } from 'react'
import { loadAllFish } from '../data/fish-index'
import type { Fish } from '../types'
import { checkCompatibility, type CompatibilityResult } from '../utils/compatibility'
import { getPrimaryImage } from '../utils/image'
import PageHeader from '../components/PageHeader'
import { Search, X, ArrowLeftRight, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

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

function SpeciesSelector({ label, species, selected, onSelect }: {
  label: string
  species: SpeciesOption[]
  selected: SpeciesOption | null
  onSelect: (s: SpeciesOption | null) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!query.trim()) return species.slice(0, 20)
    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const q = normalize(query)
    return species.filter(s =>
      normalize(s.nomePopular).includes(q) ||
      normalize(s.nomeCientifico).includes(q)
    ).slice(0, 20)
  }, [species, query])

  if (selected) {
    return (
      <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-4">
        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-3">{label}</p>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-alt flex-shrink-0">
            <img
              src={getPrimaryImage(selected.imagem, selected.inatPhotos)}
              alt={selected.nomePopular}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = '/images/avatar.jpg' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text truncate">{selected.nomePopular}</p>
            <p className="text-xs text-text-secondary italic truncate">{selected.nomeCientifico}</p>
          </div>
          <button
            onClick={() => { onSelect(null); setQuery('') }}
            className="p-2 rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-4">
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-3">{label}</p>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar espécie..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-border bg-card">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => { onSelect(s); setOpen(false); setQuery('') }}
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
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">{s.nomePopular}</p>
                <p className="text-[11px] text-text-secondary italic truncate">{s.nomeCientifico}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreIcon({ score }: { score: number }) {
  if (score >= 0.7) return <CheckCircle size={16} className="text-emerald-500" />
  if (score >= 0.4) return <AlertTriangle size={16} className="text-amber-500" />
  return <XCircle size={16} className="text-red-500" />
}

function ResultCard({ result, speciesA, speciesB }: {
  result: CompatibilityResult
  speciesA: string
  speciesB: string
}) {
  return (
    <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-6">
      <div className="text-center mb-6">
        <div className={`text-5xl font-extrabold ${result.color}`}>
          {result.score}%
        </div>
        <p className={`text-sm font-bold mt-1 ${result.color}`}>
          Compatibilidade {result.label}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {speciesA} + {speciesB}
        </p>
      </div>

      <div className="w-full h-2.5 rounded-full bg-surface-alt overflow-hidden mb-6">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            result.score >= 80 ? 'bg-emerald-500'
            : result.score >= 60 ? 'bg-blue-500'
            : result.score >= 40 ? 'bg-amber-500'
            : result.score >= 20 ? 'bg-orange-500'
            : 'bg-red-500'
          }`}
          style={{ width: `${result.score}%` }}
        />
      </div>

      <div className="space-y-3">
        {result.details.map((detail, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-alt/50">
            <ScoreIcon score={detail.score} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text">{detail.param}</p>
              <p className="text-xs text-text-secondary mt-0.5">{detail.note}</p>
            </div>
          </div>
        ))}
      </div>

      {result.warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.warnings.map((warn, i) => (
            <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-medium">{warn}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 rounded-xl bg-primary/5 flex items-start gap-2.5">
        <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Esta analise e baseada nos parametros ideais de cada especie. Fatores como tamanho do aquario,
          quantidade de peixes e decoracao tambem influenciam a convivencia. Consulte sempre um especialista.
        </p>
      </div>
    </div>
  )
}

export default function CompatibilityPage() {
  const [allSpecies, setAllSpecies] = useState<SpeciesOption[]>([])
  const [loading, setLoading] = useState(true)
  const [speciesA, setSpeciesA] = useState<SpeciesOption | null>(null)
  const [speciesB, setSpeciesB] = useState<SpeciesOption | null>(null)
  const [result, setResult] = useState<CompatibilityResult | null>(null)

  useEffect(() => {
    loadAllFish().then(fish => {
      setAllSpecies(fish.map(toOption).sort((a, b) => a.nomePopular.localeCompare(b.nomePopular)))
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (speciesA && speciesB) {
      const r = checkCompatibility(
        { ...speciesA, nomePopular: speciesA.nomePopular },
        { ...speciesB, nomePopular: speciesB.nomePopular },
      )
      setResult(r)
    } else {
      setResult(null)
    }
  }, [speciesA, speciesB])

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
        subtitle="Verifique se duas espécies podem conviver no mesmo aquário"
      />

      <div className="space-y-3">
        <SpeciesSelector
          label="Primeira espécie"
          species={allSpecies}
          selected={speciesA}
          onSelect={setSpeciesA}
        />

        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center">
            <ArrowLeftRight size={18} className="text-text-secondary" />
          </div>
        </div>

        <SpeciesSelector
          label="Segunda espécie"
          species={allSpecies.filter(s => s.id !== speciesA?.id)}
          selected={speciesB}
          onSelect={setSpeciesB}
        />
      </div>

      {result && speciesA && speciesB && (
        <div className="mt-6">
          <ResultCard
            result={result}
            speciesA={speciesA.nomePopular}
            speciesB={speciesB.nomePopular}
          />
        </div>
      )}

      {!speciesA && !speciesB && (
        <div className="mt-8 text-center py-8">
          <ArrowLeftRight size={32} className="text-border mx-auto mb-3" />
          <p className="text-sm text-text-secondary">
            Selecione duas espécies para verificar a compatibilidade
          </p>
        </div>
      )}
    </div>
  )
}
