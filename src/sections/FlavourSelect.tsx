// The collection as a flavour-select stage: thirteen tins on the rim of one huge wheel whose top touches the
// waterline of a Mithila pond drawn in the flavour's own ink. Turning the wheel re-inks the pond; the tin at the
// top is the one on offer. Highlighting a tin opens its panel (price, stepper, link to the product page); any
// browse input or a click elsewhere closes it again.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { products, tins, productImage, type Product } from '../../shared/products'
import { formatINR, STORE_OPEN } from '../../shared/config'
import { Soon } from '../components/ComingSoon'
import { THEMES } from '../lib/flavourTheme'
import { useFlavourSelector } from '../lib/useFlavourSelector'
import { LotusLeaf, Ripples, FishLane } from '../components/MithilaArt'
import { HeroLotus } from '../components/FlavourArt'
import { AddControl } from '../components/AddControl'
import { ProductCard } from '../components/ProductCard'
import { Container } from '../components/ui/Section'
import { asset } from '../lib/env'
import { EASE, NOANIM } from '../lib/motion'

const EXIT = [0.4, 0, 1, 1] as const
const COLOUR = [0.4, 0, 0.2, 1] as const
const PITCH = 76
const STORE = 'sassmi.select'
const FLAVOURS: Product[] = tins
const HEAT = ['No heat', 'Mild', 'Medium', 'Hot']
const tin1x = (p: Product) => asset(productImage(p))
const tin2x = (p: Product) => asset(`/img/tins-2x/${p.slug}.webp`)
const groundBg = (th: { glowStrong: string; stage: string; stageDeep: string }) => `radial-gradient(70% 60% at 50% 46%, ${th.glowStrong} 0%, transparent 62%), linear-gradient(180deg, ${th.stage} 0%, ${th.stageDeep} 100%)`

function useMedia(q: string) {
  const [m, set] = useState(() => (typeof matchMedia !== 'undefined' ? matchMedia(q).matches : false))
  useEffect(() => { const mm = matchMedia(q); const f = () => set(mm.matches); mm.addEventListener('change', f); return () => mm.removeEventListener('change', f) }, [q])
  return m
}
function initialIndex() {
  try { const i = FLAVOURS.findIndex((f) => f.slug === localStorage.getItem(STORE)); return i < 0 ? 0 : i } catch { return 0 }
}

/** Vertical digit roll for the counter. */
function Roll({ value }: { value: string }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-baseline tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} className="inline-block" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.24, ease: EASE }}>{value}</motion.span>
      </AnimatePresence>
    </span>
  )
}

