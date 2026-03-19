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
  Globe,
} from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useTranslation } from 'react-i18next'

const mainNav = [
  { path: '/peixes', label: 'nav.fish', icon: Fish },
  { path: '/plantas', label: 'nav.plants', icon: Leaf },
  { path: '/corais', label: 'nav.corals', icon: Gem },
  { path: '/doencas', label: 'nav.diseases', icon: HeartPulse },
]

const toolsNav = [
  { path: '/calculadoras', label: 'nav.calculators', icon: Calculator },
  { path: '/compatibilidade', label: 'nav.compatibility', icon: ArrowLeftRight },
  { path: '/montar-aquario', label: 'nav.builder', icon: Sparkles },
]

const learnNav = [
  { path: '/guias', label: 'nav.guides', icon: GraduationCap },
  { path: '/glossario', label: 'nav.glossary', icon: BookOpen },
  { path: '/busca', label: 'nav.search', icon: Search },
]

const languages = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'ja', label: 'JA' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const location = useLocation()
  const { dark, toggle } = useDarkMode()
  const { t, i18n } = useTranslation('common')

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  const navLink = (item: { path: string; label: string; icon: typeof Fish }, compact = false) => {
    const Icon = item.icon
    const active = isActive(item.path)
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-2 ${compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-3 text-sm'} rounded-lg transition-all duration-200 ${
          active
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-text-secondary hover:bg-surface-alt hover:text-text'
        }`}
      >
        <Icon size={compact ? 15 : 18} />
        {t(item.label)}
      </Link>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="bg-card sticky top-0 z-40 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-text tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Waves size={16} className="text-primary" />
            </div>
            Aqua360
          </Link>
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {mainNav.map(item => navLink(item, true))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="p-2 rounded-xl text-text-secondary hover:bg-surface-alt hover:text-text transition-colors flex items-center gap-1"
              >
                <Globe size={16} />
                <span className="text-xs font-bold">{i18n.language.substring(0, 2).toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1 z-50 min-w-[80px]">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }}
                      className={`w-full px-3 py-2 text-xs font-medium text-left hover:bg-surface-alt transition-colors ${
                        i18n.language === lang.code ? 'text-primary font-bold' : 'text-text-secondary'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-text-secondary hover:bg-surface-alt hover:text-text transition-colors"
              aria-label={dark ? t('lightMode') : t('darkMode')}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-text-secondary hover:bg-surface-alt hover:text-text transition-colors"
              aria-label="Menu"
            >
              <Menu size={20} />
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
        className={`fixed top-0 left-0 h-full w-80 bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border">
          <Link to="/" onClick={() => setSidebarOpen(false)} className="font-bold text-text flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Waves size={16} className="text-primary" />
            </div>
            Aqua360
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl text-text-secondary hover:bg-surface-alt hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="py-3 px-3">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-1 transition-all ${
              location.pathname === '/' ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-alt hover:text-text'
            }`}
          >
            <Home size={18} />
            {t('nav.home')}
          </Link>

          <p className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-wider px-4 mt-4 mb-2">{t('nav.catalog')}</p>
          {mainNav.map(item => navLink(item))}

          <p className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-wider px-4 mt-4 mb-2">{t('nav.tools')}</p>
          {toolsNav.map(item => navLink(item))}

          <p className="text-[10px] font-bold text-text-secondary/50 uppercase tracking-wider px-4 mt-4 mb-2">{t('nav.learn')}</p>
          {learnNav.map(item => navLink(item))}

          <div className="border-t border-border mt-4 pt-3">
            <Link
              to="/sobre"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-all ${
                location.pathname === '/sobre' ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-surface-alt hover:text-text'
              }`}
            >
              <Waves size={18} />
              {t('footer.about')}
            </Link>
            <Link
              to="/apoie"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-all ${
                location.pathname === '/apoie' ? 'bg-rose-500/10 text-rose-500 font-semibold' : 'text-rose-500/70 hover:bg-rose-500/5 hover:text-rose-500'
              }`}
            >
              <Heart size={18} />
              {t('footer.support')}
            </Link>
            <button
              onClick={toggle}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-text-secondary hover:bg-surface-alt hover:text-text transition-all w-full"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              {dark ? t('lightMode') : t('darkMode')}
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 px-4 text-xs">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-2">
              <Waves size={12} className="text-primary" />
              <span className="font-semibold text-text">Aqua360</span>
            </div>
            <p className="text-text-secondary">{t('footer.tagline')}</p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="flex items-center gap-2">
              <Link to="/sobre" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors">
                <Waves size={12} />
                {t('footer.about')}
              </Link>
              <Link to="/apoie" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 dark:bg-rose-400/15 dark:text-rose-400 font-semibold hover:bg-rose-500/20 transition-colors">
                <Heart size={12} fill="currentColor" />
                {t('footer.support')}
              </Link>
            </div>
            <p className="text-text-secondary/50 text-[10px]">
              {t('footer.data')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
