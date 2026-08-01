import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Quanto a imagem cresce no modo de inspecao. */
const ZOOM = 2.5

interface Props {
  src: string
  alt: string
  onClose: () => void
}

/**
 * Visualizador em tela cheia, para ver o detalhe da ilustracao.
 *
 * Traz zoom proprio em vez de deixar para o navegador porque o
 * `index.html` fixa `maximum-scale=1.0, user-scalable=no` no viewport, e
 * com isso o pinch do sistema nao funciona em lugar nenhum do app. Sem
 * um zoom aqui dentro, "abrir maior" pararia no tamanho da tela.
 */
export default function ImageLightbox({ src, alt, onClose }: Props) {
  const { t } = useTranslation('common')
  const [ampliado, setAmpliado] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const fecharRef = useRef<HTMLButtonElement>(null)
  const arraste = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  // Devolve o foco para onde ele estava: quem abriu pelo teclado precisa
  // voltar para o mesmo ponto da pagina, e nao para o topo.
  const origemDoFoco = useRef<Element | null>(null)
  useEffect(() => {
    origemDoFoco.current = document.activeElement
    fecharRef.current?.focus()
    return () => {
      if (origemDoFoco.current instanceof HTMLElement) origemDoFoco.current.focus()
    }
  }, [])

  // Trava a rolagem do fundo enquanto o visualizador esta aberto, senao o
  // arrasto para deslocar a imagem rola a ficha atras.
  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [])

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onClose])

  const alternarZoom = useCallback(() => {
    setAmpliado(atual => {
      if (atual) setPan({ x: 0, y: 0 })
      return !atual
    })
  }, [])

  const aoPegar = (e: React.PointerEvent) => {
    if (!ampliado) return
    arraste.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const aoMover = (e: React.PointerEvent) => {
    const inicio = arraste.current
    if (!inicio) return
    setPan({ x: inicio.panX + (e.clientX - inicio.x), y: inicio.panY + (e.clientY - inicio.y) })
  }

  const aoSoltar = () => {
    arraste.current = null
  }

  return createPortal(
    /*
      `data-swipe-ignore` mantem o arrasto lateral da ficha fora daqui: sem
      ele, deslocar a imagem ampliada trocaria de especie no meio da
      inspecao.
    */
    <div
      data-swipe-ignore
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="absolute top-0 right-0 left-0 flex items-center justify-between gap-3 p-3 sm:p-4">
        <p className="min-w-0 truncate text-sm font-medium text-white/80">{alt}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              alternarZoom()
            }}
            aria-label={ampliado ? t('lightbox.zoomOut') : t('lightbox.zoomIn')}
            className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {ampliado ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          <button
            ref={fecharRef}
            type="button"
            onClick={e => {
              e.stopPropagation()
              onClose()
            }}
            aria-label={t('lightbox.close')}
            className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <img
        src={src}
        alt={alt}
        draggable={false}
        onClick={e => {
          e.stopPropagation()
          alternarZoom()
        }}
        onPointerDown={aoPegar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${ampliado ? ZOOM : 1})` }}
        className={`max-h-[88vh] max-w-[94vw] touch-none select-none rounded-lg object-contain shadow-2xl transition-transform duration-200 motion-reduce:transition-none ${
          ampliado ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
      />

      <p className="pointer-events-none absolute bottom-4 left-0 right-0 px-4 text-center text-xs text-white/50">
        {t('lightbox.hint')}
      </p>
    </div>,
    document.body,
  )
}
