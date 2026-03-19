import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { loadAllFish } from '../data/fish-index'
import type { Plant, Coral, Disease } from '../types'
import { getPrimaryImage } from '../utils/image'
import { fuzzySearch, type FuzzyItem } from '../utils/fuzzySearch'
import PageHeader from '../components/PageHeader'
import { Search, Fish, Leaf, Gem, HeartPulse } from 'lucide-react'

interface SearchItem {
  id: number
  nome: string
  nomeCientifico: string
  imagem: string
  inatPhotos?: string[]
  type: string
  typeLabel: string
  typeIcon: typeof Fish
  typeColor: string
  link: string
}

const fishTypes: Record<string, string> = {
  PEIXESDULCICOLAS: 'agua-doce',
  PEIXESMARINHOS: 'agua-salgada',
  PEIXESINVERTEBRADOSDULCIOLAS: 'invertebrados-agua-doce',
  PEIXESINVERTEBRADOSMARINHOS: 'invertebrados-agua-salgada',
}

export default function SearchPage() {
  const { t } = useTranslation(['search', 'common'])
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    Promise.all([
      loadAllFish(),
      import('../data/plants').then(m => m.default),
      import('../data/corals').then(m => m.default),
      import('../data/diseases').then(m => m.default),
    ]).then(([fish, plants, corals, diseases]) => {
      const all: SearchItem[] = []

      for (const f of fish) {
        const slug = fishTypes[f.tipo] || 'agua-doce'
        all.push({
          id: f.id, nome: f.nomePopular, nomeCientifico: f.nomeCientifico,
          imagem: f.imagem, inatPhotos: f.enrichment?.inatPhotoUrls,
          type: 'fish', typeLabel: 'search:type.fish', typeIcon: Fish, typeColor: 'text-blue-500 bg-blue-500/10',
          link: `/peixes/${slug}/${f.id}`,
        })
      }
      for (const p of plants as Plant[]) {
        all.push({
          id: p.id, nome: p.nomePopular, nomeCientifico: p.nomeCientifico,
          imagem: p.imagem, inatPhotos: p.enrichment?.inatPhotoUrls,
          type: 'plant', typeLabel: 'search:type.plant', typeIcon: Leaf, typeColor: 'text-emerald-500 bg-emerald-500/10',
          link: `/plantas/${p.id}`,
        })
      }
      for (const c of corals as Coral[]) {
        all.push({
          id: c.id, nome: c.nomePopular, nomeCientifico: c.nomeCientifico,
          imagem: '', inatPhotos: c.enrichment?.inatPhotoUrls,
          type: 'coral', typeLabel: 'search:type.coral', typeIcon: Gem, typeColor: 'text-violet-500 bg-violet-500/10',
          link: `/corais/${c.id}`,
        })
      }
      for (const d of diseases as Disease[]) {
        all.push({
          id: d.id, nome: d.nome, nomeCientifico: d.nomeCientifico,
          imagem: d.imagem, inatPhotos: undefined,
          type: 'disease', typeLabel: 'search:type.disease', typeIcon: HeartPulse, typeColor: 'text-rose-500 bg-rose-500/10',
          link: `/doencas/${d.id}`,
        })
      }

      setItems(all)
      setLoading(false)
    })
  }, [])

  const fuzzyItems = useMemo((): FuzzyItem[] => {
    return items.map(i => ({
      text: [i.nome, i.nomeCientifico],
      data: i,
    }))
  }, [items])

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [] as SearchItem[]
    return fuzzySearch(fuzzyItems, query, 30).map(r => r.data as SearchItem)
  }, [fuzzyItems, query])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">{t('common:loading')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title={t('search:title')} subtitle={t('search:subtitle')} />

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search:placeholder')}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-card text-sm shadow-sm shadow-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          autoFocus
        />
      </div>

      {query.length >= 2 && (
        <p className="text-xs text-text-secondary mb-4">{t('common:results', { count: results.length })}</p>
      )}

      <div className="space-y-2">
        {results.map(item => {
          const Icon = item.typeIcon
          return (
            <Link
              key={`${item.type}-${item.id}`}
              to={item.link}
              className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-sm shadow-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0">
                <img
                  src={getPrimaryImage(item.imagem, item.inatPhotos)}
                  alt={item.nome}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = '/images/avatar.jpg' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">{item.nome}</p>
                <p className="text-[10px] text-text-secondary italic truncate">{item.nomeCientifico}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${item.typeColor} flex-shrink-0`}>
                <Icon size={10} />
                {t(item.typeLabel)}
              </span>
            </Link>
          )
        })}
      </div>

      {query.length >= 2 && results.length === 0 && (
        <p className="text-center text-text-secondary py-12">{t('search:noResults')}</p>
      )}

      {query.length < 2 && (
        <p className="text-center text-text-secondary py-12 text-sm">
          {t('search:minChars')}
        </p>
      )}
    </div>
  )
}
