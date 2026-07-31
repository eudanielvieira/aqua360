import { useCallback, useEffect, useRef, useState } from 'react'

/** Quanto o dedo precisa percorrer para a troca valer. */
const THRESHOLD = 72

/** Ate esta distancia o gesto ainda pode virar rolagem vertical. */
const DIRECTION_LOCK = 12

/** Faixa da borda esquerda reservada ao gesto de voltar do navegador. */
const EDGE_GUARD = 28

/** O conteudo acompanha uma fracao do arrasto, o resto vira resistencia. */
const FOLLOW = 0.4

/** Resistencia bem maior quando nao ha ficha do lado para onde o dedo vai. */
const BLOCKED_FOLLOW = 0.1

interface Options {
  /** Arrastar para a esquerda. Ausente quando nao ha proxima ficha. */
  onNext?: () => void
  /** Arrastar para a direita. Ausente quando nao ha ficha anterior. */
  onPrev?: () => void
}

interface Swipe {
  /** Vai no elemento que acompanha o dedo. */
  ref: (element: HTMLElement | null) => void
  /** Deslocamento em px ja amortecido, pronto para o translate. */
  offset: number
  /** De -1 (indo para a proxima) a 1 (indo para a anterior), 0 parado. */
  progress: number
  /** Verdadeiro do momento em que o gesto vira lateral ate soltar o dedo. */
  swiping: boolean
}

/**
 * Troca de ficha arrastando o dedo para o lado.
 *
 * So escuta toque: no mouse nao existe gesto equivalente e a navegacao
 * segue pelos links da listagem. Quem quiser um trecho imune ao gesto
 * (um mapa, um carrossel) marca o elemento com `data-swipe-ignore`.
 */
export function useSwipeNavigation({ onNext, onPrev }: Options): Swipe {
  const [offset, setOffset] = useState(0)
  const [progress, setProgress] = useState(0)
  const [swiping, setSwiping] = useState(false)

  // Os callbacks mudam a cada ficha aberta, mas os listeners sao
  // registrados uma vez so; a ref carrega sempre a versao atual.
  const callbacks = useRef({ onNext, onPrev })
  useEffect(() => {
    callbacks.current = { onNext, onPrev }
  })

  const ref = useCallback((element: HTMLElement | null) => {
    if (!element) return

    let startX = 0
    let startY = 0
    let dx = 0
    let tracking = false
    let axis: 'undecided' | 'x' | 'y' = 'undecided'

    const reset = () => {
      tracking = false
      axis = 'undecided'
      dx = 0
      setOffset(0)
      setProgress(0)
      setSwiping(false)
    }

    const start = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        reset()
        return
      }
      const touch = event.touches[0]
      const target = event.target as Element | null
      if (target?.closest?.('[data-swipe-ignore]')) return
      // A borda esquerda pertence ao gesto de voltar do sistema.
      if (touch.clientX < EDGE_GUARD) return

      tracking = true
      axis = 'undecided'
      dx = 0
      startX = touch.clientX
      startY = touch.clientY
    }

    const move = (event: TouchEvent) => {
      if (!tracking) return
      const touch = event.touches[0]
      dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (axis === 'undecided') {
        if (Math.abs(dx) < DIRECTION_LOCK && Math.abs(dy) < DIRECTION_LOCK) return
        // Rolar a pagina ganha do gesto lateral: quem esta lendo a ficha
        // nao pode ver o conteudo escorregar de lado sem querer.
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        if (axis === 'y') {
          tracking = false
          return
        }
        setSwiping(true)
      }

      const blocked = dx < 0 ? !callbacks.current.onNext : !callbacks.current.onPrev
      setOffset(dx * (blocked ? BLOCKED_FOLLOW : FOLLOW))
      setProgress(blocked ? 0 : Math.max(-1, Math.min(1, dx / THRESHOLD)))
    }

    const end = () => {
      if (tracking && axis === 'x') {
        if (dx <= -THRESHOLD) callbacks.current.onNext?.()
        else if (dx >= THRESHOLD) callbacks.current.onPrev?.()
      }
      reset()
    }

    element.addEventListener('touchstart', start, { passive: true })
    element.addEventListener('touchmove', move, { passive: true })
    element.addEventListener('touchend', end)
    element.addEventListener('touchcancel', reset)

    return () => {
      element.removeEventListener('touchstart', start)
      element.removeEventListener('touchmove', move)
      element.removeEventListener('touchend', end)
      element.removeEventListener('touchcancel', reset)
    }
  }, [])

  return { ref, offset, progress, swiping }
}
