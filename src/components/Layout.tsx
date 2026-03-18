import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Fish,
  Leaf,
  HeartPulse,
  Calculator,
  Menu,
  X,
  Home,
  Waves,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/peixes', label: 'Peixes', icon: Fish },
  { path: '/plantas', label: 'Plantas', icon: Leaf },
  { path: '/doencas', label: 'Doenças e Tratamentos', icon: HeartPulse },
  { path: '/calculadoras', label: 'Calculadoras', icon: Calculator },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white sticky top-0 z-40 shadow-lg shadow-primary/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Waves size={18} />
            </div>
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text">Aqua360</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            {navItems.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                    active
                      ? 'bg-white/20 font-semibold shadow-sm shadow-white/10 backdrop-blur-sm'
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 bg-gradient-to-r from-primary-dark to-primary">
          <span className="font-bold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Waves size={18} />
            </div>
            Aqua360
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors"
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 mb-1 ${
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
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-primary-dark text-white/60 text-center py-6 text-xs">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Waves size={14} />
          <span className="font-semibold text-white/80">Aqua360</span>
        </div>
        O seu guia completo de aquarismo
      </footer>
    </div>
  )
}
