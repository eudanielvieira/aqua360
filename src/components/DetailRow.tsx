interface Props {
  label: string
  value: string | undefined
}

export default function DetailRow({ label, value }: Props) {
  if (!value || value.trim() === '') return null

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-sm text-text leading-relaxed whitespace-pre-line">{value}</dd>
    </div>
  )
}
