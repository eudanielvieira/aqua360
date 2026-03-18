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
    <div className="mb-6">
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      )}
      <h1 className="text-2xl font-bold text-text">{title}</h1>
      {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
    </div>
  )
}
