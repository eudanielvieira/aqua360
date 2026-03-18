import { Link } from 'react-router-dom'
import { Fish, Leaf, HeartPulse, Calculator, ArrowRight, Waves } from 'lucide-react'
import { fishCategories } from '../data/fish-index'

const totalFish = fishCategories.reduce((sum, c) => sum + c.count, 0)

const sections = [
  {
    path: '/peixes',
    label: 'Peixes',
    desc: `${totalFish} espécies catalogadas`,
    icon: Fish,
    gradient: 'from-blue-500 to-cyan-400',
    bg: 'bg-blue-50',
  },
  {
    path: '/plantas',
    label: 'Plantas Aquáticas',
    desc: 'Espécies para seu aquário plantado',
    icon: Leaf,
    gradient: 'from-emerald-500 to-green-400',
    bg: 'bg-green-50',
  },
  {
    path: '/doencas',
    label: 'Doenças e Tratamentos',
    desc: 'Diagnóstico e cuidados',
    icon: HeartPulse,
    gradient: 'from-rose-500 to-pink-400',
    bg: 'bg-rose-50',
  },
  {
    path: '/calculadoras',
    label: 'Calculadoras',
    desc: '10 ferramentas úteis',
    icon: Calculator,
    gradient: 'from-amber-500 to-yellow-400',
    bg: 'bg-amber-50',
  },
]

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 sm:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent/30 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-6 shadow-lg shadow-white/5">
            <Waves size={40} className="text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Aqua360
          </h1>
          <p className="text-lg text-white/70 mt-3 max-w-md mx-auto">
            O seu guia completo de aquarismo com dados científicos atualizados
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10 pb-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map(section => {
            const Icon = section.icon
            return (
              <Link
                key={section.path}
                to={section.path}
                className="group relative bg-card rounded-2xl shadow-md shadow-black/5 border border-border overflow-hidden hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6 flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg shadow-black/10`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-text text-lg">{section.label}</h2>
                    <p className="text-sm text-text-secondary mt-1">{section.desc}</p>
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all duration-300">
                    Explorar
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
