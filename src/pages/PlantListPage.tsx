import { useState, useEffect } from 'react'
import type { Plant } from '../types'
import { useSearch } from '../hooks/useSearch'
import PageHeader from '../components/PageHeader'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'

const PAGE_SIZE = 30

export default function PlantListPage() {
  const [allPlants, setAllPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    import('../data/plants').then(mod => {
      setAllPlants(mod.default.sort((a, b) => a.nomePopular.localeCompare(b.nomePopular)))
      setLoading(false)
    })
  }, [])

  const { query, setQuery, filtered } = useSearch(allPlants, ['nomePopular', 'nomeCientifico', 'familia'])
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Carregando...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader title="Plantas" subtitle={`${filtered.length} espécies encontradas`} />

      <div className="mb-6">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nome popular, científico ou família..."
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {visible.map(plant => (
          <Card
            key={plant.id}
            to={`/plantas/${plant.id}`}
            image={plant.imagem}
            title={plant.nomePopular}
            subtitle={plant.nomeCientifico}
            inatPhotos={plant.enrichment?.inatPhotoUrls}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary py-12">Nenhuma planta encontrada.</p>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Carregar mais
          </button>
        </div>
      )}
    </div>
  )
}
