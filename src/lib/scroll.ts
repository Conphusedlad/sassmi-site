import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { uiStore } from './cart'

/** Scroll to top on route change; to the element on hash change. */
export function useScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // any overlay (cart drawer, quick view) closes when the route changes
    uiStore.closeCart(); uiStore.quickView(null)
    if (hash) {
      const id = hash.slice(1)
      const go = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const t = setTimeout(go, 60)
      return () => clearTimeout(t)
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])
}
