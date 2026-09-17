/**
 * Champagne-gold line art in the Mithila pond idiom — lotus, lotus leaf, fish and water — as pure SVG.
 * The water and the fish move: each ripple row drifts by exactly one wave period, so the loop is seamless.
 * Motion is CSS-only and respects prefers-reduced-motion (see index.css).
 */
type P = { className?: string; style?: React.CSSProperties }

const MIRROR = 'scale(-1 1) translate(-200 0)'

export function Lotus({ className = '', style }: P) {
  const half = (
    <>
      <path d="M100 148 C 118 130, 138 100, 138 58 C 116 72, 104 108, 100 148 Z" />
      <path d="M100 148 C 128 140, 154 118, 162 84 C 134 86, 110 112, 100 148 Z" strokeOpacity=".8" />
      <path d="M100 150 C 130 150, 158 132, 170 104 C 140 100, 116 116, 100 150 Z" strokeOpacity=".6" />
    </>
  )
  return (
    <svg viewBox="0 0 200 170" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ ...style, overflow: 'visible' }} aria-hidden>
      <path d="M100 148 C 86 118, 86 78, 100 40 C 114 78, 114 118, 100 148 Z" />
      <g>{half}</g>
      <g transform={MIRROR}>{half}</g>
      <circle cx="100" cy="126" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="92" cy="131" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="108" cy="131" r="1.4" fill="currentColor" stroke="none" />
      <path d="M100 150 L100 170" />
    </svg>
  )
}

/**
 * A lotus pad: near-round with a gently undulating rim, a narrow slit to the centre, and radiating veins
 * whose spacing varies but stays mirror-symmetric, forking near the edge. `spin` = seconds per turn.
 */
export function LotusLeaf({ className = '', style, spin = 70, reverse = false }: P & { spin?: number; reverse?: boolean }) {
  const cx = 100, cy = 104, R = 82
  const rad = (deg: number) => (deg * Math.PI) / 180
  // angle φ measured from the downward axis; even cosine terms keep the rim symmetric
  const rim = (phi: number) => R * (1 + 0.014 * Math.cos(rad(6 * phi)) + 0.008 * Math.cos(rad(10 * phi) + 0.6) + 0.005 * Math.cos(rad(14 * phi)))
  const pt = (phi: number, r: number) => [cx + Math.sin(rad(phi)) * r, cy + Math.cos(rad(phi)) * r] as const
  const SLIT = 7 // half-width of the slit at the top, in degrees
  let d = ''
  for (let phi = -180 + SLIT; phi <= 180 - SLIT; phi += 3) {
    const [x, y] = pt(phi, rim(phi))
    d += (d ? ' L ' : 'M ') + x.toFixed(1) + ' ' + y.toFixed(1)
  }
  d += ` L ${cx} ${cy + 6} Z`
  const veins = [0, 21, 40, 62, 86, 110, 133, 154]
  const veinEls: React.ReactNode[] = []
  veins.forEach((v, i) => {
    for (const sgn of v === 0 ? [1] : [1, -1]) {
      const phi = sgn * v, len = rim(phi) * (0.9 + (i % 3) * 0.025)
      const [x, y] = pt(phi, len)
      veinEls.push(<line key={`v${phi}`} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} strokeOpacity=".5" />)
      if (i % 2 === 1) {
        const [fx, fy] = pt(phi, len * 0.62)
        for (const off of [5, -5]) { const [ex, ey] = pt(phi + off, len * 0.97); veinEls.push(<line key={`f${phi}${off}`} x1={fx.toFixed(1)} y1={fy.toFixed(1)} x2={ex.toFixed(1)} y2={ey.toFixed(1)} strokeOpacity=".32" />) }
      }
    }
  })
  return (
    <svg viewBox="0 0 200 210" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={`leaf ${className}`} style={{ ...style, overflow: 'visible', ['--spin' as string]: `${spin}s`, ['--spin-dir' as string]: reverse ? 'reverse' : 'normal' }} aria-hidden>
      <g className="leaf-spin">
        <path d={d} />
        {veinEls}
        <circle cx={cx} cy={cy} r="3.2" strokeOpacity=".85" />
        <circle cx={cx} cy={cy} r="1" fill="currentColor" stroke="none" />
      </g>
      <path d={`M${cx} ${cy + R} C ${cx + 2} ${cy + R + 12}, ${cx - 2} ${cy + R + 20}, ${cx} ${cy + R + 24}`} strokeOpacity=".7" />
    </svg>
  )
}

