import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loadFishByType } from '../data/fish-index'
import type { Fish } from '../types'
import FallbackImage from '../components/FallbackImage'
import { isNormalized } from '../utils/image'
import PageHeader from '../components/PageHeader'
import DetailRow from '../components/DetailRow'
import ParamCard from '../components/ParamCard'
import TaxonomyTree from '../components/TaxonomyTree'
import CommunityPhotos from '../components/CommunityPhotos'
import ExternalLinks from '../components/ExternalLinks'
import SimilarSpecies from '../components/SimilarSpecies'
import SpeciesBadges from '../components/SpeciesBadges'
import FavoriteButton from '../components/FavoriteButton'
import SEO from '../components/SEO'
import { useTranslatedSpecies } from '../hooks/useTranslatedSpecies'

const DistributionMap = lazy(() => import('../components/DistributionMap'))

/**
 * Linha curta da ficha (outros nomes, familia, origem).
 *
 * O DetailRow nao serve aqui: ele foi feito para os blocos de texto
 * longo la de baixo, com titulo em cima e separador, e ocuparia altura
 * demais na coluna ao lado da imagem.
 */
function FactRow({ label, value }: { label: string; value?: string }) {
  if (!value || value.trim() === '') return null

  return (
    <div className="flex gap-2 text-sm">
      <dt className="text-text-secondary shrink-0">{label}:</dt>
      <dd className="text-text font-medium min-w-0">{value}</dd>
    </div>
  )
}

export default function FishDetailPage() {
  const { t } = useTranslation(['fish', 'common'])
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const [fish, setFish] = useState<Fish | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug || !id) return
    loadFishByType(slug).then(data => {
      setFish(data.find(f => f.id === Number(id)) || null)
      setLoading(false)
    })
  }, [slug, id])

  const loadSimilar = useCallback(() => loadFishByType(slug!), [slug])

  const translated = useTranslatedSpecies(fish, 'fish')

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          {t('common:loading')}
        </div>
      </div>
    )
  }

  if (!fish || !translated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title={t('fish:notFound')} backTo={`/peixes/${slug}`} />
      </div>
    )
  }
  const f = translated
  const enrichment = fish.enrichment
  const hasParams = fish.ph || fish.gh || fish.kh || fish.temperatura || fish.tamanhoAdulto || f.posicaoAquario

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title={f.nomePopular} description={`${f.nomePopular} (${fish.nomeCientifico}) - pH ${fish.ph}, ${fish.temperatura}. ${f.comportamento?.slice(0, 100)}`} />
      <div className="flex items-start justify-between">
        <PageHeader title={f.nomePopular} backTo={`/peixes/${slug}`} />
        <FavoriteButton id={fish.id} type="fish" slug={slug} />
      </div>

      <div className="bg-card rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
        <div className="p-6 sm:p-8">
          {/*
            Ficha no formato de infobox: a imagem de um lado e a
            identificacao da especie do outro. Empilha no mobile, onde
            nao ha largura para duas colunas.
          */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-7 mb-6 pb-6 border-b border-border/60">
            {/*
              A arte propria e quadrada e foi montada com o peixe inteiro
              dentro do quadro, entao o quadro acompanha a proporcao dela
              em vez de cortar. As fotos do Wikipedia e do iNaturalist sao
              paisagem e ficam numa moldura mais baixa.
            */}
            <div
              className={`shrink-0 overflow-hidden rounded-2xl bg-surface-alt w-full sm:w-[22rem] sm:mx-auto md:mx-0 md:w-64 ${
                isNormalized(fish.imagem) ? 'aspect-square' : 'h-56 sm:h-64 md:h-48'
              }`}
            >
              <FallbackImage
                localImage={fish.imagem}
                inatPhotos={enrichment?.inatPhotoUrls}
                wikiPhoto={enrichment?.wikiPhotoUrl}
                alt={f.nomePopular}
                className="w-full h-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-lg italic text-text-secondary leading-snug">{fish.nomeCientifico}</p>

              <dl className="mt-3 space-y-2">
                <FactRow label={t('common:detail.label.otherNames')} value={f.outrosNome} />
                <FactRow label={t('common:detail.label.family')} value={fish.familia} />
                <FactRow label={t('common:detail.label.origin')} value={f.origem} />
              </dl>

              <div className="mt-4">
                <SpeciesBadges
                  comportamento={f.comportamento}
                  alimentacao={f.alimentacao}
                  tipo={fish.tipo}
                  outrasInformacoes={f.outrasInformacoes}
                  caracteristica={f.caracteristica}
                />
              </div>

              {hasParams && (
                <div className="mt-5">
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.parameters')}</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <ParamCard icon="Droplets" label="pH" value={fish.ph} wrap />
                    <ParamCard icon="Gauge" label="GH" value={fish.gh} wrap />
                    <ParamCard icon="Gauge" label="KH" value={fish.kh} wrap />
                    <ParamCard icon="Thermometer" label={t('common:param.temperature')} value={fish.temperatura} wrap />
                    <ParamCard icon="Ruler" label={t('common:param.adultSize')} value={fish.tamanhoAdulto} wrap />
                    <ParamCard icon="Layers" label={t('common:param.position')} value={f.posicaoAquario} wrap />
                  </div>
                </div>
              )}
            </div>
          </div>

          {enrichment?.taxonomia && (
            <div className="mb-6 pb-6 border-b border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.taxonomy')}</h3>
              <TaxonomyTree taxonomia={enrichment.taxonomia} />
            </div>
          )}

          {/* Nome, familia e origem sobem para a ficha, entao aqui ficam so os textos longos. */}
          <dl>
            <DetailRow label={t('fish:detail.characteristics')} value={f.caracteristica} />
            <DetailRow label={t('fish:detail.behavior')} value={f.comportamento} />
            <DetailRow label={t('fish:detail.feeding')} value={f.alimentacao} />
            <DetailRow label={t('fish:detail.reproduction')} value={f.reproducao} />
            <DetailRow label={t('fish:detail.sexualDimorphism')} value={f.diformismoSexual} />
            <DetailRow label={t('fish:detail.otherInfo')} value={f.outrasInformacoes} />
            <DetailRow label={t('common:detail.label.source')} value={fish.fonte} />
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
                <DistributionMap taxonKey={enrichment.gbifTaxonKey} speciesName={f.nomePopular} />
              </Suspense>
            </div>
          )}

          {enrichment && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.learnMore')}</h3>
              <ExternalLinks enrichment={enrichment} nomeCientifico={fish.nomeCientifico} />
            </div>
          )}
        </div>
      </div>

      {fish.familia && (
        <div className="mt-6 bg-card rounded-3xl shadow-lg shadow-black/5 overflow-hidden p-6 sm:p-8">
          <SimilarSpecies
            currentId={fish.id}
            familia={fish.familia}
            loadAll={loadSimilar}
            basePath={`/peixes/${slug}`}
          />
        </div>
      )}
    </div>
  )
}
