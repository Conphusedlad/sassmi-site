import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { bySlug } from '../../shared/products'
import { cart, MAX_QTY, useCart } from '../lib/cart'
import { toast } from '../lib/toast'
import { EASE } from '../lib/motion'
import { STORE_OPEN } from '../../shared/config'
import { AskWhatsApp } from './ComingSoon'

type Props = { slug: string; size?: 'sm' | 'lg'; tone?: 'night' | 'gold'; label?: string; className?: string; step?: number }

/**
 * One control for every "add to cart" moment. Shows "Add" until the item is in the cart,
 * then turns into a − qty + stepper that mirrors the cart exactly. Never opens the drawer.
 */
export function AddControl(props: Props) {
  // store closed: every add-to-cart becomes a WhatsApp enquiry about that product
  if (!STORE_OPEN) return <AskWhatsApp what={bySlug(props.slug)?.name} size={props.size} tone={props.tone} className={props.className} />
  return <CartControl {...props} />
}

function CartControl({ slug, size = 'sm', tone = 'night', label = 'Add', className = '', step = 1 }: Props) {
  const { items } = useCart()
  const qty = items.find((i) => i.slug === slug)?.qty ?? 0
  const p = bySlug(slug)
  const h = size === 'lg' ? 'h-12' : 'h-10'
  const toneCls = tone === 'gold' ? 'bg-gold text-night hover:bg-gold-light' : 'bg-night text-ivory hover:bg-gold hover:text-night'
  const add = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); cart.add(slug, step); if (p) toast(`${p.name} added to your cart`) }

  return (
    <div className={`relative inline-flex ${className}`} onClick={(e) => e.stopPropagation()}>
      <AnimatePresence mode="wait" initial={false}>
        {qty === 0 ? (
          <motion.button key="add" type="button" onClick={add} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25, ease: EASE }}
            className={`${h} flex items-center gap-2 rounded-full px-5 text-[11px] font-medium uppercase tracking-[.2em] transition-colors ${toneCls} ${size === 'lg' ? 'px-7 text-[12px]' : ''}`}>
            <Plus size={size === 'lg' ? 15 : 14} /> {label}
          </motion.button>
        ) : (
          <motion.div key="stepper" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25, ease: EASE }}
            className={`${h} flex items-center rounded-full border ${tone === 'gold' ? 'border-gold bg-gold text-night' : 'border-night bg-night text-ivory'}`} role="group" aria-label={`${p?.name ?? 'Item'} quantity`}>
            <button type="button" className={`flex ${h} w-10 items-center justify-center rounded-l-full transition hover:bg-white/15`} onClick={(e) => { e.preventDefault(); cart.setQty(slug, qty - step) }} aria-label="Decrease quantity"><Minus size={14} /></button>
            <motion.span key={qty} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }} className="w-7 text-center font-display text-lg leading-none tabular-nums">{qty}</motion.span>
            <button type="button" className={`flex ${h} w-10 items-center justify-center rounded-r-full transition hover:bg-white/15 ${qty >= MAX_QTY ? 'opacity-40' : ''}`} aria-disabled={qty >= MAX_QTY} onClick={(e) => { e.preventDefault(); if (qty >= MAX_QTY) { toast(`Maximum ${MAX_QTY} per item — for more, use the corporate enquiry.`, 'err'); return } cart.setQty(slug, qty + step) }} aria-label="Increase quantity"><Plus size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
