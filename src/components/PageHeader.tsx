import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface Props {
  /**
   * Opcional porque a pagina de detalhe de peixe traz o nome dentro do
   * proprio card, junto do nome cientifico. Ali o PageHeader entra so
   * pelo "Voltar".
   */
  title?: string
  subtitle?: string
  backTo?: string
}

export default function PageHeader({ title, subtitle, backTo }: Props) {
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  return (
    <div className={title ? 'mb-8' : 'mb-4'}>
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          className={`inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors group ${title ? 'mb-4' : ''}`}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          {t('back')}
        </button>
      )}
      {title && <h1 className="text-3xl font-extrabold text-text tracking-tight">{title}</h1>}
      {subtitle && <p className="text-sm text-text-secondary mt-2">{subtitle}</p>}
    </div>
  )
}
