import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { loadFishByType } from '../data/fish-index'
import type { Fish } from '../types'
import FallbackImage from '../components/FallbackImage'
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

const DistributionMap = lazy(() => import('../components/DistributionMap'))

export default function FishDetailPage() {
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Carregando...
        </div>
      </div>
    )
  }

  if (!fish) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Peixe não encontrado" backTo={`/peixes/${slug}`} />
      </div>
    )
  }
  const enrichment = fish.enrichment
  const hasParams = fish.ph || fish.gh || fish.kh || fish.temperatura || fish.tamanhoAdulto || fish.posicaoAquario

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title={fish.nomePopular} description={`${fish.nomePopular} (${fish.nomeCientifico}) - pH ${fish.ph}, ${fish.temperatura}. ${fish.comportamento?.slice(0, 100)}`} />
      <div className="flex items-start justify-between">
        <PageHeader title={fish.nomePopular} backTo={`/peixes/${slug}`} />
        <FavoriteButton id={fish.id} type="fish" slug={slug} />
      </div>

      <div className="bg-card rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
        <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden bg-surface-alt relative">
          <FallbackImage
            localImage={fish.imagem}
            inatPhotos={enrichment?.inatPhotoUrls}
            wikiPhoto={enrichment?.wikiPhotoUrl}
            alt={fish.nomePopular}
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-white/80 text-sm italic drop-shadow-lg">{fish.nomeCientifico}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-5 pb-5 border-b border-border/60">
            <SpeciesBadges
              comportamento={fish.comportamento}
              alimentacao={fish.alimentacao}
              tipo={fish.tipo}
              outrasInformacoes={fish.outrasInformacoes}
              caracteristica={fish.caracteristica}
            />
          </div>

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
                <ParamCard icon="Droplets" label="pH" value={fish.ph} />
                <ParamCard icon="Gauge" label="GH" value={fish.gh} />
                <ParamCard icon="Gauge" label="KH" value={fish.kh} />
                <ParamCard icon="Thermometer" label="Temperatura" value={fish.temperatura} />
                <ParamCard icon="Ruler" label="Tamanho Adulto" value={fish.tamanhoAdulto} />
                <ParamCard icon="Layers" label="Posição" value={fish.posicaoAquario} />
              </div>
            </div>
          )}

          <dl>
            <DetailRow label="Nome Popular" value={fish.nomePopular} />
            <DetailRow label="Nome Científico" value={fish.nomeCientifico} />
            <DetailRow label="Outros Nomes" value={fish.outrosNome} />
            <DetailRow label="Família" value={fish.familia} />
            <DetailRow label="Origem" value={fish.origem} />
            <DetailRow label="Características" value={fish.caracteristica} />
            <DetailRow label="Comportamento" value={fish.comportamento} />
            <DetailRow label="Alimentação" value={fish.alimentacao} />
            <DetailRow label="Reprodução" value={fish.reproducao} />
            <DetailRow label="Dimorfismo Sexual" value={fish.diformismoSexual} />
            <DetailRow label="Outras Informações" value={fish.outrasInformacoes} />
            <DetailRow label="Fonte" value={fish.fonte} />
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
                <DistributionMap taxonKey={enrichment.gbifTaxonKey} speciesName={fish.nomePopular} />
              </Suspense>
            </div>
          )}

          {enrichment && (
            <div className="mt-8 pt-6 border-t border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Saiba Mais</h3>
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