/** The name plate: revealed once, on rest, word by word. `part` splits it for phones. */
function Plate({ f, index, total, locked, onChoose, part = 'all' }: { f: Product; index: number; total: number; locked: boolean; onChoose: () => void; part?: 'all' | 'top' | 'facts' }) {
  const t = THEMES[f.slug]
  const words = f.name.split(' ')
  const rise = (delay: number, dy = 8) => ({ initial: { opacity: 0, y: dy }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.42, ease: EASE, delay } })
  return (
    <motion.div key={f.slug} exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: EXIT } }} className="flex flex-col items-start">
      {part !== 'facts' && <>
        <p className="kicker flex flex-wrap items-center gap-2 !text-[11px] !tracking-[.32em]"><span className="text-ivory/50">The collection</span><span className="text-ivory/30">·</span><span className="fs-ink">{f.format === 'ready-to-serve' ? 'Ready to serve' : f.profile}</span><span className="text-ivory/30">·</span><span className="text-gold"><Roll value={String(index + 1).padStart(2, '0')} /> / {String(total).padStart(2, '0')}</span></p>
        <h2 className="mt-3 font-display text-[clamp(36px,10.5vw,56px)] italic leading-[0.92] tracking-[-0.01em] text-ivory lg:text-[clamp(56px,8vw,124px)]">
          <Link to={`/product/${f.slug}`} className="transition-colors hover:text-gold-light" aria-label={`${f.name} — open the product page`}>
            {words.map((w, i) => (
              <motion.span key={w + i} className="inline-block pr-[.22em] lg:block lg:pr-0" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.46, ease: EASE, delay: 0.16 + i * 0.055 }}>{w}</motion.span>
            ))}
          </Link>
        </h2>
        <motion.span className="mt-4 h-px w-16 origin-left bg-gold" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.52, ease: EASE, delay: 0.22 }} />
        <motion.p className="mt-3 max-w-[34ch] text-[15px] text-ivory/75" {...rise(0.3)}>{f.tagline}</motion.p>
      </>}
      {part !== 'top' && <>
        <motion.p className={`fs-ink text-[11px] font-medium uppercase tracking-[.22em] ${part === 'facts' ? '' : 'mt-4'}`} {...rise(0.36, 6)}>{f.ingredientHint}</motion.p>
        <motion.div className="mt-3 flex flex-wrap items-center gap-3" {...rise(0.36, 6)}>
          <span className="inline-flex items-center gap-0.5 text-crunchy-red">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2, ease: EASE, delay: 0.36 + i * 0.06 }}><Flame size={12} className={i < f.spice ? 'fill-current' : 'opacity-25'} /></motion.span>
            ))}
          </span>
          <span className="fs-ink text-[11px] font-medium uppercase tracking-[.22em]">{HEAT[f.spice]}</span>
          {f.format === 'ready-to-serve' && <span className="rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[.2em]" style={t.chipFill ? { background: t.chipFill, color: t.chipInk } : { border: `1px solid ${t.ink}`, color: t.ink }}>Ready to serve</span>}
        </motion.div>
        <motion.div className={`flex flex-wrap items-center gap-3 ${part === 'facts' ? 'mt-4' : 'mt-7'}`} {...rise(0.42)}>
          {!locked && <button onClick={onChoose} className="btn btn-outline-gold !text-[11px]">Highlight this tin</button>}
          {STORE_OPEN ? <span className="text-[12px] text-ivory/45">{formatINR(f.price)} · {f.netWeight}</span> : part === 'facts' ? <span className="text-[12px] text-gold/80">Coming soon</span> : <Soon tone="dark" />}
        </motion.div>
      </>}
    </motion.div>
  )
}

