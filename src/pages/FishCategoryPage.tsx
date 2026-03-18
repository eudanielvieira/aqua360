import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { loadFishByType, fishCategories } from '../data/fish-index'
import type { Fish } from '../types'
import { useSearch } from '../hooks/useSearch'
import PageHeader from '../components/PageHeader'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import QuickFilters, { fishFilters, invertFreshFilters, invertSaltFilters } from '../components/QuickFilters'

const PAGE_SIZE = 30

export default function FishCategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [allFish, setAllFish] = useState<Fish[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [quickFilter, setQuickFilter] = useState<((item: any) => boolean) | null>(null)

  const category = fishCategories.find(c => c.slug === slug)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    loadFishByType(slug).then(data => {
      setAllFish(data.sort((a, b) => a.nomePopular.localeCompare(b.nomePopular)))
      setLoading(false)
      setVisibleCount(PAGE_SIZE)
    })
  }, [slug])

  const { query, setQuery, filtered: searchFiltered } = useSearch(allFish, ['nomePopular', 'nomeCientifico', 'familia'])
  const filtered = quickFilter ? searchFiltered.filter(quickFilter) : searchFiltered
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
      <PageHeader
        title={category?.label || 'Peixes'}
        subtitle={`${filtered.length} espécies encontradas`}
        backTo="/peixes"
      />

      <div className="mb-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nome popular, científico ou família..."
        />
      </div>

      <QuickFilters
        filters={slug?.includes('invertebrados-agua-salgada') ? invertSaltFilters : slug?.includes('invertebrados') ? invertFreshFilters : fishFilters}
        onFilter={fn => { setQuickFilter(() => fn); setVisibleCount(PAGE_SIZE) }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {visible.map(fish => (
          <Card
            key={fish.id}
            to={`/peixes/${slug}/${fish.id}`}
            image={fish.imagem}
            title={fish.nomePopular}
            subtitle={fish.nomeCientifico}
            inatPhotos={fish.enrichment?.inatPhotoUrls}
            wikiPhoto={fish.enrichment?.wikiPhotoUrl}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary py-12">Nenhum peixe encontrado.</p>
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