type FishVariant = 'rohu' | 'slender' | 'fry'
const FISH_BODY: Record<FishVariant, { body: string; top: string; bottom: string; tail: string; scales: number[]; eye: [number, number] }> = {
  rohu:    { body: 'M20 50 C 60 12, 130 12, 170 50 C 130 88, 60 88, 20 50 Z', top: 'M92 22 C 104 6, 120 6, 132 22', bottom: 'M92 78 C 104 94, 120 94, 132 78', tail: 'M170 50 L 208 22 C 200 42, 200 58, 208 78 Z', scales: [82, 102, 122, 142], eye: [46, 46] },
  slender: { body: 'M16 50 C 60 24, 140 24, 184 50 C 140 76, 60 76, 16 50 Z', top: 'M100 30 C 112 18, 128 18, 140 30', bottom: 'M104 70 C 114 80, 128 80, 138 70', tail: 'M184 50 L 214 30 C 208 44, 208 56, 214 70 Z', scales: [88, 110, 132, 154], eye: [42, 48] },
  fry:     { body: 'M30 50 C 60 20, 120 20, 150 50 C 120 80, 60 80, 30 50 Z', top: 'M84 26 C 94 14, 108 14, 118 26', bottom: 'M86 74 C 96 86, 108 86, 118 74', tail: 'M150 50 L 196 20 C 184 42, 184 58, 196 80 Z', scales: [78, 100, 122], eye: [54, 46] },
}

/** A fish that glides and wags its tail. `variant` changes the body; `flip` faces it the other way; `dx` is the glide distance. */
export function Fish({ className = '', style, flip = false, dur = 14, variant = 'rohu', dx = 36 }: P & { flip?: boolean; dur?: number; variant?: FishVariant; dx?: number }) {
  const f = FISH_BODY[variant]
  return (
    <svg viewBox="0 0 220 100" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={`fish ${className}`} style={{ ...style, overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined, ['--swim' as string]: `${dur}s`, ['--dx' as string]: `${dx}px` }} aria-hidden>
      <g className="fish-body">
        <path d={f.body} />
        <path d={f.top} />
        <path d={f.bottom} />
        <circle cx={f.eye[0]} cy={f.eye[1]} r="3" fill="currentColor" stroke="none" />
        <path d={`M${f.eye[0] + 16} 34 C ${f.eye[0] + 20} 44, ${f.eye[0] + 20} 56, ${f.eye[0] + 16} 66`} strokeOpacity=".7" />
        {f.scales.map((x, i) => <path key={i} d={`M${x} 30 C ${x + 6} 42, ${x + 6} 58, ${x} 70`} strokeOpacity=".5" />)}
        <path className="fish-tail" d={f.tail} />
      </g>
    </svg>
  )
}

/**
 * Living water: `rows` sine lines, each two periods wider than the view and translated by one period per loop.
 * Rows drift at different speeds and in alternating directions, like light on a pond surface.
 */
export function Ripples({ className = '', style, rows = 4, speed = 1 }: P & { rows?: number; speed?: number }) {
  const W = 1200, period = 120, amp = 6
  const wave = (y: number) => {
    let d = `M-${period * 2} ${y}`
    for (let x = -period * 2; x < W + period; x += period) d += ` q ${period / 4} ${-amp}, ${period / 2} 0 t ${period / 2} 0`
    return d
  }
  return (
    <svg viewBox={`0 0 ${W} 120`} preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className={`ripples ${className}`} style={style} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => {
        const y = 14 + (i * 92) / Math.max(1, rows - 1)
        const dur = (9 + i * 2.7) / speed
        return <path key={i} d={wave(y)} strokeOpacity={0.95 - i * 0.16} className="ripple-row" style={{ ['--dur' as string]: `${dur}s`, ['--dir' as string]: i % 2 ? '-1' : '1', ['--period' as string]: `${period}px` }} />
      })}
    </svg>
  )
}

