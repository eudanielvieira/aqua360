import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import type { Plant } from '../types'
import FallbackImage from '../components/FallbackImage'
import PageHeader from '../components/PageHeader'
import DetailRow from '../components/DetailRow'
import ParamCard from '../components/ParamCard'
import TaxonomyTree from '../components/TaxonomyTree'
import CommunityPhotos from '../components/CommunityPhotos'
import ExternalLinks from '../components/ExternalLinks'
import SimilarSpecies from '../components/SimilarSpecies'
import FavoriteButton from '../components/FavoriteButton'

const DistributionMap = lazy(() => import('../components/DistributionMap'))

export default function PlantDetailPage() {
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Carregando...
        </div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Planta não encontrada" backTo="/plantas" />
      </div>
    )
  }
  const enrichment = plant.enrichment
  const hasParams = plant.ph || plant.temperatura || plant.iluminacao || plant.co2 || plant.dificuldade || plant.crescimento

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between">
        <PageHeader title={plant.nomePopular} backTo="/plantas" />
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
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Classificação Taxonômica</h3>
              <TaxonomyTree taxonomia={enrichment.taxonomia} />
            </div>
          )}

          {hasParams && (
            <div className="mb-6 pb-6 border-b border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Parâmetros</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <ParamCard icon="Droplets" label="pH" value={plant.ph} />
                <ParamCard icon="Thermometer" label="Temperatura" value={plant.temperatura} />
                <ParamCard icon="Sun" label="Iluminação" value={plant.iluminacao} />
                <ParamCard icon="Wind" label="CO2" value={plant.co2} />
                <ParamCard icon="Signal" label="Dificuldade" value={plant.dificuldade} />
                <ParamCard icon="TrendingUp" label="Crescimento" value={plant.crescimento} />
              </div>
            </div>
          )}

          <dl>
            <DetailRow label="Nome Popular" value={plant.nomePopular} />
            <DetailRow label="Nome Científico" value={plant.nomeCientifico} />
            <DetailRow label="Outros Nomes" value={plant.outrosNome} />
            <DetailRow label="Família" value={plant.familia} />
            <DetailRow label="Estrutura" value={plant.estrutura} />
            <DetailRow label="Origem" value={plant.origem} />
            <DetailRow label="Plantio" value={plant.plantio} />
            <DetailRow label="Tamanho" value={plant.tamanho} />
            <DetailRow label="Porte" value={plant.porte} />
            <DetailRow label="Posição" value={plant.posicao} />
            <DetailRow label="Reprodução" value={plant.reproducao} />
            <DetailRow label="Substrato Fértil" value={plant.substratoFertil} />
            <DetailRow label="Suporta Emersão" value={plant.suportaEmersao} />
            <DetailRow label="Fonte" value={plant.fonte} />
          </dl>

          {enrichment?.inatPhotoUrls && enrichment.inatPhotoUrls.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Fotos da Comunidade</h3>
              <CommunityPhotos photos={enrichment.inatPhotoUrls} />
            </div>
          )}

          {enrichment?.gbifTaxonKey && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Distribuição Geográfica</h3>
              <Suspense fallback={<div className="w-full h-64 rounded-2xl bg-surface-alt animate-pulse" />}>
                <DistributionMap taxonKey={enrichment.gbifTaxonKey} speciesName={plant.nomePopular} />
              </Suspense>
            </div>
          )}

          {enrichment && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Saiba Mais</h3>
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
