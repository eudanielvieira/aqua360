import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

export function usePageTracking() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pathname + search,
        page_title: document.title,
      })
    }
  }, [pathname, search])
}
