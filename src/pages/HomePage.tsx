import { Link } from 'react-router-dom'
import { Fish, Leaf, Gem, HeartPulse, Calculator, ArrowRight, Waves } from 'lucide-react'
import { fishCategories } from '../data/fish-index'

const totalFish = fishCategories.reduce((sum, c) => sum + c.count, 0)

const sections = [
  {
    path: '/peixes',
    label: 'Peixes',
    desc: `${totalFish} espécies de água doce e salgada`,
    icon: Fish,
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    path: '/plantas',
    label: 'Plantas Aquáticas',
    desc: 'Espécies para o seu aquário plantado',
    icon: Leaf,
    gradient: 'from-emerald-500 to-green-400',
  },
  {
    path: '/corais',
    label: 'Corais e Anemonas',
    desc: '19 especies para aquario marinho',
    icon: Gem,
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    path: '/doencas',
    label: 'Doencas e Tratamentos',
    desc: 'Diagnóstico, sintomas e cuidados',
    icon: HeartPulse,
    gradient: 'from-rose-500 to-pink-400',
  },
  {
    path: '/calculadoras',
    label: 'Calculadoras',
    desc: '10 ferramentas úteis para o seu aquário',
    icon: Calculator,
    gradient: 'from-amber-500 to-yellow-400',
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
                className="group relative bg-card rounded-2xl shadow-md shadow-black/5 overflow-hidden hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-40 bg-gradient-to-br ${section.gradient} p-6 flex flex-col justify-between relative overflow-hidden`}>
                  <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
                    <Icon size={120} strokeWidth={1} />
                  </div>
                  <div className="absolute -right-3 -bottom-3 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    <Icon size={70} strokeWidth={1.5} />
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon size={22} className="text-white" />
                  </div>

                  <div>
                    <h2 className="font-bold text-white text-xl">{section.label}</h2>
                    <p className="text-sm text-white/70 mt-0.5">{section.desc}</p>
                  </div>
                </div>

                <div className="px-6 py-4 flex items-center justify-end">
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
    </div>
  )
}
