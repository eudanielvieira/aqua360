import { Link } from 'react-router-dom'
import { Fish, Leaf, Gem, HeartPulse, Calculator, ArrowLeftRight, Sparkles, Search, BookOpen, GraduationCap, ArrowRight, Waves, Sun, Moon, Download, Smartphone, X, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fishCategories } from '../data/fish-index'
import { useDarkMode } from '../hooks/useDarkMode'
import { useInstallPWA } from '../hooks/useInstallPWA'
import { useState } from 'react'

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
  {
    path: '/compatibilidade',
    label: 'Compatibilidade',
    desc: 'Duas espécies podem conviver juntas?',
    icon: ArrowLeftRight,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    hoverBorder: 'hover:border-cyan-200 dark:hover:border-cyan-500/30',
  },
  {
    path: '/montar-aquario',
    label: 'Montador de Aquario',
    desc: 'Sugestoes inteligentes baseadas no peixe principal',
    icon: Sparkles,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    hoverBorder: 'hover:border-purple-200 dark:hover:border-purple-500/30',
  },
  {
    path: '/guias',
    label: 'Guias de Montagem',
    desc: 'Passo a passo e guia de ciclagem',
    icon: GraduationCap,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    hoverBorder: 'hover:border-indigo-200 dark:hover:border-indigo-500/30',
  },
  {
    path: '/glossario',
    label: 'Glossario',
    desc: '40 termos essenciais de aquarismo',
    icon: BookOpen,
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    hoverBorder: 'hover:border-slate-200 dark:hover:border-slate-500/30',
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
  const { canInstall, justInstalled, install } = useInstallPWA()
  const [dismissed, setDismissed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const showBanner = canInstall && !dismissed

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {showBanner && (
        <div className="bg-primary">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Smartphone size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Baixe o app Aqua360</p>
              <p className="text-xs text-white/70 mt-0.5">Grátis -- acesse offline direto do seu celular</p>
            </div>
            <button
              onClick={install}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl text-sm font-bold hover:bg-white/90 transition-colors flex-shrink-0"
            >
              <Download size={16} />
              Instalar
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {justInstalled && !dismissed && (
        <div className="bg-success/10 border-b border-success/20">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Smartphone size={16} className="text-success flex-shrink-0" />
            <p className="text-sm text-success font-medium flex-1">App instalado com sucesso</p>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded text-success/50 hover:text-success transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pt-4 sm:pt-16 pb-16 flex-1">
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

        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`) }}
            placeholder="Buscar peixes, plantas, corais, doencas..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-card text-sm shadow-sm shadow-black/5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-secondary/60"
          />
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

        {canInstall && dismissed && (
          <button
            onClick={install}
            className="w-full mt-8 flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <Download size={16} />
            Instalar o app Aqua360
          </button>
        )}

      </div>

      <footer className="border-t border-border py-6 px-4 text-xs">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-2">
              <Waves size={12} className="text-primary" />
              <span className="font-semibold text-text">Aqua360</span>
            </div>
            <p className="text-text-secondary">O seu guia completo de aquarismo</p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <Link to="/apoie" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 font-semibold hover:bg-rose-500/20 transition-colors">
              <Heart size={12} fill="currentColor" />
              Apoie o projeto
            </Link>
            <p className="text-text-secondary/50 text-[10px]">
              Dados enriquecidos via GBIF, WoRMS e iNaturalist
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
