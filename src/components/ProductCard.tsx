import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { productImage, type Product } from '../../shared/products'
import { formatINR } from '../../shared/config'
import { uiStore } from '../lib/cart'
import { asset } from '../lib/env'
import { fadeUp } from '../lib/motion'
import { AddControl } from './AddControl'

export const tinCut = (p: Product) => asset(productImage(p))

export function HeatDots({ n }: { n: number }) {
  if (n === 0) return null
  return <span className="inline-flex items-center gap-0.5 text-crunchy-red" aria-label={`Heat level ${n} of 3`}>{[1, 2, 3].map((i) => <Flame key={i} size={11} className={i <= n ? 'fill-current' : 'opacity-25'} />)}</span>
}

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  // subtle 3-D tilt on pointer devices
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el || !window.matchMedia('(hover:hover)').matches) return
    const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`); el.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${(x * 100 + 50).toFixed(1)}%`); el.style.setProperty('--gy', `${(y * 100 + 50).toFixed(1)}%`)
  }
  const onLeave = () => { const el = ref.current; if (!el) return; el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg') }

  return (
    <motion.article {...fadeUp((index % 3) * 0.08)} className="group">
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="tilt relative flex h-full flex-col overflow-hidden rounded-2xl border border-ivory-2 bg-cream shadow-card transition-shadow duration-500 hover:shadow-tin">
      <button onClick={() => uiStore.quickView(p.slug)} className="relative block aspect-[4/5] w-full overflow-hidden" aria-label={`Quick view ${p.name}`}
        style={{ background: `radial-gradient(90% 70% at 50% 100%, ${p.hex}26 0%, transparent 65%), linear-gradient(180deg, #FAF6EE 0%, #F1EADB 100%)` }}>
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(240px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.55), transparent 60%)' }} aria-hidden />
        {p.kind === 'bundle' ? (
          <img src={tinCut(p)} alt={p.name} loading="lazy" className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] rounded-xl object-cover shadow-card transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" />
        ) : (
          <img src={tinCut(p)} alt={`${p.name} tin`} loading="lazy" width={220} height={376}
            className="absolute left-1/2 top-[7%] h-[86%] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_28px_30px_rgba(15,26,48,.28)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2 group-hover:scale-[1.04]" />
        )}
        <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[.2em] text-ivory" style={{ background: p.hex }}>{p.kind === 'bundle' ? 'Gift box' : p.format === 'ready-to-serve' ? 'Ready to serve' : p.profile}</span>
        <span className="absolute inset-x-0 bottom-0 translate-y-full bg-night/85 py-2.5 text-center text-[11px] uppercase tracking-[.22em] text-ivory backdrop-blur transition-transform duration-500 group-hover:translate-y-0">Quick view</span>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[25px] leading-none"><Link to={`/product/${p.slug}`} className="hover:text-gold-deep">{p.name}</Link></h3>
            <p className="mt-1.5 font-display text-[15px] italic text-ink-soft">{p.tagline}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-xl">{formatINR(p.price)}</p>
            <p className="text-[11px] uppercase tracking-[.15em] text-muted">{p.netWeight}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-ivory-2 pt-4">
          <span className="flex min-w-0 items-center gap-2 text-[12px] text-muted"><HeatDots n={p.spice} /><span className="truncate">{p.ingredientHint}</span></span>
          <AddControl slug={p.slug} />
        </div>
      </div>
    </div>
    </motion.article>
  )
}
