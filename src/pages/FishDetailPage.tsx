import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { loadFishByType } from '../data/fish-index'
import type { Fish } from '../types'
import { getImageUrl } from '../utils/image'
import PageHeader from '../components/PageHeader'
import DetailRow from '../components/DetailRow'
import TaxonomyTree from '../components/TaxonomyTree'
import CommunityPhotos from '../components/CommunityPhotos'
import ExternalLinks from '../components/ExternalLinks'

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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Carregando...
        </div>
      </div>
    )
  }

  if (!fish) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader title="Peixe não encontrado" backTo={`/peixes/${slug}`} />
      </div>
    )
  }

  const enrichment = fish.enrichment

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader title={fish.nomePopular} backTo={`/peixes/${slug}`} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="aspect-video max-h-80 overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(fish.imagem)}
            alt={fish.nomePopular}
            className="w-full h-full object-cover"
            onError={e => {
              const target = e.target as HTMLImageElement
              target.src = '/images/avatar.jpg'
            }}
          />
        </div>

        <div className="p-5">
          {enrichment?.taxonomia && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Classificação Taxonômica</h3>
              <TaxonomyTree taxonomia={enrichment.taxonomia} />
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
            <DetailRow label="pH" value={fish.ph} />
            <DetailRow label="GH" value={fish.gh} />
            <DetailRow label="KH" value={fish.kh} />
            <DetailRow label="Temperatura" value={fish.temperatura} />
            <DetailRow label="Tamanho Adulto" value={fish.tamanhoAdulto} />
            <DetailRow label="Posição no Aquário" value={fish.posicaoAquario} />
            <DetailRow label="Alimentação" value={fish.alimentacao} />
            <DetailRow label="Reprodução" value={fish.reproducao} />
            <DetailRow label="Dimorfismo Sexual" value={fish.diformismoSexual} />
            <DetailRow label="Outras Informações" value={fish.outrasInformacoes} />
            <DetailRow label="Fonte" value={fish.fonte} />
          </dl>

          {enrichment?.inatPhotoUrls && enrichment.inatPhotoUrls.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Fotos da Comunidade</h3>
              <CommunityPhotos photos={enrichment.inatPhotoUrls} />
            </div>
          )}

          {enrichment?.gbifTaxonKey && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Distribuição Geográfica</h3>
              <Suspense fallback={<div className="w-full h-64 rounded-xl bg-gray-100 animate-pulse" />}>
                <DistributionMap taxonKey={enrichment.gbifTaxonKey} />
              </Suspense>
            </div>
          )}

          {enrichment && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Saiba Mais</h3>
              <ExternalLinks enrichment={enrichment} nomeCientifico={fish.nomeCientifico} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
