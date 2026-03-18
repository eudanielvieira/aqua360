import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import type { Plant } from '../types'
import { getImageUrl } from '../utils/image'
import PageHeader from '../components/PageHeader'
import DetailRow from '../components/DetailRow'
import TaxonomyTree from '../components/TaxonomyTree'
import CommunityPhotos from '../components/CommunityPhotos'
import ExternalLinks from '../components/ExternalLinks'

const DistributionMap = lazy(() => import('../components/DistributionMap'))

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [plant, setPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../data/plants').then(mod => {
      setPlant(mod.default.find(p => p.id === Number(id)) || null)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Carregando...
        </div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader title="Planta não encontrada" backTo="/plantas" />
      </div>
    )
  }

  const enrichment = plant.enrichment

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader title={plant.nomePopular} backTo="/plantas" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="aspect-video max-h-80 overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(plant.imagem)}
            alt={plant.nomePopular}
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
            <DetailRow label="Nome Popular" value={plant.nomePopular} />
            <DetailRow label="Nome Científico" value={plant.nomeCientifico} />
            <DetailRow label="Outros Nomes" value={plant.outrosNome} />
            <DetailRow label="Família" value={plant.familia} />
            <DetailRow label="Estrutura" value={plant.estrutura} />
            <DetailRow label="Origem" value={plant.origem} />
            <DetailRow label="Crescimento" value={plant.crescimento} />
            <DetailRow label="Plantio" value={plant.plantio} />
            <DetailRow label="Iluminação" value={plant.iluminacao} />
            <DetailRow label="pH" value={plant.ph} />
            <DetailRow label="Temperatura" value={plant.temperatura} />
            <DetailRow label="Tamanho" value={plant.tamanho} />
            <DetailRow label="Porte" value={plant.porte} />
            <DetailRow label="Posição" value={plant.posicao} />
            <DetailRow label="Reprodução" value={plant.reproducao} />
            <DetailRow label="Dificuldade" value={plant.dificuldade} />
            <DetailRow label="Substrato Fértil" value={plant.substratoFertil} />
            <DetailRow label="CO2" value={plant.co2} />
            <DetailRow label="Suporta Emersão" value={plant.suportaEmersao} />
            <DetailRow label="Fonte" value={plant.fonte} />
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
              <ExternalLinks enrichment={enrichment} nomeCientifico={plant.nomeCientifico} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
