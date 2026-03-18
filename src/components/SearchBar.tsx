import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }: Props) {
  return (
    <div className="relative group">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-11 py-3 rounded-2xl border border-border bg-card text-sm shadow-sm shadow-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-secondary/60"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-text-secondary hover:text-text hover:bg-surface-alt transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
