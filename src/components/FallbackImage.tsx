import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAllImages } from '../utils/image'
import ImageLightbox from './ImageLightbox'

interface Props {
  localImage: string
  inatPhotos?: string[]
  wikiPhoto?: string
  alt: string
  className?: string
  /**
   * Clicar abre a imagem em tela cheia. Opt-in por componente, e nao
   * comportamento novo do `FallbackImage`: nas listagens e nos cards a
   * imagem inteira ja e um link para a ficha, e roubar o clique dali
   * quebraria a navegacao.
   */
  zoomable?: boolean
}

export default function FallbackImage({
  localImage,
  inatPhotos,
  wikiPhoto,
  alt,
  className = '',
  zoomable = false,
}: Props) {
  const { t } = useTranslation('common')
  const [aberta, setAberta] = useState(false)
  const allUrls = getAllImages(localImage, inatPhotos, wikiPhoto)
  const [urlIndex, setUrlIndex] = useState(0)
  const [allFailed, setAllFailed] = useState(false)

  /*
    Trocar de especie sem sair da rota (o arrasto lateral da ficha, os links
    de especies da mesma familia) so troca as props: este componente continua
    montado e levaria consigo o indice da especie anterior. Uma foto que
    falhou fazia entao a especie seguinte comecar pela segunda opcao, e a
    arte propria do Aqua360, que e sempre a primeira, era pulada.
  */
  const listaAtual = allUrls.join('|')
  const [listaAnterior, setListaAnterior] = useState(listaAtual)
  if (listaAtual !== listaAnterior) {
    setListaAnterior(listaAtual)
    setUrlIndex(0)
    setAllFailed(false)
  }

  const currentUrl = allUrls[urlIndex]

  const handleError = () => {
    if (urlIndex < allUrls.length - 1) {
      setUrlIndex(prev => prev + 1)
    } else {
      setAllFailed(true)
    }
  }

  if (!currentUrl || allFailed) {
    return (
      <div className={`flex flex-col items-center justify-center bg-surface-alt ${className}`}>
        <ImageOff size={32} className="text-text-secondary/20 mb-2" />
        <p className="text-xs text-text-secondary/40 font-medium">{alt}</p>
      </div>
    )
  }

  const imagem = (
    <img
      src={currentUrl}
      alt={alt}
      className={`object-cover ${className}`}
      onError={handleError}
    />
  )

  if (!zoomable) return imagem

  return (
    <>
      {/*
        Botao de verdade, e nao um `onClick` na imagem: quem navega por
        teclado precisa chegar ate aqui com Tab, e quem usa leitor de tela
        precisa ouvir que isto abre alguma coisa.
      */}
      <button
        type="button"
        onClick={() => setAberta(true)}
        aria-label={t('lightbox.open', { name: alt })}
        className="block h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {imagem}
      </button>
      {aberta && <ImageLightbox src={currentUrl} alt={alt} onClose={() => setAberta(false)} />}
    </>
  )
}
