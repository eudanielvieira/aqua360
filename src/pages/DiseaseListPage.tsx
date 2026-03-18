import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Disease } from '../types'
import { useSearch } from '../hooks/useSearch'
import { getImageUrl } from '../utils/image'
import PageHeader from '../components/PageHeader'
import SearchBar from '../components/SearchBar'
import { ChevronRight } from 'lucide-react'

export default function DiseaseListPage() {
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../data/diseases').then(mod => {
      setDiseases(mod.default.sort((a, b) => a.nome.localeCompare(b.nome)))
      setLoading(false)
    })
  }, [])

  const { query, setQuery, filtered } = useSearch(diseases, ['nome', 'nomeCientifico'])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Carregando...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader title="Doenças e Tratamentos" subtitle={`${filtered.length} doenças`} />

      <div className="mb-6">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar doença..."
        />
      </div>

      <div className="grid gap-3">
        {filtered.map(disease => (
          <Link
            key={disease.id}
            to={`/doencas/${disease.id}`}
            className="group flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={getImageUrl(disease.imagem)}
                alt={disease.nome}
                className="w-full h-full object-cover"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/avatar.jpg'
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text">{disease.nome}</h3>
              {disease.nomeCientifico && (
                <p className="text-xs text-text-secondary italic mt-0.5 truncate">{disease.nomeCientifico}</p>
              )}
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary py-12">Nenhuma doença encontrada.</p>
      )}
    </div>
  )
}