/** The highlighted tin's panel: what it is, what it costs, the stepper, and the way to its own page. */
function Panel({ f, coarse, open, onClose, onRestoreFocus }: { f: Product; coarse: boolean; open: boolean; onClose: () => void; onRestoreFocus: () => void }) {
  const t = THEMES[f.slug]
  const box = useRef<HTMLElement>(null)
  const wasOpen = useRef(false)
  useEffect(() => { if (open) box.current?.focus({ preventScroll: true }); else if (wasOpen.current) onRestoreFocus(); wasOpen.current = open }, [open, onRestoreFocus])
  const body = (
    <>
      <p className="max-w-[46ch] text-[15px] leading-relaxed text-ivory">{f.description}</p>
      <p className="mt-3 text-[13px] text-ivory/75"><span className="fs-ink mr-2 text-[11px] font-medium uppercase tracking-[.22em]">Pairs with</span>{f.pairing}</p>
      {f.allergens && <p className="mt-3 text-[11px] font-medium uppercase tracking-[.22em] text-ivory/60">{f.allergens}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        {STORE_OPEN
          ? <p className="font-display text-[28px] leading-none text-ivory">{formatINR(f.price)} <span className="ml-2 text-[11px] font-medium uppercase tracking-[.22em] text-ivory/50">{f.netWeight} tin</span></p>
          : <Soon tone="dark" className="!px-4 !py-2 !text-[11px]" />}
        <AddControl slug={f.slug} size="lg" tone="gold" label="Add to cart" />
        <Link to={`/product/${f.slug}`} className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[.22em] text-ivory/80 underline-offset-4 hover:text-gold hover:underline">View the tin <ArrowUpRight size={13} /></Link>
      </div>
      <p className="mt-4 text-[11px] text-ivory/40">Turn the wheel or click anywhere to close.</p>
    </>
  )
  return coarse ? (
    <aside ref={box} data-panel role="dialog" aria-modal={false} aria-label={`${f.name} details`} tabIndex={-1} inert={!open} className={`fs-panel absolute inset-x-0 bottom-0 z-40 rounded-t-3xl px-6 pb-8 pt-3 outline-none ${open ? 'open' : ''}`} style={{ background: t.deep, ['--lift' as string]: '56px', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }} aria-hidden={!open}>
      <button onClick={onClose} className="mx-auto -mt-2.5 mb-1.5 flex h-11 w-full items-center justify-center" aria-label="Close"><span className="h-1 w-10 rounded-full bg-ivory/30" /></button>
      {body}
    </aside>
  ) : (
    <aside ref={box} data-panel role="dialog" aria-modal={false} aria-label={`${f.name} details`} tabIndex={-1} inert={!open} className={`fs-panel absolute bottom-[16%] left-8 z-40 w-[min(480px,40vw)] rounded-2xl p-7 outline-none lg:left-14 ${open ? 'open' : ''}`} style={{ background: t.deep, boxShadow: '0 30px 60px -30px rgba(0,0,0,.6)', ['--lift' as string]: '24px' }} aria-hidden={!open}>
      {body}
    </aside>
  )
}

export function FlavourSelect() {
  const coarse = useMedia('(pointer: coarse), (max-width: 767px)')
  const short = useMedia('(max-height: 720px)') && coarse
  const WL = coarse ? (short ? '68%' : '72%') : '68%' // the waterline
  const reduce = (useReducedMotion() ?? false) || NOANIM
  const sel = useFlavourSelector(FLAVOURS.length, { initial: initialIndex() })
  const { index, locked, settled, fast, turn } = sel
  const f = FLAVOURS[index], fs = FLAVOURS[settled]
  const t = THEMES[f.slug]
  const stage = useRef<HTMLElement>(null)
  const dragged = useRef(false) // raised at drag start, lowered at drag end (which Framer fires the frame AFTER the trailing click)
  const [drawKey, setDrawKey] = useState(1)
  const [seen, setSeen] = useState(false)
  const [baseBg, setBaseBg] = useState(() => groundBg(THEMES[FLAVOURS[initialIndex()].slug]))

  useEffect(() => sel.bindWheel(stage.current), [sel.bindWheel])
  useEffect(() => sel.bindKeys(stage.current), [sel.bindKeys])
  useEffect(() => { const a = document.activeElement; if (a instanceof HTMLElement && a.getAttribute('role') === 'radio' && stage.current?.contains(a)) stage.current.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')?.focus({ preventScroll: true }) }, [index])
  const restoreFocus = useCallback(() => stage.current?.focus({ preventScroll: true }), [])
  useEffect(() => { if (locked) setDrawKey((k) => k + 1) }, [locked])
  useEffect(() => { const id = window.setTimeout(() => setSeen(true), 50); return () => window.clearTimeout(id) }, [])
  useEffect(() => { try { localStorage.setItem(STORE, fs.slug) } catch { /* ignore */ } }, [fs])

  // one spring follows the continuous turn counter; the wheel and the rail read it per frame
  const pos = useSpring(turn, { stiffness: 190, damping: 30, mass: 0.9 })
  useEffect(() => { if (reduce) pos.jump(turn); else pos.set(turn) }, [turn, pos, reduce])
  const [stageW, setStageW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280))
  useEffect(() => { const f = () => setStageW(stage.current?.clientWidth ?? window.innerWidth); f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, [])
  const wheel = useMemo(() => ({ R: coarse ? stageW * 2.6 : Math.max(900, stageW * 0.85), step: coarse ? 0.22 : 0.245 }), [coarse, stageW])
  const showFull = !fast && settled === index

  // a click anywhere that is not the panel (or a control) closes the highlight
  const clickAway = (e: React.MouseEvent) => { if (!locked) return; const el = e.target as HTMLElement; if (el.closest('[data-panel], button, a, [role="radio"]')) return; sel.unlock() }

  return (
    <MotionConfig reducedMotion="user">
      <section id="collection" ref={stage} onClick={clickAway} className={`relative isolate scroll-mt-20 select-none overflow-hidden bg-night text-ivory focus-visible:outline-2 focus-visible:-outline-offset-3 focus-visible:outline-gold ${reduce ? 'fs-reduce' : ''}`} aria-label="The collection — choose a flavour" tabIndex={0}
        style={{ height: short ? 'clamp(560px, calc(100svh - 5rem), 980px)' : 'clamp(640px, calc(100svh - 5rem), 980px)', ['--f' as string]: t.hex, ['--f-ink' as string]: t.ink, ['--f-deep' as string]: t.deep, touchAction: 'pan-y' }}>

        {/* ground: the outgoing colour stays painted beneath while the new one wipes in from the waterline */}
        <div className="absolute inset-0" style={{ background: baseBg }} aria-hidden>
          <AnimatePresence initial={false}>
            <motion.div key={f.slug} className="absolute inset-0" style={{ background: groundBg(t) }}
              initial={reduce ? { opacity: 0 } : { clipPath: `ellipse(0% 0% at 50% ${WL})` }} animate={reduce ? { opacity: 1 } : { clipPath: `ellipse(150% 120% at 50% ${WL})` }}
              onAnimationComplete={() => setBaseBg(groundBg(t))} transition={{ duration: reduce ? 0.3 : fast ? 0.4 : 0.7, ease: COLOUR }} />
          </AnimatePresence>
          <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,transparent_55%,rgba(0,0,0,.45)_100%)]" />
          <div className="grain absolute inset-0" />
        </div>

        {/* the drawing, one ink */}
        <div className="fs-art pointer-events-none absolute inset-0" aria-hidden>
          <Ripples className="absolute inset-x-0 bottom-0 h-[32%] w-full opacity-35" rows={4} />
          <FishLane bottom="18%" dur={58} phase={0.12} dir="rtl" variant="rohu" size="w-24 md:w-36" opacity={0.6} swim={19} dx={40} />
          {!coarse && <FishLane bottom="9%" dur={66} phase={0.55} dir="ltr" variant="slender" size="w-28" opacity={0.5} swim={16} dx={48} />}
          <FishLane bottom="25%" dur={49} phase={0.82} dir="rtl" variant="fry" size="w-12 md:w-16" opacity={0.45} swim={11} dx={60} />
          <div className={`absolute left-1/2 w-[74vh] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 ${reduce ? '' : 'fs-breathe'}`} style={{ top: coarse ? '44%' : '46%', opacity: locked ? 0.4 : 0.24, transition: 'opacity .4s' }}>
            <HeroLotus drawKey={drawKey} draw={!reduce} />
          </div>
          <svg viewBox="0 0 100 100" className="absolute left-1/2 h-[86vh] w-[86vh] -translate-x-1/2 -translate-y-1/2 opacity-40" style={{ top: coarse ? '44%' : '46%' }} fill="none" stroke="currentColor" strokeWidth=".35">
            <circle cx="50" cy="50" r="48" strokeDasharray="60 240" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: reduce ? 'none' : 'spin 48s linear infinite' }} />
            <circle cx="50" cy="50" r="43" strokeDasharray="14 120 40 96" strokeOpacity=".6" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: reduce ? 'none' : 'spin 70s linear infinite reverse' }} />
          </svg>
          <LotusLeaf className="absolute -left-16 -top-10 w-64 opacity-60 md:w-80" spin={90} />
          <LotusLeaf className="absolute -bottom-12 -right-20 w-72 opacity-60 md:w-96" spin={110} reverse />
          <LotusLeaf className="absolute -right-10 top-[12%] hidden w-44 opacity-40 lg:block" spin={130} />
          {!coarse && <LotusLeaf className="absolute -left-14 bottom-8 hidden w-56 opacity-45 lg:block" spin={80} />}
          <Ripples className="absolute inset-x-0 h-7 w-full opacity-85" style={{ top: `calc(${WL} - 14px)` }} rows={1} />
        </div>

        {/* ripple emitter — fires once per rested step, in the incoming ink */}
        {!reduce && !fast && (
          <div className="pointer-events-none absolute left-1/2" style={{ top: WL }} aria-hidden>
            <AnimatePresence>
              {[0, 1].filter((r) => r === 0 || !coarse).map((r) => (
                <motion.div key={`${index}-${r}`} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%] border" style={{ width: '40vw', height: '12.5vw', borderColor: t.ink, left: 0, top: 0 }}
                  initial={{ scale: 0.25, opacity: 0.7 }} animate={{ scale: 2.4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE, delay: r * 0.12 }} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* the wheel — whatever is below the waterline is under water */}
        <motion.div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: WL, cursor: 'grab' }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0} dragMomentum={false}
          onDragStart={() => { dragged.current = true }}
          onDragEnd={(_, i) => { dragged.current = false; if (Math.abs(i.offset.x) > 40 || Math.abs(i.velocity.x) > 300) sel.step(i.offset.x < 0 ? 1 : -1) }}>
          {FLAVOURS.map((p, i) => (
            <WheelTin key={p.slug} p={p} i={i} pos={pos} count={FLAVOURS.length} R={wheel.R} step={wheel.step} active={i === index} locked={locked} coarse={coarse} short={short} reduce={reduce} seen={seen}
              onPick={() => { if (dragged.current) return; if (i === index) { if (locked) sel.unlock(); else sel.commit() } else sel.goto(i) }} />
          ))}
        </motion.div>
        {/* ground shadow at the waterline */}
        <AnimatePresence initial={false}>
          <motion.div key={f.slug} className="pointer-events-none absolute left-1/2 h-5 w-32 -translate-x-1/2 rounded-[50%] bg-black/45 blur-[8px]" style={{ top: `calc(${WL} - 8px)` }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.26, duration: 0.3 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }} aria-hidden />
        </AnimatePresence>

        {/* hint */}
        <p className="pointer-events-none absolute right-6 top-6 z-30 hidden text-[11px] uppercase tracking-[.25em] text-ivory/45 md:block">drag · ← → · pick a disc</p>

        {/* name plate */}
        {coarse && (
          <div className="absolute left-5 right-5 z-30" style={{ bottom: 'calc(max(12%, 92px) + 10px + env(safe-area-inset-bottom, 0px))' }}>
            <AnimatePresence mode="wait" initial={false}>
              {showFull && <Plate key={`facts-${fs.slug}`} part="facts" f={fs} index={settled} total={FLAVOURS.length} locked={locked} onChoose={sel.commit} />}
            </AnimatePresence>
          </div>
        )}
        <div className={`absolute z-30 ${coarse ? 'left-5 right-5 top-6' : 'left-8 top-[8%] w-[46%] lg:left-14'}`}>
          <AnimatePresence mode="wait" initial={false}>
            {showFull ? (
              <Plate key={`plate-${fs.slug}`} part={coarse ? 'top' : 'all'} f={fs} index={settled} total={FLAVOURS.length} locked={locked} onChoose={sel.commit} />
            ) : (
              <motion.div key="fast" className="flex flex-col items-start" exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                <p className="kicker flex items-center gap-2 !text-[11px] !tracking-[.32em]"><span className="text-ivory/50">The collection</span><span className="text-ivory/30">·</span><span className="fs-ink">{f.format === 'ready-to-serve' ? 'Ready to serve' : f.profile}</span><span className="text-ivory/30">·</span><span className="text-gold"><Roll value={String(index + 1).padStart(2, '0')} /> / {String(FLAVOURS.length).padStart(2, '0')}</span></p>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.h2 key={f.slug} className="mt-3 font-display text-[clamp(36px,10.5vw,56px)] italic leading-[0.92] tracking-[-0.01em] text-ivory lg:text-[clamp(56px,8vw,124px)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                    {f.name.split(' ').map((w, i) => <span key={i} className="inline-block pr-[.22em] lg:block lg:pr-0">{w}</span>)}
                  </motion.h2>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* prev / next */}
        <button onClick={() => sel.step(-1)} className={`absolute left-3 z-30 flex items-center justify-center rounded-full border border-gold/70 text-ivory transition hover:bg-gold hover:text-night lg:left-6 ${coarse ? 'top-[52%] h-12 w-12 bg-night/30 backdrop-blur-[2px]' : 'top-1/2 h-11 w-11 -translate-y-1/2'}`} aria-label="Previous flavour"><ChevronLeft size={18} /></button>
        <button onClick={() => sel.step(1)} className={`absolute right-3 z-30 flex items-center justify-center rounded-full border border-gold/70 text-ivory transition hover:bg-gold hover:text-night lg:right-6 ${coarse ? 'top-[52%] h-12 w-12 bg-night/30 backdrop-blur-[2px]' : 'top-1/2 h-11 w-11 -translate-y-1/2'}`} aria-label="Next flavour"><ChevronRight size={18} /></button>

        {/* roster rail */}
        <nav className="absolute inset-x-0 bottom-0 z-30 h-[12%] min-h-[92px]" aria-label="Flavours" style={{ opacity: locked ? 0.55 : 1, transition: 'opacity .3s' }}>
          <Ripples className="pointer-events-none absolute inset-x-0 top-1/2 h-6 w-full text-gold opacity-35" rows={1} />
          <ul className="absolute left-1/2 top-1/2 h-0" role="radiogroup" aria-label="Choose a flavour">
            {FLAVOURS.map((p, i) => <Disc key={p.slug} p={p} i={i} count={FLAVOURS.length} active={i === index} pos={pos} fill={THEMES[p.slug].hex} onPick={() => sel.goto(i)} />)}
          </ul>
        </nav>

        <Panel f={f} coarse={coarse} open={locked} onClose={sel.unlock} onRestoreFocus={restoreFocus} />
        <p className="sr-only" aria-live="polite">{showFull ? `${fs.name}, ${fs.tagline}, ${settled + 1} of ${FLAVOURS.length}` : ''}{locked ? ` ${f.name} details opened. Escape, the arrows or a click elsewhere closes.` : ''}</p>
      </section>

      {/* the full list still exists for anyone who wants to scan */}
      <section id="all-tins" className="bg-ivory py-14 sm:py-20">
        <Container>
          <details className="group">
            <summary className="mx-auto flex w-max max-w-full cursor-pointer list-none items-center gap-2 rounded-full border border-ink/15 px-5 py-2 text-[11px] font-medium uppercase tracking-[.2em] text-ink-soft transition hover:border-gold hover:text-gold-deep">
              Prefer a list? All thirteen tins and the gift trio <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}
            </div>
          </details>
          <p className="mt-8 text-center text-xs text-muted">{STORE_OPEN ? 'Prices inclusive of all taxes · Free shipping on orders above ₹499 · Ships across India' : 'The Sassmi range launches soon · Questions, bulk and corporate orders on WhatsApp'}</p>
        </Container>
      </section>
    </MotionConfig>
  )
}

