import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Wordmark } from '../Wordmark'
import { PondScene } from '../MithilaArt'
import { renderMakhana } from './makhana'
import { EASE } from '../../lib/motion'

type Particle = { x: number; y: number; vx: number; vy: number; r: number; c: string; life: number; decay: number }

/**
 * The opening scene: one makhana floating over midnight water. Click, scroll, touch or any key
 * bursts it into cream-and-gold particles and dissolves the overlay to reveal the site beneath.
 * The makhana is painted on canvas at device resolution, so it is sharp on any screen.
 */
export function IntroBurst({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const seedRef = useRef<HTMLCanvasElement>(null)
  const painted = useRef<HTMLCanvasElement | null>(null)
  const [phase, setPhase] = useState<'idle' | 'burst' | 'fade'>('idle')
  const fired = useRef(false)
  const raf = useRef(0)

  // paint the makhana at device resolution (and again if the viewport changes)
  useEffect(() => {
    const paint = () => {
      const el = seedRef.current; if (!el) return
      const css = Math.min(320, Math.max(200, Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.36)))
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const src = renderMakhana(css, dpr, 11)
      painted.current = src
      el.width = src.width; el.height = src.height
      el.style.width = `${css}px`; el.style.height = `${Math.round(css * 1.28)}px`
      el.getContext('2d')!.drawImage(src, 0, 0)
    }
    paint()
    window.addEventListener('resize', paint)
    return () => window.removeEventListener('resize', paint)
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev; cancelAnimationFrame(raf.current) }
  }, [])

  const burst = useCallback(() => {
    if (fired.current) return
    fired.current = true
    const canvas = canvasRef.current, seed = seedRef.current, src = painted.current
    if (!canvas || !seed || !src) { onDone(); return }
    setPhase('burst')

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = window.innerWidth, H = window.innerHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const rect = seed.getBoundingClientRect()
    const sctx = src.getContext('2d')!
    const data = sctx.getImageData(0, 0, src.width, src.height).data
    const scale = rect.width / src.width // canvas px → css px
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.width * 0.5
    const mobile = W < 640
    const stepCss = mobile ? 5 : 3
    const step = Math.max(1, Math.round(stepCss / scale))
    const particles: Particle[] = []
    const rnd = (a: number, b: number) => a + Math.random() * (b - a)

    for (let y = 0; y < src.height; y += step) {
      for (let x = 0; x < src.width; x += step) {
        const i = (y * src.width + x) * 4
        if (data[i + 3] < 120) continue
        // skip the ground shadow (very dark, mostly transparent-ish region below the seed)
        if (y * scale > rect.width * 1.02 && data[i] < 60) continue
        const px = rect.left + x * scale, py = rect.top + y * scale
        let dx = px - cx, dy = py - cy
        const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d
        const speed = rnd(5, 15) * (mobile ? 0.8 : 1)
        particles.push({ x: px, y: py, vx: dx * speed + rnd(-1.5, 1.5), vy: dy * speed - rnd(1, 4), r: stepCss * rnd(0.45, 0.75), c: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`, life: 1, decay: rnd(0.006, 0.013) })
      }
    }
    const sparks = mobile ? 90 : 180
    for (let k = 0; k < sparks; k++) {
      const a = Math.random() * Math.PI * 2, s = rnd(7, 22)
      particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, r: rnd(0.8, 2.2), c: Math.random() < 0.5 ? '#E6CF95' : '#C9A867', life: 1, decay: rnd(0.008, 0.016) })
    }

    let t0 = performance.now()
    const flashStart = t0
    const tick = (now: number) => {
      const dt = Math.min(2, (now - t0) / 16.67); t0 = now
      ctx.clearRect(0, 0, W, H)
      const f = (now - flashStart) / 550
      if (f < 1) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90 + f * 420)
        g.addColorStop(0, `rgba(230,207,149,${0.55 * (1 - f)})`); g.addColorStop(1, 'rgba(230,207,149,0)')
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      }
      let alive = 0
      for (const p of particles) {
        if (p.life <= 0) continue
        alive++
        p.vx *= Math.pow(0.975, dt); p.vy = p.vy * Math.pow(0.975, dt) + 0.32 * dt
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= p.decay * dt
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.15))
        ctx.fillStyle = p.c
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
      if (alive > 0 && now - flashStart < 2400) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    window.setTimeout(() => setPhase('fade'), 380)
    window.setTimeout(onDone, 1900)
  }, [onDone])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => { e.preventDefault(); burst() }
    const onTouch = (e: TouchEvent) => { e.preventDefault(); burst() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Tab') return; burst() }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchmove', onTouch, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('wheel', onWheel); window.removeEventListener('touchmove', onTouch); window.removeEventListener('keydown', onKey) }
  }, [burst])

  const idle = phase === 'idle'
  return (
    <div className={`fixed inset-0 z-[100] select-none ${phase === 'fade' ? 'pointer-events-none' : 'cursor-pointer'}`} onClick={burst} role="button" aria-label="Enter the Sassmi website" tabIndex={-1}>
      <div className="absolute inset-0 bg-night transition-opacity duration-[900ms] ease-out grain" style={{ opacity: phase === 'fade' ? 0 : 1 }}>
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_58%,rgba(201,168,103,.16),transparent_70%)]" />
        <PondScene opacity={0.32} />
        <div className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="absolute left-1/2 top-1/2 block h-[22vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-[100%] border border-gold/40" style={{ animation: `ripple 4.5s ${i * 1.5}s ease-out infinite` }} />
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-ivory transition-opacity duration-300" style={{ opacity: idle ? 1 : 0 }}>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1, ease: EASE }} className="kicker">Premium Makhana · Est. Mithila</motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15, duration: 1.4, ease: EASE }} className="my-3 sm:my-5">
          <div className="animate-float">
            <canvas ref={seedRef} aria-hidden style={{ opacity: idle ? 1 : 0 }} />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 1.2, ease: EASE }}>
          <Wordmark className="mx-auto h-auto w-[64vw] max-w-[460px]" />
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} className="mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[.28em] text-ivory/60">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-gold" /></span>
          Click, scroll or press any key to open
        </motion.p>
      </div>

      <button onClick={(e) => { e.stopPropagation(); burst() }} className="absolute right-5 top-5 z-20 text-[11px] uppercase tracking-[.25em] text-ivory/60 transition hover:text-gold sm:right-8 sm:top-7" style={{ opacity: idle ? 1 : 0 }}>Skip →</button>
    </div>
  )
}
