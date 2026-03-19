import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Fish, Waves, Shell, Anchor } from 'lucide-react'
import { fishCategories } from '../data/fish-index'
import PageHeader from '../components/PageHeader'

const categoryConfig: Record<string, {
  icon: typeof Fish
  color: string
  bg: string
  hoverBorder: string
  descKey: string
}> = {
  'agua-doce': {
    icon: Fish,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    hoverBorder: 'hover:border-blue-200',
    descKey: 'category.freshwater.desc',
  },
  'agua-salgada': {
    icon: Waves,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    hoverBorder: 'hover:border-indigo-200',
    descKey: 'category.saltwater.desc',
  },
  'invertebrados-agua-doce': {
    icon: Shell,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    hoverBorder: 'hover:border-emerald-200',
    descKey: 'category.invertFresh.desc',
  },
  'invertebrados-agua-salgada': {
    icon: Anchor,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    hoverBorder: 'hover:border-violet-200',
    descKey: 'category.invertSalt.desc',
  },
}

export default function FishListPage() {
  const { t } = useTranslation(['fish', 'common'])
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title={t('fish:title')} subtitle={t('fish:subtitle')} />

      <div className="grid gap-3 sm:grid-cols-2">
        {fishCategories.map(cat => {
          const config = categoryConfig[cat.slug]
          if (!config) return null
          const Icon = config.icon

          return (
            <Link
              key={cat.slug}
              to={`/peixes/${cat.slug}`}
              className={`group flex items-center gap-4 p-5 bg-card rounded-2xl shadow-sm shadow-black/5 border border-transparent ${config.hoverBorder} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text">{cat.label}</h3>
                <p className="text-xs text-text-secondary mt-0.5">{t(`fish:${config.descKey}`)}</p>
                <p className="text-xs font-semibold text-primary mt-1.5">{cat.count} {t('common:speciesPlural')}</p>
              </div>
              <ArrowRight size={16} className="text-border group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
