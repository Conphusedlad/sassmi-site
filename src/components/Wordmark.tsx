import { WORDMARK_H, WORDMARK_LEAF, WORDMARK_LETTERS, WORDMARK_TRANSFORM, WORDMARK_W } from './wordmark-paths'

/**
 * The brush-script Sassmi wordmark as inline SVG (vectorised from the approved label artwork),
 * so it stays razor-sharp at any size. Letters take `currentColor`; the leaf is champagne gold.
 */
export function Wordmark({ tone = 'ivory', className = '', leaf = '#D4B268' }: { tone?: 'ivory' | 'ink'; className?: string; leaf?: string }) {
  return (
    <svg viewBox={`0 0 ${WORDMARK_W} ${WORDMARK_H}`} className={`${tone === 'ivory' ? 'text-ivory' : 'text-ink'} ${className}`} role="img" aria-label="Sassmi" style={{ overflow: 'visible' }}>
      <g transform={WORDMARK_TRANSFORM} fill="currentColor" stroke="none" fillRule="evenodd">
        <path d={WORDMARK_LETTERS} />
      </g>
      <g transform={WORDMARK_TRANSFORM} fill={leaf} stroke="none" fillRule="evenodd">
        <path d={WORDMARK_LEAF} />
      </g>
    </svg>
  )
}
