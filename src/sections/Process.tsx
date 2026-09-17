import { motion } from 'framer-motion'
import { Container, SectionHead } from '../components/ui/Section'
import { asset } from '../lib/env'
import { fadeUp } from '../lib/motion'

const STEPS = [
  { n: '01', title: 'Sourced', body: 'Lotus seeds gathered from the ponds of Mithila at harvest, when the kernels are at their fullest.' },
  { n: '02', title: 'Graded', body: 'Every batch is graded for size. Only the plump, evenly-popped kernels make it into a Sassmi tin.' },
  { n: '03', title: 'Roasted', body: 'Slow-roasted in small batches in olive oil over gentle heat — never fried — then tumbled with seasoning.' },
  { n: '04', title: 'Sealed', body: 'Packed in a midnight-blue tin that keeps the crunch, with the batch and best-before date on every pack.' },
]

export function Process() {
  return (
    <section className="relative overflow-hidden bg-ivory py-24 sm:py-32">
      <img src={asset('/img/art/lotus-leaves.webp')} alt="" className="pointer-events-none absolute -right-20 -top-16 w-[380px] opacity-40 sm:w-[520px]" aria-hidden loading="lazy" />
      <Container className="relative">
        <SectionHead kicker="How a tin is made" title="Four steps. No shortcuts." align="left" />
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-ivory-2 bg-ivory-2 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} {...fadeUp(i * 0.08)} className="group bg-cream p-8 transition-colors duration-500 hover:bg-night hover:text-ivory">
              <p className="font-display text-5xl text-gold">{s.n}</p>
              <h3 className="mt-6 text-3xl">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft group-hover:text-ivory/75">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
