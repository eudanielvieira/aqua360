import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Fish,
  Leaf,
  Gem,
  HeartPulse,
  Calculator,
  ArrowLeftRight,
  Sparkles,
  Search,
  BookOpen,
  GraduationCap,
  Heart,
  Menu,
  X,
  Home,
  Waves,
  Sun,
  Moon,
} from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/peixes', label: 'Peixes', icon: Fish },
  { path: '/plantas', label: 'Plantas', icon: Leaf },
  { path: '/corais', label: 'Corais', icon: Gem },
  { path: '/doencas', label: 'Doenças', icon: HeartPulse },
  { path: '/calculadoras', label: 'Calculadoras', icon: Calculator },
  { path: '/compatibilidade', label: 'Compatibilidade', icon: ArrowLeftRight },
  { path: '/montar-aquario', label: 'Montador', icon: Sparkles },
  { path: '/guias', label: 'Guias', icon: GraduationCap },
  { path: '/glossario', label: 'Glossario', icon: BookOpen },
  { path: '/busca', label: 'Busca', icon: Search },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { dark, toggle } = useDarkMode()

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="bg-card sticky top-0 z-40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:bg-surface-alt hover:text-text transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2.5 font-bold text-text tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Waves size={16} className="text-primary" />
            </div>
            Aqua360
          </Link>
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navItems.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    active
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-alt hover:text-text'
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto">
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-text-secondary hover:bg-surface-alt hover:text-text transition-colors"
              aria-label={dark ? 'Modo claro' : 'Modo escuro'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border">
          <span className="font-bold text-text flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Waves size={16} className="text-primary" />
            </div>
            Aqua360
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl text-text-secondary hover:bg-surface-alt hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="py-3 px-3">
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 mb-0.5 ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-text'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:bg-surface-alt hover:text-text transition-all duration-200 w-full mt-2"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
