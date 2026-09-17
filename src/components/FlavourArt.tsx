// Motifs for the flavour-select showcase.
type P = { className?: string; style?: React.CSSProperties }
const MIRROR = 'scale(-1 1) translate(-200 0)'

/**
 * The site's Lotus, forked so every stroke can draw itself on: each path has pathLength=1, so a CSS
 * stroke-dashoffset 1 → 0 animation draws it regardless of its real length. Remount (change `drawKey`) to redraw.
 */
export function HeroLotus({ className = '', style, drawKey = 0, draw = true }: P & { drawKey?: number; draw?: boolean }) {
  const d = (delay: number) => (draw ? { className: 'draw', style: { animationDelay: `${delay}ms` } } : {})
  const half = (side: number) => (
    <>
      <path d="M100 148 C 118 130, 138 100, 138 58 C 116 72, 104 108, 100 148 Z" pathLength={1} {...d(80 + side * 40)} />
      <path d="M100 148 C 128 140, 154 118, 162 84 C 134 86, 110 112, 100 148 Z" strokeOpacity=".8" pathLength={1} {...d(160 + side * 40)} />
      <path d="M100 150 C 130 150, 158 132, 170 104 C 140 100, 116 116, 100 150 Z" strokeOpacity=".6" pathLength={1} {...d(240 + side * 40)} />
    </>
  )
  return (
    <svg key={drawKey} viewBox="0 0 200 170" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className={className} style={{ ...style, overflow: 'visible' }} aria-hidden>
      <path d="M100 148 C 86 118, 86 78, 100 40 C 114 78, 114 118, 100 148 Z" pathLength={1} {...d(0)} />
      <g>{half(0)}</g>
      <g transform={MIRROR}>{half(1)}</g>
      <g className={draw ? 'draw-fade' : ''} style={{ animationDelay: '900ms' }}>
        <circle cx="100" cy="126" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="92" cy="131" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="108" cy="131" r="1.4" fill="currentColor" stroke="none" />
      </g>
      <path d="M100 150 L100 170" pathLength={1} {...d(520)} />
    </svg>
  )
}
