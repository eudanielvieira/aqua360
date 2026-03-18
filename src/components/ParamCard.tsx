import * as icons from 'lucide-react'

interface Props {
  icon: string
  label: string
  value: string | undefined
}

export default function ParamCard({ icon, label, value }: Props) {
  if (!value || value.trim() === '') return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (icons as any)[icon] || icons.Info

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-alt/80">
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-text truncate">{value}</p>
      </div>
    </div>
  )
}
