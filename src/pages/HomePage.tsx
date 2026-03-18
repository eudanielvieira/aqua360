import { Link } from 'react-router-dom'
import { Fish, Leaf, Gem, HeartPulse, Calculator, ArrowRight } from 'lucide-react'
import { fishCategories } from '../data/fish-index'

const totalFish = fishCategories.reduce((sum, c) => sum + c.count, 0)

const sections = [
  {
    path: '/peixes',
    label: 'Peixes',
    desc: `${totalFish} espécies catalogadas`,
    icon: Fish,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    path: '/plantas',
    label: 'Plantas',
    desc: 'Espécies de plantas aquáticas',
    icon: Leaf,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    path: '/corais',
    label: 'Corais e Anêmonas',
    desc: '19 espécies para aquário marinho',
    icon: Gem,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    path: '/doencas',
    label: 'Doenças e Tratamentos',
    desc: 'Diagnóstico, sintomas e cuidados',
    icon: HeartPulse,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    path: '/calculadoras',
    label: 'Calculadoras',
    desc: '10 ferramentas para o seu aquário',
    icon: Calculator,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
]

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text tracking-tight">
          Aqua360
        </h1>
        <p className="text-text-secondary mt-3 text-lg">
          O seu guia completo de aquarismo.
        </p>
      </div>

      <div className="space-y-2">
        {sections.map(section => {
          const Icon = section.icon
          return (
            <Link
              key={section.path}
              to={section.path}
              className="group flex items-center gap-4 px-4 py-4 -mx-4 rounded-2xl hover:bg-card hover:shadow-sm transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl ${section.bg} ${section.color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-text">{section.label}</h2>
                <p className="text-sm text-text-secondary">{section.desc}</p>
              </div>
              <ArrowRight size={16} className="text-border group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
