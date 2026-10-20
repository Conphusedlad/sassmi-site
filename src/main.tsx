import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { MotionGlobalConfig } from 'framer-motion'
import './index.css'
import { router } from './router'
import { IS_SHOPIFY } from './lib/env'
import { uiStore } from './lib/cart'

// QA aid: ?noanim=1 skips entrance animations (used for screenshots and slow devices)
if (new URLSearchParams(location.search).has('noanim')) MotionGlobalConfig.skipAnimations = true

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

// Shopify's /cart URL lands here as /?cart=open#/ (see layout/theme.liquid) — open the drawer instead of a cart page
if (IS_SHOPIFY && new URLSearchParams(location.search).get('cart') === 'open') {
  const q = new URLSearchParams(location.search); q.delete('cart')
  history.replaceState(null, '', location.pathname + (q.size ? `?${q}` : '') + location.hash) // don't let a reload or a copied link reopen it
  setTimeout(uiStore.openCart, 50)
}
