import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Container, SectionHead } from '../components/ui/Section'
import { business } from '../../shared/config'
import { EASE } from '../lib/motion'

const QA = [
  { q: 'What exactly is makhana?', a: 'Makhana (fox nut, or popped lotus seed) is the seed of the prickly water lily, grown in ponds — most famously in the Mithila region of Bihar. The seeds are harvested, dried and popped over heat into light, crunchy puffs. It has been eaten in India for centuries, especially during fasts.' },
  { q: 'Is it fried?', a: 'No. Sassmi makhana is slow-roasted in small batches in olive oil over gentle heat, then tumbled with seasoning. Nothing is deep-fried.' },
  { q: 'Does it contain allergens?', a: 'Some flavours contain milk solids (Cream & Onion, Honey Cheese, Dry Fruits Kheer) and tree nuts (Dry Fruits Kheer). All tins are produced in a facility that handles nuts and dairy, so traces are possible. Full ingredient lists are printed on every tin and on each product page.' },
  { q: 'How long does a tin stay fresh?', a: 'Sealed, several months — the exact best-before date is printed on the base of each tin. Once opened, keep the lid tightly closed and finish within two to three weeks for the best crunch. Store in a cool, dry place away from sunlight.' },
  { q: 'How fast do you ship?', a: `We dispatch within 1–2 working days and delivery usually takes ${business.shipping.etaDays} across India. Shipping is free on orders above ₹${business.shipping.freeAbove}; below that a flat ₹${business.shipping.flatFee} applies.` },
  { q: 'Do you accept cash on delivery?', a: business.shipping.codAvailable ? 'Yes, cash on delivery is available at checkout.' : 'Not yet. We accept UPI, cards, net-banking and wallets through Razorpay. You can also order over WhatsApp.' },
  { q: 'Can I order in bulk or for corporate gifting?', a: 'Yes — from twenty boxes upward we build custom gift boxes, with your logo on the card. Use the corporate enquiry option in the contact form or WhatsApp us, and tell us the quantity and the date you need them by.' },
  { q: 'Where is Sassmi made?', a: `Sassmi is roasted and packed at our own FSSAI-licensed facility in Todapur, New Delhi (Lic. No. ${business.operator.fssai}), from makhana sourced in Mithila, Bihar.` },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
      <Container className="max-w-4xl">
        <SectionHead kicker="Questions" title="Good questions, honest answers." />
        <div className="mt-12 divide-y divide-ivory-2 border-y border-ivory-2">
          {QA.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q}>
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="font-display text-2xl leading-tight">{item.q}</span>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-transform duration-500 ${isOpen ? 'rotate-45 bg-night text-ivory' : ''}`}><Plus size={16} /></span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                      <p className="pb-7 pr-12 text-[15.5px] leading-relaxed text-ink-soft">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
