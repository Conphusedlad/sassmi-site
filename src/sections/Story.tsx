import { motion } from 'framer-motion'
import { Lotus, LotusLeaf } from '../components/MithilaArt'
import { Container } from '../components/ui/Section'
import { asset } from '../lib/env'
import { fadeUp } from '../lib/motion'

export function Story() {
  return (
    <section id="story" className="scroll-mt-20 overflow-hidden bg-cream py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <motion.div {...fadeUp()} className="relative lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-night shadow-tin">
              <img src={asset('/img/art/nocturne-board.webp')} alt="The Mithila Nocturne design — indigo tin with gold lotus and fish line art" className="absolute inset-0 h-full w-full object-cover opacity-90" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-ivory">
                <p className="kicker">The Mithila Nocturne</p>
                <p className="mt-2 font-display text-2xl italic text-ivory/90">Midnight indigo, champagne gold, and the pond at night.</p>
              </div>
            </div>
            <img src={asset('/img/art/lotus.webp')} alt="" className="absolute -bottom-10 -left-8 w-44 opacity-90 drop-shadow-xl sm:w-56" loading="lazy" aria-hidden />
            <Lotus className="absolute -right-6 -top-6 w-28 text-gold opacity-70" />
          </motion.div>

          <div className="lg:col-span-6">
            <motion.p {...fadeUp()} className="kicker">Our story</motion.p>
            <motion.h2 {...fadeUp(0.05)} className="mt-4 text-balance text-[clamp(34px,4.6vw,58px)]">From the ponds of Mithila to a midnight tin.</motion.h2>
            <motion.div {...fadeUp(0.1)} className="mt-7 space-y-5 text-[16.5px] leading-relaxed text-ink-soft">
              <p>Makhana begins underwater. In the ponds of Mithila — the land between the Ganga and the Himalayan foothills in north Bihar — lotus seeds are gathered from the pond bed, sun-dried, and popped over heat the way it has been done there for generations. It is one of the oldest snack traditions in India, and one of the most patient.</p>
              <p>Our family is from Mithila. Sassmi is our way of bringing the pond to the city without losing what made it special: plump, evenly-popped kernels; a slow roast in olive oil rather than a deep fry; and seasonings made from ingredients you can name.</p>
              <p>Every tin is roasted in small batches at our own facility in Todapur, New Delhi, graded for size and sealed for freshness. Nothing in it is there to make it last longer — only to make it taste better.</p>
            </motion.div>
            <motion.blockquote {...fadeUp(0.15)} className="mt-8 border-l-2 border-gold pl-6 font-display text-2xl italic text-ink">
              “Rooted in Mithila. Crafted for today.”
            </motion.blockquote>
            <LotusLeaf className="mt-10 w-24 text-gold/60" />
          </div>
        </div>
      </Container>
    </section>
  )
}
