import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { bySlug } from '../../shared/products'
import { formatINR } from '../../shared/config'
import { uiStore, useCart, useUI } from '../lib/cart'
import { tinCut, HeatDots } from './ProductCard'
import { AddControl } from './AddControl'
import { EASE } from '../lib/motion'

export function QuickView() {
  const { quickView } = useUI()
  const { count } = useCart()
  const p = quickView ? bySlug(quickView) : undefined
  useEffect(() => {
    if (!p) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') uiStore.quickView(null) }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [p])

  return (
    <AnimatePresence>
      {p && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[75] flex items-end justify-center bg-night/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => uiStore.quickView(null)}>
          <motion.div initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${p.name} quick view`}
            className="grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-ivory text-ink shadow-2xl sm:grid-cols-2 sm:rounded-3xl">
            <div className="relative flex items-center justify-center p-8" style={{ background: `radial-gradient(80% 60% at 50% 100%, ${p.hex}44 0%, transparent 70%), linear-gradient(180deg,#FAF6EE,#EFE7D6)` }}>
              <img src={tinCut(p)} alt={p.name} className="h-[360px] w-auto drop-shadow-[0_40px_40px_rgba(15,26,48,.3)] sm:h-[420px]" />
              <span className="kicker absolute left-6 top-6">{p.kind === 'bundle' ? 'Gift box' : p.format === 'ready-to-serve' ? 'Ready to serve' : `${p.profile} · ${p.netWeight}`}</span>
            </div>
            <div className="relative flex flex-col p-7 sm:p-9">
              <button onClick={() => uiStore.quickView(null)} className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 hover:bg-night hover:text-ivory" aria-label="Close"><X size={16} /></button>
              <h3 className="pr-10 text-[38px] leading-none">{p.name}</h3>
              <p className="mt-2 font-display text-xl italic text-ink-soft">{p.tagline}</p>
              <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{p.description}</p>
              <p className="mt-3 text-[14px] text-ink-soft"><span className="kicker mr-2 !text-[9px]">Pairs with</span>{p.pairing}</p>
              <ul className="mt-5 flex flex-wrap gap-2">{p.badges.map((b) => <li key={b} className="rounded-full border border-gold/50 px-3 py-1 text-[11px] uppercase tracking-[.15em] text-gold-deep">{b}</li>)}</ul>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted"><HeatDots n={p.spice} />{p.ingredientHint}{p.allergens ? ` · ${p.allergens}` : ''}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-ivory-2 pt-6">
                <p className="font-display text-3xl">{formatINR(p.price)}</p>
                <AddControl slug={p.slug} size="lg" label="Add to cart" />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[.2em] text-ink-soft">
                <Link to={`/product/${p.slug}`} onClick={() => uiStore.quickView(null)} className="underline-offset-4 hover:text-gold-deep hover:underline">Full details →</Link>
                {count > 0 && <button onClick={() => { uiStore.quickView(null); uiStore.openCart() }} className="flex items-center gap-1.5 hover:text-gold-deep"><ShoppingBag size={13} /> View cart ({count})</button>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
