import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Coral, CoralCategory } from '../types'
import { getPrimaryImage } from '../utils/image'
import PageHeader from '../components/PageHeader'
import DetailRow from '../components/DetailRow'
import ParamCard from '../components/ParamCard'
import TaxonomyTree from '../components/TaxonomyTree'
import CommunityPhotos from '../components/CommunityPhotos'
import ExternalLinks from '../components/ExternalLinks'
import { Gem, Shell, Hexagon, Circle } from 'lucide-react'
import FavoriteButton from '../components/FavoriteButton'

const DistributionMap = lazy(() => import('../components/DistributionMap'))

const categoryConfig: Record<CoralCategory, {
  labelKey: string
  icon: typeof Gem
  gradient: string
}> = {
  mole: { labelKey: 'corals:category.soft', icon: Circle, gradient: 'from-pink-500 to-rose-400' },
  'duro-lps': { labelKey: 'corals:category.lps', icon: Hexagon, gradient: 'from-orange-500 to-amber-400' },
  'duro-sps': { labelKey: 'corals:category.sps', icon: Gem, gradient: 'from-violet-500 to-purple-400' },
  anemona: { labelKey: 'corals:category.anemone', icon: Shell, gradient: 'from-cyan-500 to-teal-400' },
}

export default function CoralDetailPage() {
  const { t } = useTranslation(['corals', 'common'])
  const { id } = useParams<{ id: string }>()
  const [coral, setCoral] = useState<Coral | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../data/corals').then(mod => {
      setCoral(mod.default.find(c => c.id === Number(id)) || null)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">{t('common:loading')}</div>
      </div>
    )
  }

  if (!coral) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title={t('corals:notFound')} backTo="/corais" />
      </div>
    )
  }

  const enrichment = coral.enrichment
  const config = categoryConfig[coral.categoria]
  const Icon = config.icon
  const hasParams = coral.iluminacao || coral.fluxoAgua || coral.dificuldade || coral.crescimento

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between">
        <PageHeader title={coral.nomePopular} backTo="/corais" />
        <FavoriteButton id={coral.id} type="coral" />
      </div>

      <div className="bg-card rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
        {enrichment?.inatPhotoUrls?.[0] ? (
          <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden bg-surface-alt relative">
            <img
              src={getPrimaryImage('', enrichment.inatPhotoUrls, enrichment.wikiPhotoUrl)}
              alt={coral.nomePopular}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
              <p className="text-white/80 text-sm italic drop-shadow-lg">{coral.nomeCientifico}</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r ${config.gradient} text-white text-xs font-bold shadow-md`}>
                <Icon size={12} />
                {t(config.labelKey)}
              </span>
            </div>
          </div>
        ) : (
          <div className={`h-40 bg-gradient-to-br ${config.gradient} p-6 flex items-center gap-4 relative overflow-hidden`}>
            <div className="absolute -right-8 -top-8 opacity-10">
              <Icon size={120} strokeWidth={1} />
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon size={28} className="text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{t(config.labelKey)}</span>
              <h2 className="text-xl font-bold text-white">{coral.nomePopular}</h2>
              <p className="text-sm text-white/70 italic mt-0.5">{coral.nomeCientifico}</p>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {enrichment?.taxonomia && (
            <div className="mb-6 pb-6 border-b border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.taxonomy')}</h3>
              <TaxonomyTree taxonomia={enrichment.taxonomia} />
            </div>
          )}

          {hasParams && (
            <div className="mb-6 pb-6 border-b border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.parameters')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <ParamCard icon="Sun" label={t('common:param.lighting')} value={coral.iluminacao} />
                <ParamCard icon="Waves" label={t('common:param.waterFlow')} value={coral.fluxoAgua} />
                <ParamCard icon="Signal" label={t('common:param.difficulty')} value={coral.dificuldade} />
                <ParamCard icon="TrendingUp" label={t('common:param.growth')} value={coral.crescimento} />
                <ParamCard icon="Palette" label={t('common:param.coloring')} value={coral.coloracao} />
                <ParamCard icon="Users" label={t('common:param.compatibility')} value={coral.compatibilidade} />
              </div>
            </div>
          )}

          <dl>
            <DetailRow label={t('corals:detail.description')} value={coral.descricao} />
            <DetailRow label={t('common:detail.label.popularName')} value={coral.nomePopular} />
            <DetailRow label={t('common:detail.label.scientificName')} value={coral.nomeCientifico} />
            <DetailRow label={t('common:detail.label.otherNames')} value={coral.outrosNome} />
            <DetailRow label={t('common:detail.label.family')} value={coral.familia} />
            <DetailRow label={t('common:detail.label.origin')} value={coral.origem} />
            <DetailRow label={t('corals:detail.feeding')} value={coral.alimentacao} />
          </dl>

          {enrichment?.inatPhotoUrls && enrichment.inatPhotoUrls.length > 1 && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.communityPhotos')}</h3>
              <CommunityPhotos photos={enrichment.inatPhotoUrls.slice(1)} />
            </div>
          )}

          {enrichment?.gbifTaxonKey && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.distribution')}</h3>
              <Suspense fallback={<div className="w-full h-64 rounded-2xl bg-surface-alt animate-pulse" />}>
                <DistributionMap taxonKey={enrichment.gbifTaxonKey} speciesName={coral.nomePopular} />
              </Suspense>
            </div>
          )}

          {enrichment && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.learnMore')}</h3>
              <ExternalLinks enrichment={enrichment} nomeCientifico={coral.nomeCientifico} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
