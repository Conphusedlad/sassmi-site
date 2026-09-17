import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Beaker, FlaskConical, Handshake, Lock } from 'lucide-react'
import { Container, SectionHead } from '../components/ui/Section'
import { Ripples } from '../components/MithilaArt'
import { business, whatsappLink } from '../../shared/config'
import { contactStore } from '../lib/contact'
import { fadeUp } from '../lib/motion'

const TIERS = [
  { icon: Beaker, title: 'Off-the-shelf blends', body: 'A working catalogue of savoury and sweet seasonings for roasted snacks — makhana, nuts, popcorn, chips. Peri peri, cream & onion, chilli garlic, pudina, salt & pepper, jalapeño, and sweet coatings from caramel to jaggery and cocoa.', meta: 'MOQ 25 kg · price list on request' },
  { icon: FlaskConical, title: 'Custom development', body: 'Brief → bench samples → application trials on our own roasting line → your blend, documented and repeatable. A development fee, waived against an annual supply commitment.', meta: '12-month exclusivity per custom blend · NDA both ways' },
  { icon: Handshake, title: 'Pilot-partner lab', body: 'Launching a snack? Run small batches on our roasting and packing line with label and nutrition support, before you commit to equipment of your own.', meta: 'Line time charged by the batch' },
]
const STEPS = ['Brief', 'Bench samples', 'Line trial', 'Supply']

export function FlavourWorks() {
  return (
    <section id="flavour-works" className="relative scroll-mt-20 overflow-hidden bg-night py-24 text-ivory grain sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_20%,rgba(201,168,103,.12),transparent_70%)]" />
      <Ripples className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-gold opacity-20" rows={3} speed={0.8} />
      <Container className="relative">
        <SectionHead tone="dark" kicker="Sassmi Flavour Works · B2B" title="The seasoning lab behind the tins." sub="Every Sassmi and Crunchy Makhana flavour is developed and produced in our own chef-led lab in New Delhi. We make blends for other brands too." />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {TIERS.map(({ icon: Icon, title, body, meta }, i) => (
            <motion.article key={title} {...fadeUp(i * 0.08)} className="group flex flex-col rounded-3xl border border-gold/20 bg-night-soft/60 p-8 backdrop-blur-sm transition-colors duration-500 hover:border-gold/50">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold"><Icon size={18} strokeWidth={1.5} /></span>
              <h3 className="mt-6 text-3xl text-ivory">{title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ivory/70">{body}</p>
              <p className="kicker mt-6 !text-[10px] !tracking-[.22em]">{meta}</p>
            </motion.article>
          ))}
        </div>
        <motion.div {...fadeUp(0.2)} className="mt-12 grid items-center gap-8 rounded-3xl border border-gold/15 bg-ivory/[.04] p-7 lg:grid-cols-12 sm:p-9">
          <ol className="flex flex-wrap items-center gap-3 lg:col-span-7">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className="flex items-center gap-3 rounded-full border border-gold/40 px-4 py-2 text-[11px] uppercase tracking-[.2em] text-ivory/85"><span className="font-display text-base text-gold">{i + 1}</span>{s}</span>
                {i < STEPS.length - 1 && <span className="h-px w-6 bg-gold/40" aria-hidden />}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-5 lg:justify-end">
            <Link to="/#contact" onClick={() => contactStore.prefill('Flavour Works — B2B seasonings')} className="btn btn-gold">Request the blend list</Link>
            <a href={whatsappLink('Hi, I run a snack brand and would like to talk to Sassmi Flavour Works about seasonings.')} target="_blank" rel="noreferrer" className="btn btn-outline-gold">WhatsApp {business.contact.phoneDisplay}</a>
          </div>
        </motion.div>
        <p className="mt-6 flex items-center gap-2 text-xs text-ivory/45"><Lock size={12} /> The exact Sassmi and Crunchy Makhana hero profiles are never shared. Custom blends are developed as your variants, under NDA.</p>
      </Container>
    </section>
  )
}
