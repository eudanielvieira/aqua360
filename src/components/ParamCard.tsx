import * as icons from 'lucide-react'

interface Props {
  icon: string
  label: string
  value: string | undefined
  /**
   * Deixa o valor ocupar ate duas linhas em vez de cortar na primeira.
   * Serve para coluna estreita, como a ficha da pagina de peixe, onde
   * "Fundo do Aquario" nao cabe em uma linha so.
   *
   * Duas linhas e nao ilimitado porque alguns registros trazem um
   * paragrafo inteiro no lugar do valor: o tamanho adulto da Arraia
   * Leopoldi e um texto de cinco linhas. O valor completo fica no title.
   */
  wrap?: boolean
}

export default function ParamCard({ icon, label, value, wrap = false }: Props) {
  if (!value || value.trim() === '') return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (icons as any)[icon] || icons.Info

  return (
    <div className={`flex gap-3 p-3.5 rounded-xl bg-surface-alt/80 ${wrap ? 'items-start' : 'items-center'}`}>
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{label}</p>
        <p
          className={`text-sm font-semibold text-text ${wrap ? 'line-clamp-2 leading-snug' : 'truncate'}`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
