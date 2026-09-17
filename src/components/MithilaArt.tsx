/**
 * Champagne-gold line art in the Mithila pond idiom — lotus, lotus leaf, fish and water — as pure SVG.
 * The water and the fish move: each ripple row drifts by exactly one wave period, so the loop is seamless.
 * Motion is CSS-only and respects prefers-reduced-motion (see index.css).
 */
type P = { className?: string; style?: React.CSSProperties }

export function Lotus({ className = '', style }: P) {
  return (
    <svg viewBox="0 0 200 160" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      <path d="M100 150 C 70 150, 40 130, 30 100 C 60 96, 85 110, 100 150 Z" />
      <path d="M100 150 C 130 150, 160 130, 170 100 C 140 96, 115 110, 100 150 Z" />
      <path d="M100 148 C 84 120, 82 80, 100 44 C 118 80, 116 120, 100 148 Z" />
      <path d="M100 148 C 78 130, 60 100, 58 58 C 84 70, 98 105, 100 148 Z" />
      <path d="M100 148 C 122 130, 140 100, 142 58 C 116 70, 102 105, 100 148 Z" />
      <path d="M100 148 C 68 140, 44 118, 36 84 C 66 84, 92 112, 100 148 Z" strokeOpacity=".7" />
      <path d="M100 148 C 132 140, 156 118, 164 84 C 134 84, 108 112, 100 148 Z" strokeOpacity=".7" />
      <path d="M100 150 L 100 160" />
      <circle cx="100" cy="128" r="2" fill="currentColor" stroke="none" />
      <circle cx="93" cy="132" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="107" cy="132" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function LotusLeaf({ className = '', style }: P) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className} style={style} aria-hidden>
      <path d="M100 20 C 150 20, 186 56, 186 100 C 186 146, 148 182, 100 182 C 52 182, 14 146, 14 100 C 14 60, 44 24, 86 20 L 100 100 Z" />
      {Array.from({ length: 11 }).map((_, i) => {
        const a = (-70 + i * 26) * (Math.PI / 180) + Math.PI / 2
        return <line key={i} x1="100" y1="100" x2={100 + Math.cos(a) * 80} y2={100 + Math.sin(a) * 80} strokeOpacity=".55" />
      })}
      <path d="M100 100 C 104 130, 104 160, 108 196" strokeOpacity=".8" />
    </svg>
  )
}

/** A fish that glides and wags its tail. `flip` makes it face the other way. */
export function Fish({ className = '', style, flip = false, dur = 14 }: P & { flip?: boolean; dur?: number }) {
  return (
    <svg viewBox="0 0 220 100" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={`fish ${className}`} style={{ ...style, overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined, ['--swim' as string]: `${dur}s` }} aria-hidden>
      <g className="fish-body">
        <path d="M20 50 C 60 10, 130 10, 170 50 C 130 90, 60 90, 20 50 Z" />
        <path d="M90 22 C 100 8, 116 8, 128 20" />
        <path d="M96 78 C 106 90, 120 90, 130 78" />
        <circle cx="46" cy="46" r="3" fill="currentColor" stroke="none" />
        <path d="M62 34 C 66 44, 66 56, 62 66" strokeOpacity=".7" />
        {[80, 100, 120, 140].map((x, i) => <path key={i} d={`M${x} 30 C ${x + 6} 42, ${x + 6} 58, ${x} 70`} strokeOpacity=".5" />)}
        <path className="fish-tail" d="M170 50 L 208 22 C 200 42, 200 58, 208 78 Z" />
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
      <LotusLeaf className="absolute -left-10 bottom-10 w-52 opacity-80 md:w-72" />
      <Lotus className="absolute bottom-24 left-24 w-40 md:w-56" />
      <LotusLeaf className="absolute bottom-6 right-[6%] w-36 opacity-70 md:w-52" style={{ transform: 'rotate(18deg)' }} />
      <Fish className="absolute bottom-[30%] right-[18%] w-36 opacity-80 md:w-52" dur={16} />
      <Fish className="absolute bottom-[16%] left-[38%] w-28 opacity-60 md:w-40" flip dur={21} />
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
