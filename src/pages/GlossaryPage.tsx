import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import { Search } from 'lucide-react'

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function GlossaryPage() {
  const { t } = useTranslation('glossary')
  const [query, setQuery] = useState('')

  const terms = t('terms', { returnObjects: true }) as { term: string; def: string }[]

  const filtered = query.trim().length > 0
    ? terms.filter(item => normalize(item.term).includes(normalize(query)) || normalize(item.def).includes(normalize(query)))
    : terms

  const grouped = filtered.reduce<Record<string, { term: string; def: string }[]>>((acc, item) => {
    const letter = item.term[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(item)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title={t('title')} subtitle={t('subtitle', { count: terms.length })} />

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border bg-card text-sm shadow-sm shadow-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([letter, items]) => (
          <div key={letter}>
            <div className="sticky top-14 z-10 bg-surface py-1">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">{letter}</span>
            </div>
            <div className="space-y-2 mt-2">
              {items.map(item => (
                <div key={item.term} className="p-4 bg-card rounded-xl shadow-sm shadow-black/5">
                  <p className="text-sm font-bold text-text">{item.term}</p>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{item.def}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary py-12">{t('noResults')}</p>
      )}
    </div>
  )
}
