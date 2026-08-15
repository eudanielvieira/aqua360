import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Comeca cada pathname no topo, inclusive a home, que vive fora do Layout.
 * Evita carregar a posicao da tela anterior ao navegar por link ou historico.
 */
export function useScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
}
