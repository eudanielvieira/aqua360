import { Waves, Shield, Eye, Heart, ArrowLeftRight, Fish, Leaf, Gem, Calculator, GraduationCap, Github } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'

export default function AboutPage() {
  const { t } = useTranslation('about')

  const features = [
    { icon: ArrowLeftRight, color: 'text-cyan-500', bg: 'bg-cyan-500/10', titleKey: 'feature.compatibility', descKey: 'feature.compatibility.desc' },
    { icon: Fish, color: 'text-blue-500', bg: 'bg-blue-500/10', titleKey: 'feature.catalog', descKey: 'feature.catalog.desc' },
    { icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-500/10', titleKey: 'feature.plants', descKey: 'feature.plants.desc' },
    { icon: Gem, color: 'text-violet-500', bg: 'bg-violet-500/10', titleKey: 'feature.corals', descKey: 'feature.corals.desc' },
    { icon: Calculator, color: 'text-amber-500', bg: 'bg-amber-500/10', titleKey: 'feature.calculators', descKey: 'feature.calculators.desc' },
    { icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-500/10', titleKey: 'feature.guides', descKey: 'feature.guides.desc' },
  ]

  const principles = [
    { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10', titleKey: 'principle.noAds', descKey: 'principle.noAds.desc' },
    { icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10', titleKey: 'principle.transparent', descKey: 'principle.transparent.desc' },
    { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10', titleKey: 'principle.community', descKey: 'principle.community.desc' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title={t('title')} />

      <div className="space-y-6">
        <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Waves size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">Aqua360</h2>
              <p className="text-xs text-text-secondary">{t('tagline')}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>{t('story.p1')}</p>
            <p>{t('story.p2')}</p>
            <p>{t('story.p3')}</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-6 sm:p-8">
          <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4">{t('featuresTitle')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map(f => {
              const Icon = f.icon
              return (
                <div key={f.titleKey} className="flex items-start gap-3 p-3 rounded-xl bg-surface-alt/50">
                  <div className={`w-9 h-9 rounded-lg ${f.bg} ${f.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">{t(f.titleKey)}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{t(f.descKey)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-6 sm:p-8">
          <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4">{t('principlesTitle')}</h3>
          <div className="grid gap-3">
            {principles.map(p => {
              const Icon = p.icon
              return (
                <div key={p.titleKey} className="flex items-start gap-3 p-4 rounded-xl bg-surface-alt/50">
                  <div className={`w-9 h-9 rounded-lg ${p.bg} ${p.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">{t(p.titleKey)}</p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{t(p.descKey)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm shadow-black/5 p-6 sm:p-8">
          <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4">{t('techTitle')}</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">{t('tech.desc')}</p>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'GBIF', 'WoRMS', 'iNaturalist'].map(tech => (
              <span key={tech} className="text-xs px-3 py-1.5 rounded-lg bg-surface-alt font-medium text-text-secondary">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/apoie"
            className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl bg-rose-500/10 text-rose-500 font-bold text-sm hover:bg-rose-500/20 transition-colors"
          >
            <Heart size={18} />
            {t('cta.support')}
          </Link>
          <a
            href="https://github.com/eudanielvieira/aqua360"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl bg-surface-alt text-text-secondary font-bold text-sm hover:bg-surface hover:text-text transition-colors"
          >
            <Github size={18} />
            {t('cta.github')}
          </a>
        </div>
      </div>
    </div>
  )
}
