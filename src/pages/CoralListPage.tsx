import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Coral, CoralCategory } from '../types'
import { useSearch } from '../hooks/useSearch'
import { getPrimaryImage } from '../utils/image'
import PageHeader from '../components/PageHeader'
import SearchBar from '../components/SearchBar'
import { Gem, Shell, Hexagon, Circle } from 'lucide-react'

const categoryConfig: Record<CoralCategory, {
  label: string
  icon: typeof Gem
  gradient: string
  bg: string
  color: string
}> = {
  mole: {
    label: 'Coral Mole',
    icon: Circle,
    gradient: 'from-pink-500 to-rose-400',
    bg: 'bg-pink-100',
    color: 'text-pink-700',
  },
  'duro-lps': {
    label: 'LPS',
    icon: Hexagon,
    gradient: 'from-orange-500 to-amber-400',
    bg: 'bg-orange-100',
    color: 'text-orange-700',
  },
  'duro-sps': {
    label: 'SPS',
    icon: Gem,
    gradient: 'from-violet-500 to-purple-400',
    bg: 'bg-violet-100',
    color: 'text-violet-700',
  },
  anemona: {
    label: 'Anemona',
    icon: Shell,
    gradient: 'from-cyan-500 to-teal-400',
    bg: 'bg-cyan-100',
    color: 'text-cyan-700',
  },
}

export default function CoralListPage() {
  const [corals, setCorals] = useState<Coral[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<CoralCategory | 'all'>('all')

  useEffect(() => {
    import('../data/corals').then(mod => {
      setCorals(mod.default.sort((a, b) => a.nomePopular.localeCompare(b.nomePopular)))
      setLoading(false)
    })
  }, [])

  const { query, setQuery, filtered: searchFiltered } = useSearch(corals, ['nomePopular', 'nomeCientifico', 'familia'])

  const filtered = activeFilter === 'all'
    ? searchFiltered
    : searchFiltered.filter(c => c.categoria === activeFilter)

  const categoryCounts = corals.reduce<Record<string, number>>((acc, c) => {
    acc[c.categoria] = (acc[c.categoria] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHeader title="Corais e Anemonas" subtitle={`${corals.length} especies catalogadas`} />

      <div className="mb-6">
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar coral ou anemona..." />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-card text-text-secondary hover:shadow-sm'
          }`}
        >
          Todos ({corals.length})
        </button>
        {(Object.entries(categoryConfig) as [CoralCategory, typeof categoryConfig[CoralCategory]][]).map(([key, config]) => {
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map(coral => {
          const config = categoryConfig[coral.categoria]
          const Icon = config.icon
          return (
            <Link
              key={coral.id}
              to={`/corais/${coral.id}`}
              className="group bg-card rounded-2xl shadow-sm shadow-black/5 overflow-hidden hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden bg-surface-alt relative">
                {coral.enrichment?.inatPhotoUrls?.[0] ? (
                  <img
                    src={getPrimaryImage('', coral.enrichment.inatPhotoUrls)}
                    alt={coral.nomePopular}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                    <Icon size={48} className="text-white/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-sm ${config.color}`}>
                    <Icon size={10} />
                    {config.label}
                  </span>
                </div>
              </div>
              <div className="p-3.5">
                <h3 className="font-semibold text-sm text-text truncate leading-tight">{coral.nomePopular}</h3>
                <p className="text-xs text-text-secondary italic truncate mt-1">{coral.nomeCientifico}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary py-12">Nenhum coral encontrado.</p>
      )}
    </div>
  )
}
