import type { Taxonomia } from '../types'

interface Props {
  taxonomia: Taxonomia
}

const labels: { key: keyof Taxonomia; label: string; color: string }[] = [
  { key: 'reino', label: 'Reino', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'filo', label: 'Filo', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'classe', label: 'Classe', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { key: 'ordem', label: 'Ordem', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { key: 'familia', label: 'Família', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'genero', label: 'Gênero', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { key: 'especie', label: 'Espécie', color: 'bg-primary/10 text-primary border-primary/20' },
]

export default function TaxonomyTree({ taxonomia }: Props) {
  const items = labels.filter(l => taxonomia[l.key])

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${item.color}`}
        >
          <span className="opacity-60 font-normal">{item.label}</span>
          <span className={item.key === 'especie' || item.key === 'genero' ? 'italic font-semibold' : 'font-semibold'}>
            {taxonomia[item.key]}
          </span>
        </span>
      ))}
    </div>
  )
}
