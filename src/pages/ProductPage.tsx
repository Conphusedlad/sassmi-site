import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Minus, Plus } from 'lucide-react'
import { bySlug, tins } from '../../shared/products'
import { business, formatINR } from '../../shared/config'
import { cart, uiStore } from '../lib/cart'
import { toast } from '../lib/toast'
import { tinCut, ProductCard } from '../components/ProductCard'
import { PondScene } from '../components/MithilaArt'
import { Container } from '../components/ui/Section'
import { Reviews } from '../sections/Reviews'
import { EASE } from '../lib/motion'
import NotFound from './NotFound'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const p = bySlug(slug)
  const [qty, setQty] = useState(1)
  useEffect(() => { if (p) document.title = `${p.name} — Sassmi Premium Makhana`; return () => { document.title = 'Sassmi — Premium Makhana, Rooted in Mithila' } }, [p])
  if (!p) return <NotFound />
  const others = tins.filter((t) => t.slug !== p.slug).slice(0, 4)
  const spice = ['No heat', 'Mild', 'Medium', 'Hot'][p.spice]

  return (
    <>
      <section className="relative overflow-hidden bg-night pt-24 text-ivory">
        <PondScene opacity={0.3} />
        <Container className="relative grid gap-10 pb-16 pt-8 lg:grid-cols-12 lg:pb-24">
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[.2em] text-ivory/50 lg:col-span-12" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gold">Home</Link><ChevronRight size={12} /><Link to="/#collection" className="hover:text-gold">Collection</Link><ChevronRight size={12} /><span className="text-ivory/80">{p.name}</span>
          </nav>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE }} className="relative flex items-center justify-center lg:col-span-6">
            <div className="absolute h-64 w-[70%] rounded-[100%] blur-3xl" style={{ background: `${p.hex}AA` }} />
            <img src={tinCut(p)} alt={`${p.name} — Sassmi premium makhana tin`} className="animate-float relative h-[420px] w-auto drop-shadow-[0_60px_60px_rgba(0,0,0,.6)] sm:h-[540px]" style={{ animationDuration: '9s' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.1 }} className="lg:col-span-6">
            <p className="kicker">{p.kind === 'bundle' ? 'Gift box' : `${p.profile} · ${spice}`}</p>
            <h1 className="mt-4 text-[clamp(44px,6vw,80px)] leading-[0.98]">{p.name}</h1>
            <p className="mt-3 font-display text-2xl italic text-ivory/80">{p.tagline}</p>
            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-ivory/75">{p.description}</p>
            <p className="mt-4 text-[15px] text-ivory/70"><span className="kicker mr-3 !text-[9px]">Pairs with</span>{p.pairing}</p>
            <ul className="mt-6 flex flex-wrap gap-2">{p.badges.map((b) => <li key={b} className="rounded-full border border-gold/50 px-3 py-1 text-[11px] uppercase tracking-[.15em] text-gold">{b}</li>)}</ul>
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-ivory/10 pt-8">
              <div><p className="font-display text-4xl">{formatINR(p.price)}</p><p className="text-[11px] uppercase tracking-[.15em] text-ivory/50">{p.netWeight} · incl. of all taxes</p></div>
              <div className="flex items-center rounded-full border border-ivory/20">
                <button className="flex h-11 w-11 items-center justify-center" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><Minus size={14} /></button>
                <span className="w-8 text-center">{qty}</span>
                <button className="flex h-11 w-11 items-center justify-center" onClick={() => setQty((q) => Math.min(12, q + 1))} aria-label="Increase"><Plus size={14} /></button>
              </div>
              <button className="btn btn-gold" onClick={() => { cart.add(p.slug, qty); toast(`${p.name} × ${qty} added`); uiStore.openCart() }}>Add to cart</button>
            </div>
            <p className="mt-4 text-xs text-ivory/50">Dispatch in 1–2 working days · Free shipping above {formatINR(business.shipping.freeAbove)}</p>
          </motion.div>
        </Container>
      </section>

      <section className="bg-ivory py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="kicker">What’s inside</p>
            <h2 className="mt-3 text-4xl">Ingredients & declarations</h2>
            <dl className="mt-8 grid gap-x-8 gap-y-5 text-[15px] sm:grid-cols-2">
              <div><dt className="text-[11px] uppercase tracking-[.2em] text-muted">Ingredients</dt><dd className="mt-1 text-ink-soft">Makhana (fox nut), olive oil, {p.ingredientHint.replace(/^With /i, '').toLowerCase()}. <span className="text-muted">Full list on pack.</span></dd></div>
              <div><dt className="text-[11px] uppercase tracking-[.2em] text-muted">Allergen advice</dt><dd className="mt-1 text-ink-soft">Processed in a facility that also handles tree nuts and milk. {['cream-onion', 'honey-cheese', 'dry-fruits-kheer'].includes(p.slug) ? 'Contains milk solids. ' : ''}{p.slug === 'dry-fruits-kheer' ? 'Contains tree nuts (almond, pistachio). ' : ''}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-[.2em] text-muted">Net quantity</dt><dd className="mt-1 text-ink-soft">{p.netWeight}</dd></div>
              <div><dt className="text-[11px] uppercase tracking-[.2em] text-muted">MRP</dt><dd className="mt-1 text-ink-soft">{formatINR(p.price)} (inclusive of all taxes)</dd></div>
              <div><dt className="text-[11px] uppercase tracking-[.2em] text-muted">Best before</dt><dd className="mt-1 text-ink-soft">Printed on the base of each tin. Store cool, dry and away from sunlight; keep lid tightly closed.</dd></div>
              <div><dt className="text-[11px] uppercase tracking-[.2em] text-muted">Country of origin</dt><dd className="mt-1 text-ink-soft">India</dd></div>
              <div className="sm:col-span-2"><dt className="text-[11px] uppercase tracking-[.2em] text-muted">Manufactured & marketed by</dt><dd className="mt-1 text-ink-soft">{business.operator.name}, {business.operator.address}. FSSAI Lic. No. {business.operator.fssai}. Customer care: {business.contact.phoneDisplay} · {business.contact.email}</dd></div>
              <div className="sm:col-span-2"><dt className="text-[11px] uppercase tracking-[.2em] text-muted">Veg / Non-veg</dt><dd className="mt-1 flex items-center gap-2 text-ink-soft"><span className="inline-flex h-4 w-4 items-center justify-center border border-green-700"><span className="h-2 w-2 rounded-full bg-green-700" /></span> Vegetarian</dd></div>
            </dl>
          </div>
          <aside className="rounded-3xl bg-cream p-8 shadow-card lg:col-span-5">
            <p className="kicker">Flavour profile</p>
            <div className="mt-5 space-y-4 text-sm">
              <div><div className="flex justify-between"><span>Heat</span><span className="text-muted">{spice}</span></div><div className="mt-1.5 h-1.5 rounded-full bg-ivory-2"><div className="h-full rounded-full bg-gold" style={{ width: `${(p.spice / 3) * 100}%` }} /></div></div>
              <div><div className="flex justify-between"><span>Sweetness</span><span className="text-muted">{p.profile === 'sweet' ? 'Pronounced' : p.profile === 'spicy' ? 'A hint' : 'Low'}</span></div><div className="mt-1.5 h-1.5 rounded-full bg-ivory-2"><div className="h-full rounded-full bg-gold" style={{ width: p.profile === 'sweet' ? '80%' : p.profile === 'spicy' ? '35%' : '15%' }} /></div></div>
              <div><div className="flex justify-between"><span>Crunch</span><span className="text-muted">Always</span></div><div className="mt-1.5 h-1.5 rounded-full bg-ivory-2"><div className="h-full w-full rounded-full bg-gold" /></div></div>
            </div>
            <div className="mt-8 h-24 rounded-2xl" style={{ background: `linear-gradient(135deg, ${p.hex}, ${p.accent})` }} />
            <p className="mt-3 text-xs text-muted">Tin colour · The Mithila Nocturne collection</p>
          </aside>
        </Container>
      </section>

      <Reviews productSlug={p.slug} />

      <section className="bg-ivory py-20">
        <Container>
          <p className="kicker text-center">Keep exploring</p>
          <h2 className="mt-3 text-center text-4xl">You may also like</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{others.map((o, i) => <ProductCard key={o.slug} p={o} index={i} />)}</div>
        </Container>
      </section>
    </>
  )
}
