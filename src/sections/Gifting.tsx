import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gift, Building2 } from 'lucide-react'
import { PondScene } from '../components/MithilaArt'
import { Container } from '../components/ui/Section'
import { asset } from '../lib/env'
import { contactStore } from '../lib/contact'
import { fadeUp } from '../lib/motion'
import { cart, uiStore } from '../lib/cart'
import { toast } from '../lib/toast'

export function Gifting() {
  return (
    <section id="gifting" className="relative scroll-mt-20 overflow-hidden bg-night py-24 text-ivory grain sm:py-32">
      <PondScene opacity={0.35} />
      <Container className="relative grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <motion.p {...fadeUp()} className="kicker">Diwali & corporate gifting</motion.p>
          <motion.h2 {...fadeUp(0.05)} className="mt-4 text-balance text-[clamp(36px,5vw,64px)] text-ivory">This season, gift the pond.</motion.h2>
          <motion.p {...fadeUp(0.1)} className="mt-6 max-w-lg text-[17px] leading-relaxed text-ivory/72">
            The Nocturne Trio: any three flavours in an indigo box with a gold ribbon and a hand-written card. For teams, clients and the relatives who already have enough dry fruit — we also build custom boxes from twenty pieces upward, with your logo on the card.
          </motion.p>
          <motion.div {...fadeUp(0.15)} className="mt-9 flex flex-wrap gap-3">
            <button className="btn btn-gold" onClick={() => { cart.add('nocturne-trio'); toast('The Nocturne Trio added to your cart'); uiStore.openCart() }}><Gift size={15} /> Add the Trio · ₹699</button>
            <Link to="/#contact" onClick={() => contactStore.prefill('Bulk & corporate gifting')} className="btn btn-outline-gold"><Building2 size={15} /> Corporate enquiry</Link>
          </motion.div>
          <motion.ul {...fadeUp(0.2)} className="mt-10 grid gap-3 text-sm text-ivory/70 sm:grid-cols-3">
            <li className="border-l border-gold/50 pl-4">Custom boxes from 20 pieces</li>
            <li className="border-l border-gold/50 pl-4">Your logo on the card</li>
            <li className="border-l border-gold/50 pl-4">Delhi NCR delivery in 48 hours*</li>
          </motion.ul>
          <p className="mt-3 text-[11px] text-ivory/40">*Subject to order size and stock. Diwali orders close two weeks before the festival.</p>
        </div>
        <motion.div {...fadeUp(0.1)} className="relative lg:col-span-6">
          <div className="overflow-hidden rounded-3xl border border-gold/20 shadow-tin">
            <img src={asset('/img/art/lineup.webp')} alt="The nine Sassmi tins" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="absolute -bottom-6 left-6 rounded-2xl bg-ivory px-6 py-4 text-ink shadow-card">
            <p className="kicker !text-gold-deep">The Nocturne Trio</p>
            <p className="font-display text-2xl">Three tins · ₹699</p>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
