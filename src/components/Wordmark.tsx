import { asset } from '../lib/env'

/**
 * The Sassmi wordmark — the family's textured brush-stroke mark (ivory letters, gold leaf) on a transparent
 * ground, exported from the approved "Sassmi Clean Logo" file at two sizes. It is a raster on purpose: the
 * brush texture is the point, and 1500 px is 10× any size it is shown at. Size it with a height class.
 */
export function Wordmark({ className = '', sizes = '(min-width: 1024px) 120px, 100px', tone: _tone = 'ivory' }: { tone?: 'ivory' | 'ink'; className?: string; sizes?: string }) {
  return (
    <img
      src={asset('/img/brand/wordmark-600.webp')}
      srcSet={`${asset('/img/brand/wordmark-600.webp')} 600w, ${asset('/img/brand/wordmark-1500.webp')} 1500w`}
      sizes={sizes}
      width={1500} height={800} alt="Sassmi" draggable={false} decoding="async"
      className={`select-none ${className}`}
    />
  )
}
