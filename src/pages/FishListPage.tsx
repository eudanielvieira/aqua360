import { Link } from 'react-router-dom'
import { ArrowRight, Fish, Waves, Shell, Anchor } from 'lucide-react'
import { fishCategories } from '../data/fish-index'
import PageHeader from '../components/PageHeader'

const categoryConfig: Record<string, {
  icon: typeof Fish
  gradient: string
  iconBg: string
  desc: string
}> = {
  'agua-doce': {
    icon: Fish,
    gradient: 'from-sky-500 to-cyan-400',
    iconBg: 'bg-white/20',
    desc: 'Peixes tropicais, ciclídeos, tetras, bettas e mais',
  },
  'agua-salgada': {
    icon: Waves,
    gradient: 'from-blue-600 to-indigo-500',
    iconBg: 'bg-white/20',
    desc: 'Peixes-palhaço, tangs, wrasses, gobies e mais',
  },
  'invertebrados-agua-doce': {
    icon: Shell,
    gradient: 'from-emerald-500 to-teal-400',
    iconBg: 'bg-white/20',
    desc: 'Camarões, caranguejos, caracóis e mexilhões',
  },
  'invertebrados-agua-salgada': {
    icon: Anchor,
    gradient: 'from-violet-500 to-purple-400',
    iconBg: 'bg-white/20',
    desc: 'Camarões ornamentais e invertebrados marinhos',
  },
}

export default function FishListPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Peixes" subtitle="Selecione uma categoria para explorar" />

      <div className="grid gap-4 sm:grid-cols-2">
        {fishCategories.map(cat => {
          const config = categoryConfig[cat.slug]
          if (!config) return null
          const Icon = config.icon

          return (
            <Link
              key={cat.slug}
              to={`/peixes/${cat.slug}`}
              className="group relative bg-card rounded-2xl shadow-md shadow-black/5 border border-border overflow-hidden hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`h-44 bg-gradient-to-br ${config.gradient} p-6 flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
                  <Icon size={140} strokeWidth={1} />
                </div>
                <div className="absolute -right-3 -bottom-3 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <Icon size={80} strokeWidth={1.5} />
                </div>

                <div className={`w-12 h-12 rounded-xl ${config.iconBg} backdrop-blur-sm flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>

                <div>
                  <h3 className="font-bold text-white text-xl">{cat.label}</h3>
                  <p className="text-sm text-white/70 mt-1 line-clamp-1">{config.desc}</p>
                </div>
              </div>

              <div className="px-6 py-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-text">{cat.count} espécies</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2.5 transition-all duration-300">
                  Explorar
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