/** A composed pond scene for dark backgrounds. Absolutely positioned; parent must be `relative overflow-hidden`. */
export function PondScene({ className = '', opacity = 0.55 }: { className?: string; opacity?: number }) {
  return (
    <div className={`pointer-events-none absolute inset-0 text-gold ${className}`} style={{ opacity }} aria-hidden>
      <LotusLeaf className="absolute -left-8 bottom-6 w-48 opacity-80 md:w-64" spin={80} />
      <Lotus className="absolute bottom-24 left-[9%] w-36 md:w-48" />
      <LotusLeaf className="absolute -right-8 bottom-6 w-48 opacity-80 md:w-64" spin={95} reverse />
      <Lotus className="absolute bottom-24 right-[9%] w-36 opacity-80 md:w-48" />
      {/* a small school: sizes, bodies, directions and speeds all differ */}
      <Fish className="absolute bottom-[36%] left-[20%] w-32 opacity-75 md:w-44" flip dur={19} variant="rohu" dx={40} />
      <Fish className="absolute bottom-[27%] right-[21%] w-32 opacity-75 md:w-44" dur={16} variant="slender" dx={48} />
      <Fish className="absolute bottom-[44%] left-[38%] w-16 opacity-45 md:w-24" dur={11} variant="fry" dx={60} />
      <Fish className="absolute bottom-[19%] left-[9%] w-20 opacity-50 md:w-28" flip dur={23} variant="slender" dx={30} />
      <Fish className="absolute bottom-[46%] right-[34%] w-14 opacity-40 md:w-20" flip dur={13} variant="fry" dx={54} />
      <Fish className="absolute bottom-[14%] right-[8%] w-20 opacity-50 md:w-28" dur={26} variant="rohu" dx={28} />
      <Ripples className="absolute inset-x-0 bottom-0 h-28 w-full opacity-70" rows={5} />
      <Ripples className="absolute inset-x-0 bottom-[22%] h-16 w-full opacity-30" rows={2} speed={0.7} />
    </div>
  )
}

/**
 * The pond surface as a section boundary: the next section's colour rises in two moving waves.
 * Place at the bottom of a dark section; `fill` is the colour of the section that follows.
 */
export function WaveDivider({ fill = 'var(--color-ivory)', className = '' }: { fill?: string; className?: string }) {
  const W = 1440, period = 240
  const wave = (y: number, a: number) => {
    let d = `M-${period} ${y}`
    for (let x = -period; x < W + period; x += period) d += ` q ${period / 4} ${-a}, ${period / 2} 0 t ${period / 2} 0`
    return d + ` L ${W + period} 120 L -${period} 120 Z`
  }
  return (
    <div className={`pointer-events-none relative h-14 w-full overflow-hidden sm:h-20 ${className}`} aria-hidden>
      <svg viewBox={`0 0 ${W} 120`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d={wave(58, 14)} fill={fill} fillOpacity=".35" className="wave-row" style={{ ['--dur' as string]: '13s', ['--dir' as string]: '1', ['--period' as string]: `${period}px` }} />
        <path d={wave(70, 12)} fill={fill} fillOpacity=".55" className="wave-row" style={{ ['--dur' as string]: '17s', ['--dir' as string]: '-1', ['--period' as string]: `${period}px` }} />
        <path d={wave(84, 10)} fill={fill} className="wave-row" style={{ ['--dur' as string]: '11s', ['--dir' as string]: '1', ['--period' as string]: `${period}px` }} />
        <path d={wave(46, 12)} fill="none" stroke="var(--color-gold)" strokeOpacity=".45" strokeWidth="1.2" className="wave-row" style={{ ['--dur' as string]: '15s', ['--dir' as string]: '-1', ['--period' as string]: `${period}px` }} />
      </svg>
    </div>
  )
}
