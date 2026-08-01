import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loadFishByType } from '../data/fish-index'
import type { Fish } from '../types'
import FallbackImage from '../components/FallbackImage'
import { isNormalized } from '../utils/image'
import PageHeader from '../components/PageHeader'
import DetailRow from '../components/DetailRow'
import TaxonomyTree from '../components/TaxonomyTree'
import CommunityPhotos from '../components/CommunityPhotos'
import ExternalLinks from '../components/ExternalLinks'
import SimilarSpecies from '../components/SimilarSpecies'
import SpeciesBadges from '../components/SpeciesBadges'
import FavoriteButton from '../components/FavoriteButton'
import SEO from '../components/SEO'
import SwipeNav from '../components/SwipeNav'
import { fishMeta } from '../seo/meta'
import { useTranslatedSpecies } from '../hooks/useTranslatedSpecies'

const DistributionMap = lazy(() => import('../components/DistributionMap'))

/**
 * Linha curta da ficha (outros nomes, familia, origem).
 *
 * O DetailRow nao serve aqui: ele foi feito para os blocos de texto
 * longo la de baixo, com titulo em cima e separador, e ocuparia altura
 * demais na coluna ao lado da imagem.
 */
function FactRow({
  label,
  value,
  fallback,
  clamp = false,
}: {
  label: string
  value?: string
  /**
   * Texto que entra no lugar do valor quando o campo esta vazio, para a
   * linha nao sumir. Mesma ideia do DetailRow: a ficha sai sempre com o
   * mesmo conjunto de linhas e a lacuna aparece em vez de se esconder.
   */
  fallback?: string
  /**
   * Corta o valor em duas linhas. Usado nos parametros, onde alguns
   * registros trazem um paragrafo no lugar do valor e estouram a tabela:
   * o tamanho adulto da Arraia Leopoldi rende dez linhas. O texto
   * completo continua acessivel no title.
   */
  clamp?: boolean
}) {
  const vazio = !value || value.trim() === ''
  if (vazio && !fallback) return null

  return (
    <div className="flex gap-3 py-1.5 text-sm border-b border-border/40 last:border-0">
      <dt className="text-text-secondary w-32 shrink-0">{label}</dt>
      <dd
        className={`min-w-0 flex-1 ${
          vazio ? 'text-text-secondary italic' : 'text-text font-medium'
        } ${clamp && !vazio ? 'line-clamp-2' : ''}`}
        title={clamp && !vazio ? value : undefined}
      >
        {vazio ? fallback : value}
      </dd>
    </div>
  )
}