/** One tin on the wheel's rim. Angle, position, lean, scale and opacity all derive from the spring per frame. */
function WheelTin({ p, i, pos, count, R, step, active, locked, coarse, short, reduce, seen, onPick }: { p: Product; i: number; pos: MotionValue<number>; count: number; R: number; step: number; active: boolean; locked: boolean; coarse: boolean; short: boolean; reduce: boolean; seen: boolean; onPick: () => void }) {
  const t = THEMES[p.slug]
  const a = useTransform(pos, (v) => ((((i - v) % count) + count * 1.5) % count - count / 2) * step) // wrap-aware, in radians
  const x = useTransform(a, (r) => Math.sin(r) * R)
  const y = useTransform(a, (r) => (1 - Math.cos(r)) * R)
  const rotate = useTransform(a, (r) => (r * 180) / Math.PI)
  const k = useTransform(a, (r) => Math.abs(r) / step)
  const scale = useTransform(k, [0, 1, 2.5], [1, 0.8, 0.62])
  const opacity = useTransform(k, [0, 1, 2, 3], [1, 0.62, 0.28, 0])
  const zIndex = useTransform(k, (v) => Math.round(50 - v * 10))
  return (
    <motion.div className="absolute bottom-[14px] left-1/2 w-0 will-change-transform" style={{ x, y, rotate, scale, opacity, zIndex, transformOrigin: '50% 100%' }}>
      <motion.div style={{ x: '-50%' }} initial={seen ? false : { y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1, scale: active && locked ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 240, damping: 28, mass: 1 }} className="w-max">
        <div className={active && !reduce ? 'fs-floaty' : ''}>
          <img src={coarse ? tin1x(p) : tin2x(p)} alt={`${p.name} tin`} draggable={false} decoding="async" onClick={onPick} className="block w-auto max-w-none cursor-pointer" style={{ height: coarse ? (short ? 'min(30svh, 260px)' : 'min(38dvh, 310px)') : 'min(46dvh, 400px)', filter: `drop-shadow(0 34px 40px ${t.shadow})` }} />
        </div>
      </motion.div>
    </motion.div>
  )
}

