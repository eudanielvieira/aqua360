import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ImageLightbox from './ImageLightbox'

interface Props {
  photos: string[]
}

export default function CommunityPhotos({ photos }: Props) {
  const { t } = useTranslation('common')
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set())
  const [aberta, setAberta] = useState<number | null>(null)

  const validPhotos = photos.filter((_, i) => !failedIndexes.has(i))

  if (validPhotos.length === 0) return null

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => {
          if (failedIndexes.has(i)) return null
          const legenda = t('communityPhoto.alt', { n: i + 1 })
          return (
            /*
              A miniatura entra num botao porque aqui o ganho de abrir
              maior e o maior da ficha inteira: ela sai com cerca de um
              terco da largura da coluna, e e onde o detalhe se perde.
            */
            <button
              key={i}
              type="button"
              onClick={() => setAberta(i)}
              aria-label={t('lightbox.open', { name: legenda })}
              className="aspect-square rounded-lg overflow-hidden bg-surface-alt cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <img
                src={url}
                alt={legenda}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setFailedIndexes(prev => new Set(prev).add(i))}
              />
            </button>
          )
        })}
      </div>
      <p className="text-xs text-text-secondary mt-2">
        {t('communityPhoto.credit')}{' '}
        <a
          href="https://www.inaturalist.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          iNaturalist
        </a>
      </p>

      {aberta !== null && (
        <ImageLightbox
          /*
            A foto da comunidade chega em tamanho `medium`. No visualizador
            vale pedir a `large`, a maior que o iNaturalist serve sem
            autenticacao, senao "abrir maior" entrega o mesmo pixel.
          */
          src={photos[aberta].replace('/medium.', '/large.').replace('/medium/', '/large/')}
          alt={t('communityPhoto.alt', { n: aberta + 1 })}
          onClose={() => setAberta(null)}
        />
      )}
    </div>
  )
}
