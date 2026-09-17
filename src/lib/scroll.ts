import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { uiStore } from './cart'

/** Scroll to top on route change; to the element on hash change. */
export function useScrollManager() {
  const { pathname, hash, key } = useLocation()
  useEffect(() => {
    // any overlay (cart drawer, quick view) closes when the route changes
    uiStore.closeCart(); uiStore.quickView(null)
    if (hash) {
      // the target section may still be mounting on a cold load: retry a few times before giving up
      const id = hash.slice(1)
      const timers: number[] = []
      const go = () => { const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); timers.forEach(clearTimeout) } }
      for (const ms of [60, 250, 600, 1200]) timers.push(window.setTimeout(go, ms))
      return () => timers.forEach(clearTimeout)
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash, key])
}
