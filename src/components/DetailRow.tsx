interface Props {
  label: string
  value: string | undefined
}

export default function DetailRow({ label, value }: Props) {
  if (!value || value.trim() === '') return null

  return (
    <div className="py-4 border-b border-border/60 last:border-0">
      <dt className="text-xs font-bold text-primary/80 uppercase tracking-wider mb-1.5">{label}</dt>
      <dd className="text-sm text-text leading-relaxed whitespace-pre-line">{value}</dd>
    </div>
  )
}
