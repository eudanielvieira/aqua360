interface Props {
  label: string
  value: string | undefined
  /**
   * Texto que entra no lugar do valor quando o campo esta vazio. Sem ele a
   * linha some, que e o comportamento antigo; com ele a linha fica e assume
   * a lacuna, para a ficha ter sempre as mesmas secoes na mesma ordem
   * independente do quanto aquela especie tem preenchido.
   */
  fallback?: string
}

export default function DetailRow({ label, value, fallback }: Props) {
  const vazio = !value || value.trim() === ''
  if (vazio && !fallback) return null

  return (
    <div className="py-4 border-b border-border/60 last:border-0">
      <dt className="text-xs font-bold text-primary/80 uppercase tracking-wider mb-1.5">{label}</dt>
      <dd
        className={`text-sm leading-relaxed whitespace-pre-line ${
          vazio ? 'text-text-secondary italic' : 'text-text'
        }`}
      >
        {vazio ? fallback : value}
      </dd>
    </div>
  )
}
