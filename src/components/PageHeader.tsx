import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  subtitle?: string
  backTo?: string
}

export default function PageHeader({ title, subtitle, backTo }: Props) {
  const navigate = useNavigate()

  return (
    <div className="mb-8">
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Voltar
        </button>
      )}
      <h1 className="text-3xl font-extrabold text-text tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-text-secondary mt-2">{subtitle}</p>}
    </div>
  )
}