export default function FishDetailPage() {
  const { t } = useTranslation(['fish', 'common'])
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const [fish, setFish] = useState<Fish | null>(null)
  const [siblings, setSiblings] = useState<Fish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug || !id) return
    loadFishByType(slug).then(data => {
      // Mesma ordem da listagem da categoria, para o arrastar seguir a
      // sequencia que a pessoa viu na lista. Copia antes de ordenar porque
      // o array vem do modulo de dados e e compartilhado com as outras telas.
      const ordered = [...data].sort((a, b) => a.nomePopular.localeCompare(b.nomePopular))
      setSiblings(ordered)
      setFish(ordered.find(f => f.id === Number(id)) || null)
      setLoading(false)
    })
  }, [slug, id])

  const loadSimilar = useCallback(() => loadFishByType(slug!), [slug])

  // Vizinhas do arrasto lateral. Nas pontas da lista fica sem destino
  // daquele lado, e o gesto so faz o conteudo ceder um pouco e voltar.
  const { prev, next } = useMemo(() => {
    const index = siblings.findIndex(f => f.id === Number(id))
    if (index === -1) return { prev: null, next: null }
    return { prev: siblings[index - 1] ?? null, next: siblings[index + 1] ?? null }
  }, [siblings, id])

  const translated = useTranslatedSpecies(fish, 'fish')
  const translatedPrev = useTranslatedSpecies(prev, 'fish')
  const translatedNext = useTranslatedSpecies(next, 'fish')

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
  /*
    A ficha do peixe e homogenea: todas as especies saem com as mesmas
    linhas, os mesmos parametros e as mesmas secoes de texto, na mesma
    ordem. Onde o acervo ainda nao tem o dado, a linha fica e diz que
    nao ha informacao, em vez de sumir. Duas fichas lado a lado passam a
    ser comparaveis, e a lacuna vira trabalho visivel em vez de silencio.
  */
  const naoInformado = t('common:detail.notInformed')

  const swipePrev = translatedPrev
    ? { to: `/peixes/${slug}/${translatedPrev.id}`, label: translatedPrev.nomePopular }
    : undefined
  const swipeNext = translatedNext
    ? { to: `/peixes/${slug}/${translatedNext.id}`, label: translatedNext.nomePopular }
    : undefined

  return (
    <SwipeNav prev={swipePrev} next={swipeNext}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SEO {...fishMeta(f)} type="article" />
        <div className="flex items-start justify-between">
          <PageHeader backTo={`/peixes/${slug}`} />
          <FavoriteButton id={fish.id} type="fish" slug={slug} />
        </div>

        <div className="bg-card rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/*
              Os dois nomes abrem a ficha, acima da imagem e da tabela. O
              popular e o titulo da pagina e leva o peso; o cientifico vem
              logo abaixo, menor e em italico, como identificacao.
            */}
            <header className="mb-6 pb-5 border-b border-border/60">
              <h1 className="text-3xl font-extrabold text-text tracking-tight leading-tight">{f.nomePopular}</h1>
              <p className="mt-1 text-lg italic text-text-secondary">{fish.nomeCientifico}</p>
            </header>

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
                className={`shrink-0 overflow-hidden rounded-2xl bg-surface-alt w-full sm:w-[22rem] sm:mx-auto md:mx-0 md:w-[22.5rem] ${
                  isNormalized(fish.imagem) ? 'aspect-square' : 'h-56 sm:h-64 md:h-64'
                }`}
              >
                <FallbackImage
                  localImage={fish.imagem}
                  inatPhotos={enrichment?.inatPhotoUrls}
                  wikiPhoto={enrichment?.wikiPhotoUrl}
                  alt={f.nomePopular}
                  className="w-full h-full"
                  zoomable
                />
              </div>

              <div className="min-w-0 flex-1">
                <dl>
                  <FactRow label={t('common:detail.label.otherNames')} value={f.outrosNome} fallback={naoInformado} />
                  <FactRow label={t('common:detail.label.family')} value={fish.familia} fallback={naoInformado} />
                  <FactRow label={t('common:detail.label.origin')} value={f.origem} fallback={naoInformado} />
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

                {/*
                  Os parametros sao linhas de tabela, nao cartoes: seis
                  cartoes ocupavam altura demais ao lado da imagem e
                  dominavam a ficha. Em tabela a coluna encolhe pela metade
                  e as duas alturas se aproximam sem truque de layout.
                */}
                <div className="mt-5">
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{t('common:detail.parameters')}</h3>
                  <dl>
                    <FactRow label="pH" value={fish.ph} fallback={naoInformado} clamp />
                    <FactRow label="GH" value={fish.gh} fallback={naoInformado} clamp />
                    <FactRow label="KH" value={fish.kh} fallback={naoInformado} clamp />
                    <FactRow label={t('common:param.temperature')} value={fish.temperatura} fallback={naoInformado} clamp />
                    <FactRow label={t('common:param.adultSize')} value={fish.tamanhoAdulto} fallback={naoInformado} clamp />
                    <FactRow label={t('common:param.position')} value={f.posicaoAquario} fallback={naoInformado} clamp />
                  </dl>
                </div>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-border/60">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{t('common:detail.taxonomy')}</h3>
              <TaxonomyTree taxonomia={enrichment?.taxonomia} fallback={naoInformado} />
            </div>

            {/* Nome, familia e origem sobem para a ficha, entao aqui ficam so os textos longos. */}
            <dl>
              <DetailRow label={t('fish:detail.characteristics')} value={f.caracteristica} fallback={naoInformado} />
              <DetailRow label={t('fish:detail.behavior')} value={f.comportamento} fallback={naoInformado} />
              <DetailRow label={t('fish:detail.feeding')} value={f.alimentacao} fallback={naoInformado} />
              <DetailRow label={t('fish:detail.reproduction')} value={f.reproducao} fallback={naoInformado} />
              <DetailRow label={t('fish:detail.sexualDimorphism')} value={f.diformismoSexual} fallback={naoInformado} />
              <DetailRow label={t('fish:detail.otherInfo')} value={f.outrasInformacoes} fallback={naoInformado} />
              <DetailRow label={t('common:detail.label.source')} value={fish.fonte} fallback={naoInformado} />
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
                {/* O mapa arrasta sozinho, entao o gesto de trocar de ficha nao vale aqui dentro. */}
                <div data-swipe-ignore>
                  <Suspense fallback={<div className="w-full h-64 rounded-2xl bg-surface-alt animate-pulse" />}>
                    <DistributionMap taxonKey={enrichment.gbifTaxonKey} speciesName={f.nomePopular} />
                  </Suspense>
                </div>
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
    </SwipeNav>
  )
}
