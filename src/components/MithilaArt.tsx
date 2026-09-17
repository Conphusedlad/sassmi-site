/**
 * Champagne-gold line art in the Mithila pond idiom (lotus, lotus leaf, fish, ripples) — pure SVG,
 * so it stays crisp at any size and inherits `currentColor`.
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

export function Fish({ className = '', style, flip = false }: P & { flip?: boolean }) {
  return (
    <svg viewBox="0 0 220 100" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ ...style, transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden>
      <path d="M20 50 C 60 10, 130 10, 170 50 C 130 90, 60 90, 20 50 Z" />
      <path d="M170 50 L 208 22 C 200 42, 200 58, 208 78 Z" />
      <path d="M90 22 C 100 8, 116 8, 128 20" />
      <path d="M96 78 C 106 90, 120 90, 130 78" />
      <circle cx="46" cy="46" r="3" fill="currentColor" stroke="none" />
      <path d="M62 34 C 66 44, 66 56, 62 66" strokeOpacity=".7" />
      {[80, 100, 120, 140].map((x, i) => (
        <path key={i} d={`M${x} 30 C ${x + 6} 42, ${x + 6} 58, ${x} 70`} strokeOpacity=".5" />
      ))}
    </svg>
  )
}

export function Ripples({ className = '', style, rows = 4 }: P & { rows?: number }) {
  return (
    <svg viewBox="0 0 600 120" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className={className} style={style} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => {
        const y = 20 + i * (80 / Math.max(1, rows - 1))
        return <path key={i} d={`M0 ${y} Q 40 ${y - 8}, 80 ${y} T 160 ${y} T 240 ${y} T 320 ${y} T 400 ${y} T 480 ${y} T 560 ${y} T 640 ${y}`} strokeOpacity={0.9 - i * 0.15} />
      })}
    </svg>
  )
}

/** A composed pond scene for dark backgrounds. Absolutely positioned; parent must be `relative overflow-hidden`. */
export function PondScene({ className = '', opacity = 0.55 }: { className?: string; opacity?: number }) {
  return (
    <div className={`pointer-events-none absolute inset-0 text-gold ${className}`} style={{ opacity }} aria-hidden>
      <LotusLeaf className="absolute -left-10 bottom-10 w-52 md:w-72 opacity-80" />
      <Lotus className="absolute left-24 bottom-24 w-40 md:w-56" />
      <LotusLeaf className="absolute right-[6%] bottom-6 w-36 md:w-52 opacity-70" style={{ transform: 'rotate(18deg)' }} />
      <Fish className="absolute right-[18%] bottom-[30%] w-36 md:w-52 opacity-80" />
      <Fish className="absolute left-[38%] bottom-[16%] w-28 md:w-40 opacity-60" flip />
      <Ripples className="absolute inset-x-0 bottom-0 w-full opacity-70" rows={5} />
      <Ripples className="absolute inset-x-0 bottom-[22%] w-full opacity-30" rows={2} />
    </div>
  )
}
