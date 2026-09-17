import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Store } from 'lucide-react'
import { business, formatINR, whatsappLink } from '../../shared/config'
import { Container } from '../components/ui/Section'
import { asset } from '../lib/env'
import { fadeUp } from '../lib/motion'

/**
 * Crunchy Makhana — the family's everyday value brand (identity is fixed: red starburst + gold wordmark).
 * Rendered as a deliberate visual shift from the Nocturne world.
 */
export function Crunchy({ standalone = false }: { standalone?: boolean }) {
  const c = business.crunchy
  return (
    <section id="crunchy" className={`relative scroll-mt-20 overflow-hidden bg-crunchy-red text-ivory ${standalone ? 'pt-32 pb-24' : 'py-24 sm:py-32'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,rgba(255,120,120,.35),transparent_70%)]" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg at 50% 45%, rgba(255,255,255,.10) 0 4deg, transparent 4deg 10deg)' }} />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <motion.div {...fadeUp()} className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl shadow-tin ring-1 ring-white/20">
              <img src={asset('/img/crunchy/pack-hero.webp')} alt="Crunchy Makhana Peri Peri pouch" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </motion.div>
          <div className="lg:col-span-7">
            <motion.p {...fadeUp()} className="kicker !text-crunchy-gold">Also from our family · now a SASSMI Global brand</motion.p>
            <motion.div {...fadeUp(0.05)} className="mt-5 inline-block rounded-2xl bg-crunchy-deep/60 p-4 ring-1 ring-crunchy-gold/40">
              <img src={asset('/img/crunchy/logo-tile.webp')} alt="Crunchy Makhana — Snack Smart, Live Better!" className="h-24 w-auto rounded-lg sm:h-28" loading="lazy" />
            </motion.div>
            <motion.h2 {...fadeUp(0.1)} className="mt-6 text-balance text-[clamp(34px,4.6vw,58px)] text-ivory">The everyday range. The same makhana, in a ₹20 pouch.</motion.h2>
            <motion.p {...fadeUp(0.15)} className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-ivory/85">
              Before the midnight tin there was the red pouch. Crunchy Makhana is our value brand — roasted the same way, seasoned with the same in-house blends, and sold at kirana stores and general trade across Delhi NCR in six flavours and four pack sizes. Tagline says it all: <em>“{c.tagline}”</em>
            </motion.p>
            <motion.ul {...fadeUp(0.2)} className="mt-7 flex flex-wrap gap-2">
              {c.flavours.map((f) => <li key={f.name} className="rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[.15em] text-white ring-1 ring-white/25" style={{ background: f.hex }}>{f.name}</li>)}
            </motion.ul>
            <motion.div {...fadeUp(0.25)} className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {c.sizes.map((s) => (
                <div key={s.grams} className="rounded-2xl bg-white/10 p-4 text-center ring-1 ring-white/15 backdrop-blur-sm">
                  <p className="font-display text-3xl text-crunchy-gold">{formatINR(s.price)}</p>
                  <p className="text-[11px] uppercase tracking-[.2em] text-ivory/80">{s.grams} g pouch</p>
                </div>
              ))}
            </motion.div>
            <motion.div {...fadeUp(0.3)} className="mt-9 flex flex-wrap gap-3">
              <a href={c.website} target="_blank" rel="noreferrer" className="btn bg-crunchy-gold text-crunchy-deep hover:bg-[#FFD65A]"><ArrowUpRight size={15} /> crunchymakhana.in</a>
              <Link to="/#contact" state={{ topic: 'Distributor enquiry' }} className="btn border-white/40 text-ivory hover:bg-white/10"><Store size={15} /> Become a distributor</Link>
              <a href={whatsappLink('Hi! I run a store in Delhi NCR and would like to stock Crunchy Makhana.')} target="_blank" rel="noreferrer" className="btn border-white/40 text-ivory hover:bg-white/10">Stock it in your store</a>
            </motion.div>
            <p className="mt-6 text-xs text-ivory/60">Instagram <a className="underline underline-offset-4 hover:text-crunchy-gold" href={c.instagram} target="_blank" rel="noreferrer">@crunchy_makhana</a> · Distributor orders via WhatsApp {business.contact.phoneDisplay} · Crunchy helpline {c.phoneDisplay}</p>
          </div>
        </div>
        <motion.div {...fadeUp(0.2)} className="mt-14 overflow-hidden rounded-3xl ring-1 ring-white/20">
          <img src={asset('/img/crunchy/six-packs.webp')} alt="The six Crunchy Makhana flavours" className="w-full object-cover" loading="lazy" />
        </motion.div>
      </Container>
    </section>
  )
}
