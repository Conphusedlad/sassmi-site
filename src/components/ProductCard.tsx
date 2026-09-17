import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Product } from '../../shared/products'
import { formatINR } from '../../shared/config'
import { cart, uiStore } from '../lib/cart'
import { toast } from '../lib/toast'
import { asset } from '../lib/env'
import { EASE } from '../lib/motion'

export function tinCut(p: Product) { return asset(p.kind === 'tin' ? `/img/tins-cut/${p.slug}.png` : p.image) }

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const add = (e: React.MouseEvent) => { e.preventDefault(); cart.add(p.slug); toast(`${p.name} added to your cart`) }
  return (
    <motion.article initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.8, ease: EASE, delay: (index % 3) * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ivory-2 bg-cream shadow-card transition-shadow duration-500 hover:shadow-tin">
      <button onClick={() => uiStore.quickView(p.slug)} className="relative block aspect-[4/5] w-full overflow-hidden" aria-label={`Quick view ${p.name}`}
        style={{ background: `radial-gradient(90% 70% at 50% 100%, ${p.hex}22 0%, transparent 65%), linear-gradient(180deg, #FAF6EE 0%, #F1EADB 100%)` }}>
        <img src={tinCut(p)} alt={`${p.name} tin`} loading="lazy" className="absolute left-1/2 top-[6%] h-[88%] w-auto -translate-x-1/2 drop-shadow-[0_28px_30px_rgba(15,26,48,.28)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2 group-hover:scale-[1.04]" />
        <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[.2em] text-ivory" style={{ background: p.hex }}>{p.kind === 'bundle' ? 'Gift box' : p.profile}</span>
        <span className="absolute inset-x-0 bottom-0 translate-y-full bg-night/85 py-2.5 text-center text-[11px] uppercase tracking-[.22em] text-ivory backdrop-blur transition-transform duration-500 group-hover:translate-y-0">Quick view</span>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[26px] leading-none"><Link to={`/product/${p.slug}`} className="hover:text-gold-deep">{p.name}</Link></h3>
            <p className="mt-1.5 font-display text-[15px] italic text-ink-soft">{p.tagline}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl">{formatINR(p.price)}</p>
            <p className="text-[11px] uppercase tracking-[.15em] text-muted">{p.netWeight}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-ivory-2 pt-4">
          <span className="text-[12px] text-muted">{p.ingredientHint}</span>
          <button onClick={add} className="flex h-10 items-center gap-2 rounded-full bg-night px-4 text-[11px] font-medium uppercase tracking-[.2em] text-ivory transition hover:bg-gold hover:text-night"><Plus size={14} /> Add</button>
        </div>
      </div>
    </motion.article>
  )
}
