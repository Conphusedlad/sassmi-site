import { asset } from '../lib/env'

/** The brush-script Sassmi wordmark (extracted from the approved label artwork). */
export function Wordmark({ tone = 'ivory', className = '' }: { tone?: 'ivory' | 'ink'; className?: string }) {
  return <img src={asset(`/img/art/wordmark-${tone}.png`)} alt="Sassmi" className={`select-none ${className}`} draggable={false} width={418} height={187} />
}
