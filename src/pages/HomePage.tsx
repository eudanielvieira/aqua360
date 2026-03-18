import { Link } from 'react-router-dom'
import { Fish, Leaf, HeartPulse, Calculator, ChevronRight } from 'lucide-react'
import { fishCategories } from '../data/fish-index'

const totalFish = fishCategories.reduce((sum, c) => sum + c.count, 0)

const sections = [
  {
    path: '/peixes',
    label: 'Peixes',
    desc: `${totalFish} espécies de peixes de água doce e salgada`,
    icon: Fish,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    path: '/plantas',
    label: 'Plantas',
    desc: 'Espécies de plantas aquáticas',
    icon: Leaf,
    color: 'bg-green-50 text-green-600',
  },
  {
    path: '/doencas',
    label: 'Doenças e Tratamentos',
    desc: 'Doenças com causas, sintomas e tratamentos',
    icon: HeartPulse,
    color: 'bg-red-50 text-red-600',
  },
  {
    path: '/calculadoras',
    label: 'Calculadoras',
    desc: '10 ferramentas úteis para o seu aquário',
    icon: Calculator,
    color: 'bg-amber-50 text-amber-600',
  },
]

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
          <Fish size={32} />
        </div>
        <h1 className="text-3xl font-bold text-text">Aqua360</h1>
        <p className="text-text-secondary mt-2">O seu guia completo de aquarismo</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(section => {
          const Icon = section.icon
          return (
            <Link
              key={section.path}
              to={section.path}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${section.color}`}>
                <Icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-text">{section.label}</h2>
                <p className="text-xs text-text-secondary mt-0.5">{section.desc}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
