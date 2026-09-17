import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Droplet, Leaf, Sparkles, WheatOff } from 'lucide-react'
import { PondScene, WaveDivider } from '../components/MithilaArt'
import { business } from '../../shared/config'
import { asset } from '../lib/env'
import { EASE } from '../lib/motion'

const BADGES = [
  { icon: Droplet, label: 'Roasted in olive oil' },
  { icon: WheatOff, label: 'Gluten free' },
  { icon: Leaf, label: 'No added preservatives' },
  { icon: Sparkles, label: 'Rich in protein' },
]
// three tins from the 17-Sep lineup; heights are capped so the render never upscales past ~1.15×
const TINS = [
  { slug: 'mint-royale', cls: 'left-[3%] bottom-[7%] h-[58%] max-h-[330px] z-10', delay: 0.35, float: '8s' },
  { slug: 'divine-salt-pepper', cls: 'left-1/2 -translate-x-1/2 bottom-[11%] h-[70%] max-h-[400px] z-20', delay: 0.15, float: '9s' },
  { slug: 'jaggery-heritage', cls: 'right-[3%] bottom-[5%] h-[60%] max-h-[340px] z-10', delay: 0.5, float: '7.5s' },
]

export function Hero() {
  const sec = useRef<HTMLElement>(null)
  const lantern = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent) => {
    const el = sec.current, l = lantern.current; if (!el || !l) return
    const r = el.getBoundingClientRect()
    l.style.setProperty('--lx', `${((e.clientX - r.left) / r.width) * 100}%`); l.style.setProperty('--ly', `${((e.clientY - r.top) / r.height) * 100}%`)
    l.classList.add('on')
  }
  return (
    <section id="top" ref={sec} onMouseMove={onMove} onMouseLeave={() => lantern.current?.classList.remove('on')} className="relative overflow-hidden bg-night text-ivory grain">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_40%,rgba(201,168,103,.14),transparent_70%)]" />
      <PondScene opacity={0.5} />
      <div ref={lantern} className="lantern" aria-hidden />
      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-5 pb-24 pt-28 sm:px-8 lg:grid-cols-12 lg:pt-24">
        <div className="relative z-10 lg:col-span-6">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }} className="kicker">{business.promise}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }} className="mt-6 text-balance text-[clamp(46px,7.2vw,96px)] leading-[0.98]">
            Rooted in Mithila.<br /><em className="gold-text font-normal italic">Crafted for today.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.38 }} className="mt-7 max-w-lg text-[17px] leading-relaxed text-ivory/72 sm:text-lg">
            A timeless superfood from the ponds of Mithila, roasted in olive oil and seasoned with honest ingredients — thirteen flavours, one midnight-blue tin.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.52 }} className="mt-10 flex flex-wrap gap-3">
            <Link to="/#collection" className="btn btn-gold">Shop the collection</Link>
            <Link to="/#story" className="btn btn-outline-gold">Our story</Link>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {BADGES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-[12px] uppercase tracking-[.14em] text-ivory/70">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold"><Icon size={15} strokeWidth={1.5} /></span>{label}
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="relative h-[420px] sm:h-[500px] lg:col-span-6 lg:h-[600px]">
          <div className="absolute left-1/2 top-[72%] h-36 w-[80%] -translate-x-1/2 rounded-[100%] bg-gold/20 blur-3xl" />
          {TINS.map((t) => (
            <motion.div key={t.slug} initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.3, ease: EASE, delay: t.delay }} className={`absolute ${t.cls}`}>
              <img src={asset(`/img/tins/${t.slug}.png`)} alt="" width={220} height={376} className="animate-float h-full w-auto drop-shadow-[0_50px_60px_rgba(0,0,0,.55)]" style={{ animationDuration: t.float, animationDelay: `${t.delay}s` }} fetchPriority="high" />
            </motion.div>
          ))}
        </div>
      </div>
      <motion.a href="#collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[.3em] text-ivory/50 hover:text-gold lg:flex [@media(max-height:780px)]:!hidden" aria-label="Scroll to the collection">
        Scroll<span className="relative block h-10 w-px overflow-hidden bg-ivory/20"><span className="absolute inset-x-0 top-0 h-4 w-px bg-gold" style={{ animation: 'cue 1.8s ease-in-out infinite' }} /></span>
      </motion.a>
      <div className="absolute inset-x-0 bottom-0"><WaveDivider fill="var(--color-ivory)" /></div>
    </section>
  )
}
