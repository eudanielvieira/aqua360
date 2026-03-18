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
  ChevronRight,
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
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Fish size={24} />
            Aqua360
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    active ? 'bg-white/20 font-medium' : 'hover:bg-white/10'
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
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-200 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
          <span className="font-bold text-primary flex items-center gap-2">
            <Fish size={20} />
            Aqua360
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="py-2">
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-primary/5 text-primary font-medium border-r-2 border-primary'
                    : 'text-text-secondary hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
                <ChevronRight size={14} className="ml-auto opacity-40" />
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-primary-dark text-white/70 text-center py-4 text-xs">
        Aqua360 - O seu guia de aquarismo
      </footer>
    </div>
  )
}
