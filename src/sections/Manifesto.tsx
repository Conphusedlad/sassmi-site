import { motion } from 'framer-motion'
import { Ripples } from '../components/MithilaArt'
import { Container } from '../components/ui/Section'
import { fadeUp } from '../lib/motion'

const WORDS = ['Roasted, not fried', 'Gluten free', 'No added preservatives', 'Rich in protein', 'Sourced from Mithila', 'Roasted in small batches', 'Roasted in olive oil', 'Simple ingredients']

export function Manifesto() {
  return (
    <section className="relative overflow-hidden bg-night py-20 text-ivory sm:py-28">
      <Ripples className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-gold opacity-20" rows={3} />
      <Container className="relative">
        <motion.blockquote {...fadeUp()} className="mx-auto max-w-4xl text-center">
          <p className="text-balance font-display text-[clamp(30px,4.4vw,58px)] font-normal italic leading-[1.15] text-ivory/95">
            “Simple ingredients. Real flavours. <span className="gold-text not-italic">A happier you.</span>”
          </p>
          <footer className="kicker mt-8">Inspired by nature · Enriched by tradition · Made for a better you</footer>
        </motion.blockquote>
      </Container>
      <div className="mt-16 overflow-hidden border-y border-gold/20 py-4">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-[12px] uppercase tracking-[.3em] text-gold/80">
          {[...WORDS, ...WORDS].map((w, i) => <span key={i} className="flex items-center gap-10">{w}<span className="text-[8px] text-gold/50">◆</span></span>)}
        </div>
      </div>
    </section>
  )
}
