import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'

/** Tempo da ficha antiga saindo de cena. Casa com as keyframes `ficha-saida-*`. */
const SAIDA_MS = 170

/** Tempo da ficha nova entrando. Casa com as keyframes `ficha-entrada-*`. */
const ENTRADA_MS = 240

/** 1 quando a troca vai para a proxima ficha, -1 quando volta para a anterior. */
type Sentido = 1 | -1

interface Passagem {
  etapa: 'saida' | 'entrada'
  sentido: Sentido
  /** Onde o dedo largou o conteudo, para a saida partir dali sem solavanco. */
  origem: number
}

export interface SwipeTarget {
  to: string
  label: string
}

interface Props {
  /** Para onde o arrasto para a direita leva. */
  prev?: SwipeTarget
  /** Para onde o arrasto para a esquerda leva. */
  next?: SwipeTarget
  children: ReactNode
}

/**
 * Etiqueta que aparece na lateral durante o arrasto, dizendo qual ficha
 * vem a seguir. Fica fixa na altura da tela porque a ficha e longa: presa
 * ao conteudo, ela sumiria do campo de visao a cada rolagem.
 */
function Peek({
  side,
  target,
  progress,
}: {
  side: 'left' | 'right'
  target?: SwipeTarget
  progress: number
}) {
  if (!target || progress <= 0) return null

  const Icon = side === 'left' ? ChevronLeft : ChevronRight

  return (
    <div
      className={`fixed top-1/2 -translate-y-1/2 z-30 max-w-[60vw] pointer-events-none ${
        side === 'left' ? 'left-2' : 'right-2'
      }`}
      style={{ opacity: progress }}
    >
      <div className="flex items-center gap-1.5 rounded-full bg-card border border-border shadow-lg shadow-black/10 px-3 py-2">
        {side === 'left' && <Icon size={16} className="text-primary shrink-0" />}
        <span className="text-xs font-semibold text-text truncate min-w-0">{target.label}</span>
        {side === 'right' && <Icon size={16} className="text-primary shrink-0" />}
      </div>
    </div>
  )
}

/** Qual das quatro keyframes toca em cada etapa da passagem. */
function animacaoDe({ etapa, sentido }: Passagem) {
  if (etapa === 'saida') {
    const nome = sentido === 1 ? 'ficha-saida-esquerda' : 'ficha-saida-direita'
    return `${nome} ${SAIDA_MS}ms ease-in forwards`
  }
  const nome = sentido === 1 ? 'ficha-entrada-direita' : 'ficha-entrada-esquerda'
  return `${nome} ${ENTRADA_MS}ms ease-out`
}

/**
 * Envolve uma ficha para que o toque lateral leve a especie vizinha.
 *
 * O conteudo entra por `children` de proposito: o arrasto redesenha este
 * componente a cada quadro e, vindo de fora, a ficha inteira (imagens,
 * mapa, taxonomia) nao e redesenhada junto.
 */
export default function SwipeNav({ prev, next, children }: Props) {
  const navigate = useNavigate()
  const [passagem, setPassagem] = useState<Passagem | null>(null)

  // O `offset` so existe depois da chamada do hook, mas o `go` precisa dele
  // e e passado para o hook. A ref quebra a ordem circular.
  const offsetAtual = useRef(0)
  // Segundo gesto no meio da passagem nao empilha uma segunda troca.
  const emTransito = useRef(false)
  const timers = useRef<number[]>([])

  const abrir = (target: SwipeTarget) => {
    navigate(target.to)
    // Sem isto a ficha nova abre na altura em que a anterior estava.
    window.scrollTo({ top: 0 })
  }

  /**
   * A troca acontece em duas etapas: a ficha atual sai, e so entao a rota
   * muda e a seguinte entra. Trocar a rota de imediato, como era antes,
   * fazia o conteudo ser substituido no lugar, sem nada indicando que o
   * gesto tinha valido.
   */
  const go = (target: SwipeTarget, sentido: Sentido) => {
    if (emTransito.current) return

    // Quem pediu menos movimento no sistema troca de ficha direto.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      abrir(target)
      return
    }

    emTransito.current = true
    setPassagem({ etapa: 'saida', sentido, origem: offsetAtual.current })

    timers.current = [
      window.setTimeout(() => {
        abrir(target)
        setPassagem({ etapa: 'entrada', sentido, origem: 0 })
      }, SAIDA_MS),
      window.setTimeout(() => {
        setPassagem(null)
        emTransito.current = false
      }, SAIDA_MS + ENTRADA_MS),
    ]
  }

  const { ref, offset, progress, swiping } = useSwipeNavigation({
    onNext: next ? () => go(next, 1) : undefined,
    onPrev: prev ? () => go(prev, -1) : undefined,
  })

  useEffect(() => {
    offsetAtual.current = offset
  })

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const animando = passagem !== null
  const saindo = passagem?.etapa === 'saida'

  // Enquanto a ficha sai, a etiqueta do destino fica de pe: ela e o ponto
  // parado que mostra para onde o conteudo esta indo.
  const peekEsquerda = saindo && passagem.sentido === -1 ? 1 : Math.max(0, progress)
  const peekDireita = saindo && passagem.sentido === 1 ? 1 : Math.max(0, -progress)

  const estilo: CSSProperties = {
    // O translate do arrasto sai de cena durante a passagem: dali em diante
    // quem controla o transform e a keyframe.
    transform: !animando && offset ? `translate3d(${offset}px, 0, 0)` : undefined,
    animation: passagem ? animacaoDe(passagem) : undefined,
    // Deixa a rolagem vertical e o zoom com o navegador e reserva o
    // movimento lateral para o gesto.
    touchAction: 'pan-y pinch-zoom',
  }

  if (passagem) {
    ;(estilo as Record<string, string>)['--passagem-origem'] = `${passagem.origem}px`
  }

  return (
    <div className="relative overflow-hidden">
      <Peek side="left" target={prev} progress={peekEsquerda} />
      <Peek side="right" target={next} progress={peekDireita} />
      <div
        ref={ref}
        className={swiping || animando ? undefined : 'transition-transform duration-200 ease-out'}
        style={estilo}
      >
        {children}
      </div>
    </div>
  )
}
