import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'

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

/**
 * Envolve uma ficha para que o toque lateral leve a especie vizinha.
 *
 * O conteudo entra por `children` de proposito: o arrasto redesenha este
 * componente a cada quadro e, vindo de fora, a ficha inteira (imagens,
 * mapa, taxonomia) nao e redesenhada junto.
 */
export default function SwipeNav({ prev, next, children }: Props) {
  const navigate = useNavigate()

  const go = (target: SwipeTarget) => {
    navigate(target.to)
    // Sem isto a ficha nova abre na altura em que a anterior estava.
    window.scrollTo({ top: 0 })
  }

  const { ref, offset, progress, swiping } = useSwipeNavigation({
    onNext: next ? () => go(next) : undefined,
    onPrev: prev ? () => go(prev) : undefined,
  })

  return (
    <div className="relative overflow-hidden">
      <Peek side="left" target={prev} progress={Math.max(0, progress)} />
      <Peek side="right" target={next} progress={Math.max(0, -progress)} />
      <div
        ref={ref}
        className={swiping ? undefined : 'transition-transform duration-200 ease-out'}
        style={{
          transform: offset ? `translate3d(${offset}px, 0, 0)` : undefined,
          // Deixa a rolagem vertical e o zoom com o navegador e reserva o
          // movimento lateral para o gesto.
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        {children}
      </div>
    </div>
  )
}