/** One hex disc on the rail; opacity and scale fall off with distance from the spring position. */
function Disc({ p, i, count, active, pos, fill, onPick }: { p: Product; i: number; count: number; active: boolean; pos: MotionValue<number>; fill: string; onPick: () => void }) {
  const off = useTransform(pos, (v) => ((((i - v) % count) + count * 1.5) % count) - count / 2) // wrap-aware, like the wheel: no teleport at 13 ↔ 1
  const x = useTransform(off, (o) => o * PITCH)
  const dist = useTransform(off, (o) => Math.abs(o))
  const opacity = useTransform(dist, [0, 4, 6, 6.5], [1, 0.35, 0.35, 0])
  const scale = useTransform(dist, [0, 4], [1, 0.86])
  return (
    <motion.li className="group absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 will-change-transform" style={{ x, opacity, scale }}>
      <button onClick={onPick} role="radio" aria-checked={active} aria-label={p.name} tabIndex={active ? 0 : -1}
        className={`relative flex items-center justify-center rounded-full transition-[width,height,transform,filter] duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-0.5 ${active ? 'h-[52px] w-[52px] translate-y-1' : 'h-11 w-11 opacity-70 saturate-[.7] hover:opacity-100'}`}
        style={{ background: fill + 'E6', touchAction: 'manipulation' }}>
        <img src={tin1x(p)} alt="" className={`w-auto drop-shadow-md ${active ? 'h-[38px]' : 'h-8'}`} draggable={false} />
        <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium uppercase tracking-[.22em] opacity-0 transition-opacity group-hover:opacity-100" style={{ color: 'var(--f-ink)' }}>{p.name}</span>
      </button>
      {active && <motion.span layoutId="fs-meniscus" className="fs-meniscus pointer-events-none absolute left-1/2 top-[calc(100%-6px)] h-3 w-[64px] -translate-x-1/2" transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.8 }} aria-hidden />}
    </motion.li>
  )
}
