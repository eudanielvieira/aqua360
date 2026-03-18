import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Disease, DiseaseCategory } from '../types'
import { useSearch } from '../hooks/useSearch'
import PageHeader from '../components/PageHeader'
import SearchBar from '../components/SearchBar'
import { ArrowRight, Bug, Microscope, Leaf, CircleDot, HelpCircle, Dna } from 'lucide-react'

const categoryConfig: Record<DiseaseCategory, {
  label: string
  icon: typeof Bug
  color: string
  bg: string
  gradient: string
}> = {
  protozoario: {
    label: 'Protozoário',
    icon: Microscope,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    gradient: 'from-purple-500 to-violet-400',
  },
  bacteria: {
    label: 'Bactéria',
    icon: Dna,
    color: 'text-red-700',
    bg: 'bg-red-100',
    gradient: 'from-red-500 to-rose-400',
  },
  parasita: {
    label: 'Parasita',
    icon: Bug,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    gradient: 'from-amber-500 to-orange-400',
  },
  fungo: {
    label: 'Fungo',
    icon: Leaf,
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    gradient: 'from-emerald-500 to-green-400',
  },
  virus: {
    label: 'Vírus',
    icon: CircleDot,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    gradient: 'from-blue-500 to-cyan-400',
  },
  outro: {
    label: 'Outros',
    icon: HelpCircle,
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    gradient: 'from-gray-500 to-slate-400',
  },
}

export default function DiseaseListPage() {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<DiseaseCategory | 'all'>('all')

  useEffect(() => {
    import('../data/diseases').then(mod => {
      setDiseases(mod.default.sort((a, b) => a.nome.localeCompare(b.nome)))
      setLoading(false)
    })
  }, [])

  const { query, setQuery, filtered: searchFiltered } = useSearch(diseases, ['nome', 'nomeCientifico'])

  const filtered = activeFilter === 'all'
    ? searchFiltered
    : searchFiltered.filter(d => d.categoria === activeFilter)

  const categoryCounts = diseases.reduce<Record<string, number>>((acc, d) => {
    acc[d.categoria] = (acc[d.categoria] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Carregando...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Doenças e Tratamentos" subtitle={`${diseases.length} doenças catalogadas`} />

      <div className="mb-6">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar doença..."
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-card text-text-secondary border border-border hover:border-primary/30'
          }`}
        >
          Todas ({diseases.length})
        </button>
        {(Object.entries(categoryConfig) as [DiseaseCategory, typeof categoryConfig[DiseaseCategory]][]).map(([key, config]) => {
          const count = categoryCounts[key] || 0
          if (count === 0) return null
          const Icon = config.icon
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(activeFilter === key ? 'all' : key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === key
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                  : `${config.bg} ${config.color} hover:shadow-sm`
              }`}
            >
              <Icon size={13} />
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid gap-3">
        {filtered.map(disease => {
          const config = categoryConfig[disease.categoria]
          const Icon = config.icon
          return (
            <Link
              key={disease.id}
              to={`/doencas/${disease.id}`}
              className="group flex items-center gap-4 p-4 bg-card rounded-2xl shadow-sm shadow-black/5 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-text truncate">{disease.nome}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${config.bg} ${config.color} flex-shrink-0`}>
                    <Icon size={10} />
                    {config.label}
                  </span>
                </div>
                {disease.nomeCientifico && (
                  <p className="text-xs text-text-secondary italic truncate">{disease.nomeCientifico}</p>
                )}
              </div>
              <ArrowRight size={16} className="text-border group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary py-12">Nenhuma doença encontrada.</p>
      )}
    </div>
  )
}
