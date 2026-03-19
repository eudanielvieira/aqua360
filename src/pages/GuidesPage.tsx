import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Fish, Leaf, Gem, ArrowRight, Clock, Droplets, Thermometer, Filter, FlaskConical, CheckCircle } from 'lucide-react'

export default function GuidesPage() {
  const { t } = useTranslation('guides')
  const [activeType, setActiveType] = useState<string | null>(null)

  const aquariumTypes = [
    {
      id: 'comunitario',
      title: t('type.community.title'),
      desc: t('type.community.desc'),
      icon: Fish,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      params: { ph: '6.5 a 7.5', temp: '24 a 28', gh: '4 a 12' },
      steps: t('type.community.steps', { returnObjects: true }) as string[],
      fishSuggestions: t('type.community.fish'),
    },
    {
      id: 'plantado',
      title: t('type.planted.title'),
      desc: t('type.planted.desc'),
      icon: Leaf,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      params: { ph: '6.0 a 7.0', temp: '22 a 26', gh: '3 a 8' },
      steps: t('type.planted.steps', { returnObjects: true }) as string[],
      fishSuggestions: t('type.planted.fish'),
    },
    {
      id: 'ciclideos',
      title: t('type.cichlid.title'),
      desc: t('type.cichlid.desc'),
      icon: Fish,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      params: { ph: '7.5 a 8.5', temp: '24 a 28', gh: '10 a 20' },
      steps: t('type.cichlid.steps', { returnObjects: true }) as string[],
      fishSuggestions: t('type.cichlid.fish'),
    },
    {
      id: 'marinho',
      title: t('type.marine.title'),
      desc: t('type.marine.desc'),
      icon: Gem,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      params: { ph: '8.1 a 8.4', temp: '24 a 27', salinidade: '1.023 a 1.025' },
      steps: t('type.marine.steps', { returnObjects: true }) as string[],
      fishSuggestions: t('type.marine.fish'),
    },
  ]

  const cyclingStepIcons = [Filter, FlaskConical, Droplets, Thermometer, Clock, CheckCircle]
  const cyclingSteps = (t('cyclingSteps', { returnObjects: true }) as { day: string; title: string; desc: string }[]).map((step, i) => ({
    ...step,
    icon: cyclingStepIcons[i] || CheckCircle,
  }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <div className="mb-10">
        <h2 className="text-lg font-bold text-text mb-4">{t('aquariumTypes')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {aquariumTypes.map(type => {
            const Icon = type.icon
            const isActive = activeType === type.id
            return (
              <div key={type.id}>
                <button
                  onClick={() => setActiveType(isActive ? null : type.id)}
                  className={`w-full text-left p-5 bg-card rounded-2xl shadow-sm shadow-black/5 hover:shadow-md transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl ${type.bg} ${type.color} flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-text text-sm">{type.title}</p>
                      <p className="text-[11px] text-text-secondary">{type.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {Object.entries(type.params).map(([k, v]) => (
                      <span key={k} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-alt font-medium text-text-secondary">
                        {k.toUpperCase()} {v}
                      </span>
                    ))}
                  </div>
                </button>

                {isActive && (
                  <div className="mt-2 p-5 bg-card rounded-2xl shadow-sm shadow-black/5">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('stepByStep')}</p>
                    <div className="space-y-2">
                      {type.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-text leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-surface-alt/50">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">{t('suggestedFish')}</p>
                      <p className="text-xs text-text">{type.fishSuggestions}</p>
                    </div>
                    <Link
                      to="/montar-aquario"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mt-3 hover:underline"
                    >
                      {t('smartBuilder')} <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-text mb-4">{t('cyclingTitle')}</h2>
        <p className="text-sm text-text-secondary mb-6">
          {t('cyclingDesc')}
        </p>
        <div className="space-y-3">
          {cyclingSteps.map((step, i) => {
            const Icon = step.icon
            const isLast = i === cyclingSteps.length - 1
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLast ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                    <Icon size={18} />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
                </div>
                <div className="pb-6">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{step.day}</p>
                  <p className="text-sm font-bold text-text mt-0.5">{step.title}</p>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
