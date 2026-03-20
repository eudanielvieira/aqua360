import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Plant } from '../types'
import FallbackImage from '../components/FallbackImage'
import PageHeader from '../components/PageHeader'
import DetailRow from '../components/DetailRow'
import ParamCard from '../components/ParamCard'
import TaxonomyTree from '../components/TaxonomyTree'
import CommunityPhotos from '../components/CommunityPhotos'
import ExternalLinks from '../components/ExternalLinks'
import SimilarSpecies from '../components/SimilarSpecies'
import { useTranslatedSpecies } from '../hooks/useTranslatedSpecies'
import FavoriteButton from '../components/FavoriteButton'

const DistributionMap = lazy(() => import('../components/DistributionMap'))

export default function PlantDetailPage() {
  const { t } = useTranslation(['plants', 'common'])
  const { id } = useParams<{ id: string }>()
  const [plant, setPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSimilar = useCallback(() => import('../data/plants').then(m => m.default), [])

  useEffect(() => {
    import('../data/plants').then(mod => {
      setPlant(mod.default.find(p => p.id === Number(id)) || null)
      setLoading(false)
    })
  }, [id])

  const translated = useTranslatedSpecies(plant, 'plant')

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          {t('common:loading')}
        </div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title={t('plants:notFound')} backTo="/plantas" />
      </div>
    )
  }
  const enrichment = plant.enrichment
  const hasParams = plant.ph || plant.temperatura || plant.iluminacao || plant.co2 || plant.dificuldade || plant.crescimento

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between">
        <PageHeader title={translated?.nomePopular || plant.nomePopular} backTo="/plantas" />
        <FavoriteButton id={plant.id} type="plant" />
      </div>

      <div className="bg-card rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
        <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden bg-surface-alt relative">
          <FallbackImage
            localImage={plant.imagem}
            inatPhotos={enrichment?.inatPhotoUrls}
            wikiPhoto={enrichment?.wikiPhotoUrl}
            alt={plant.nomePopular}
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-white/80 text-sm italic drop-shadow-lg">{plant.nomeCientifico}</p>
          </div>
        </div>

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
                <ParamCard icon="Droplets" label="pH" value={plant.ph} />
                <ParamCard icon="Thermometer" label={t('common:param.temperature')} value={plant.temperatura} />
                <ParamCard icon="Sun" label={t('common:param.lighting')} value={plant.iluminacao} />
                <ParamCard icon="Wind" label={t('common:param.co2')} value={translated?.co2 || plant.co2} />
                <ParamCard icon="Signal" label={t('common:param.difficulty')} value={translated?.dificuldade || plant.dificuldade} />
                <ParamCard icon="TrendingUp" label={t('common:param.growth')} value={translated?.crescimento || plant.crescimento} />
              </div>
            </div>
          )}

          <dl>
            <DetailRow label={t('common:detail.label.popularName')} value={translated?.nomePopular || plant.nomePopular} />
            <DetailRow label={t('common:detail.label.scientificName')} value={plant.nomeCientifico} />
            <DetailRow label={t('common:detail.label.otherNames')} value={translated?.outrosNome || plant.outrosNome} />
            <DetailRow label={t('common:detail.label.family')} value={plant.familia} />
            <DetailRow label={t('plants:detail.structure')} value={translated?.estrutura || plant.estrutura} />
            <DetailRow label={t('common:detail.label.origin')} value={translated?.origem || plant.origem} />
            <DetailRow label={t('plants:detail.planting')} value={translated?.plantio || plant.plantio} />
            <DetailRow label={t('plants:detail.size')} value={plant.tamanho} />
            <DetailRow label={t('plants:detail.stature')} value={translated?.porte || plant.porte} />
            <DetailRow label={t('plants:detail.position')} value={translated?.posicao || plant.posicao} />
            <DetailRow label={t('plants:detail.reproduction')} value={translated?.reproducao || plant.reproducao} />
            <DetailRow label={t('plants:detail.fertileSubstrate')} value={translated?.substratoFertil || plant.substratoFertil} />
            <DetailRow label={t('plants:detail.supportsEmersion')} value={translated?.suportaEmersao || plant.suportaEmersao} />
            <DetailRow label={t('common:detail.label.source')} value={plant.fonte} />
          </dl>

          {enrichment?.inatPhotoUrls && enrichment.inatPhotoUrls.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.communityPhotos')}</h3>
              <CommunityPhotos photos={enrichment.inatPhotoUrls} />
            </div>
          )}

          {enrichment?.gbifTaxonKey && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.distribution')}</h3>
              <Suspense fallback={<div className="w-full h-64 rounded-2xl bg-surface-alt animate-pulse" />}>
                <DistributionMap taxonKey={enrichment.gbifTaxonKey} speciesName={plant.nomePopular} />
              </Suspense>
            </div>
          )}

          {enrichment && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.learnMore')}</h3>
              <ExternalLinks enrichment={enrichment} nomeCientifico={plant.nomeCientifico} />
            </div>
          )}
        </div>
      </div>

      {plant.familia && (
        <div className="mt-6 bg-card rounded-3xl shadow-lg shadow-black/5 overflow-hidden p-6 sm:p-8">
          <SimilarSpecies
            currentId={plant.id}
            familia={plant.familia}
            loadAll={loadSimilar}
            basePath="/plantas"
          />
        </div>
      )}
    </div>
  )
}
