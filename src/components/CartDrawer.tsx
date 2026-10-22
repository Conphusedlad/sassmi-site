import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { cart, cartPending, cartSettled, shopCartCount, MAX_QTY, uiStore, useCart, useUI } from '../lib/cart'
import { toast } from '../lib/toast'
import { IS_SHOPIFY } from '../lib/env'
import { goToCheckout } from '../lib/shopify'
import { tins } from '../../shared/products'
import { business, formatINR, whatsappLink, STORE_OPEN } from '../../shared/config'
import { tinCut } from './ProductCard'
import { EASE } from '../lib/motion'

export function CartDrawer() {
  return STORE_OPEN ? <Drawer /> : null
}

function Drawer() {
  const { cartOpen } = useUI()
  const { items, lines, subtotal, shippingFee, total, shippingAtCheckout } = useCart()
  const nav = useNavigate()
  const [handing, setHanding] = useState(false)
  useEffect(() => {
    if (!cartOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') uiStore.closeCart() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [cartOpen])

  const toFree = Math.max(0, business.shipping.freeAbove - subtotal)
  const waText = `Hi Sassmi! I'd like to order:\n${lines.map((l) => `• ${l.name} × ${l.qty}`).join('\n')}\nTotal: ${formatINR(total)}`

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-night/60 backdrop-blur-[2px]" onClick={uiStore.closeCart} />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.55, ease: EASE }} role="dialog" aria-modal="true" aria-label="Your cart"
            className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col bg-ivory text-ink shadow-2xl">
            <header className="flex items-center justify-between border-b border-ivory-2 px-6 py-5">
              <h2 className="flex items-center gap-3 text-2xl"><ShoppingBag size={20} strokeWidth={1.5} /> Your cart</h2>
              <button autoFocus onClick={uiStore.closeCart} className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 hover:bg-night hover:text-ivory" aria-label="Close cart"><X size={16} /></button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="font-display text-3xl italic text-ink-soft">Your jar is empty.</p>
                <p className="text-sm text-muted">{tins.length} flavours are waiting.</p>
                <button className="btn btn-night mt-2" onClick={() => { uiStore.closeCart(); nav('/#collection') }}>Browse the collection</button>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  {lines.map((it) => {
                    const p = it.product
                    return (
                      <li key={it.slug} className="flex gap-4">
                        <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ivory-2 bg-cream">
                          {p ? <img src={tinCut(p)} alt="" className="h-[88%] w-auto" /> : it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-3">
                            <div><p className="font-display text-lg leading-tight">{it.name}</p><p className="text-xs text-muted">{p ? p.netWeight : 'From the Sassmi store'}</p></div>
                            <p className="font-display text-lg">{formatINR(it.unitPrice * it.qty)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-ink/15">
                              <button className="flex h-8 w-8 items-center justify-center hover:text-gold-deep" onClick={() => cart.setQty(it.slug, it.qty - 1)} aria-label="Decrease"><Minus size={13} /></button>
                              <span className="w-6 text-center text-sm">{it.qty}</span>
                              <button className={`flex h-8 w-8 items-center justify-center hover:text-gold-deep ${it.qty >= MAX_QTY ? 'opacity-40' : ''}`} aria-disabled={it.qty >= MAX_QTY} onClick={() => cart.setQty(it.slug, it.qty + 1)} aria-label="Increase"><Plus size={13} /></button>
                            </div>
                            <button className="flex items-center gap-1 text-xs text-muted hover:text-crunchy-red" onClick={() => cart.remove(it.slug)}><Trash2 size={13} /> Remove</button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <footer className="border-t border-ivory-2 bg-cream px-6 py-5">
                  {toFree > 0 ? (
                    <div className="mb-4">
                      <p className="text-xs text-ink-soft">Add <strong>{formatINR(toFree)}</strong> more for free shipping</p>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ivory-2"><div className="h-full bg-gold transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / business.shipping.freeAbove) * 100)}%` }} /></div>
                    </div>
                  ) : <p className="mb-4 text-xs text-gold-deep">✦ You’ve unlocked free shipping</p>}
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
                    <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd>{shippingAtCheckout ? <span className="text-ink-soft">Calculated at checkout</span> : shippingFee ? formatINR(shippingFee) : 'Free'}</dd></div>
                    <div className="flex justify-between border-t border-ivory-2 pt-2 font-display text-xl"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
                  </dl>
                  <button className="btn btn-gold mt-5 w-full" disabled={handing} onClick={async () => {
                    if (!IS_SHOPIFY) { uiStore.closeCart(); nav('/checkout'); return }
                    if (handing) return
                    setHanding(true)
                    try { while (cartPending() > 0) await cartSettled() } finally { /* hand off even if a sync failed: Shopify's cart is what it is */ }
                    if (shopCartCount() === 0) { setHanding(false); toast('The store’s cart came back empty — please add your items again', 'err'); return }
                    goToCheckout()
                  }}>{handing ? 'Opening checkout…' : 'Checkout securely'}</button>
                  <a className="mt-3 block text-center text-xs text-ink-soft underline-offset-4 hover:text-gold-deep hover:underline" href={whatsappLink(waText)} target="_blank" rel="noreferrer">or order on WhatsApp</a>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
