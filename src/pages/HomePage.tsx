import { Link } from 'react-router-dom'
import { Fish, Leaf, Gem, HeartPulse, Calculator, ArrowRight, Waves, Sun, Moon } from 'lucide-react'
import { fishCategories } from '../data/fish-index'
import { useDarkMode } from '../hooks/useDarkMode'

const totalFish = fishCategories.reduce((sum, c) => sum + c.count, 0)

const sections = [
  {
    path: '/peixes',
    label: 'Peixes',
    desc: `${totalFish} espécies de água doce e salgada`,
    icon: Fish,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-500/30',
  },
  {
    path: '/plantas',
    label: 'Plantas Aquáticas',
    desc: 'Espécies para o seu aquário plantado',
    icon: Leaf,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-500/30',
  },
  {
    path: '/corais',
    label: 'Corais e Anêmonas',
    desc: '19 espécies para aquário marinho',
    icon: Gem,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    hoverBorder: 'hover:border-violet-200 dark:hover:border-violet-500/30',
  },
  {
    path: '/doencas',
    label: 'Doenças e Tratamentos',
    desc: 'Diagnóstico, sintomas e cuidados',
    icon: HeartPulse,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    hoverBorder: 'hover:border-rose-200 dark:hover:border-rose-500/30',
  },
  {
    path: '/calculadoras',
    label: 'Calculadoras',
    desc: '10 ferramentas para o seu aquário',
    icon: Calculator,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-500/30',
  },
]

const stats = [
  { value: `${totalFish}+`, label: 'Peixes' },
  { value: '115', label: 'Plantas' },
  { value: '19', label: 'Corais' },
  { value: '20', label: 'Doenças' },
]

export default function HomePage() {
  const { dark, toggle } = useDarkMode()

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 pt-10 sm:pt-16 pb-16">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Waves size={22} className="text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
                Aqua360
              </h1>
            </div>
            <p className="text-text-secondary text-base">
              O seu guia completo de aquarismo com dados científicos atualizados.
            </p>
          </div>
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl bg-card shadow-sm shadow-black/5 text-text-secondary hover:text-text transition-colors mt-1"
            aria-label={dark ? 'Modo claro' : 'Modo escuro'}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-10">
          {stats.map(stat => (
            <div key={stat.label} className="text-center py-3 px-2 bg-card rounded-xl shadow-sm shadow-black/5">
              <p className="text-xl sm:text-2xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-[11px] text-text-secondary font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map(section => {
            const Icon = section.icon
            return (
              <Link
                key={section.path}
                to={section.path}
                className={`group flex items-center gap-4 p-5 bg-card rounded-2xl shadow-sm shadow-black/5 border border-transparent ${section.hoverBorder} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className={`w-12 h-12 rounded-xl ${section.bg} ${section.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-text">{section.label}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">{section.desc}</p>
                </div>
                <ArrowRight size={16} className="text-border group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            )
          })}
        </div>

        <p className="text-center text-[11px] text-text-secondary/50 mt-12">
          Dados enriquecidos via GBIF, WoRMS e iNaturalist
        </p>
      </div>
    </div>
  )
}
