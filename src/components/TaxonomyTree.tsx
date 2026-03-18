import type { Taxonomia } from '../types'
import { ChevronRight } from 'lucide-react'

interface Props {
  taxonomia: Taxonomia
}

const labels: { key: keyof Taxonomia; label: string }[] = [
  { key: 'reino', label: 'Reino' },
  { key: 'filo', label: 'Filo' },
  { key: 'classe', label: 'Classe' },
  { key: 'ordem', label: 'Ordem' },
  { key: 'familia', label: 'Família' },
  { key: 'genero', label: 'Gênero' },
  { key: 'especie', label: 'Espécie' },
]

export default function TaxonomyTree({ taxonomia }: Props) {
  const items = labels.filter(l => taxonomia[l.key])

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      {items.map((item, i) => (
        <span key={item.key} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-alt">
            <span className="text-text-secondary">{item.label}:</span>
            <span className={`font-medium text-text ${item.key === 'especie' || item.key === 'genero' ? 'italic' : ''}`}>
              {taxonomia[item.key]}
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}
