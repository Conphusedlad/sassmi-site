import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { soonWhatsApp, whatsappLink } from '../../shared/config'
import { bySlug } from '../../shared/products'
import { useCart } from '../lib/cart'

/** The "Coming soon" label that stands in for a price while the online store is closed. */
export function Soon({ tone = 'light', className = '' }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[.22em] ${tone === 'dark' ? 'border-gold/60 text-gold' : 'border-gold-deep/50 text-ink-soft'} ${className}`}>
      Coming soon
    </span>
  )
}

/** Stand-in for every add-to-cart while the store is closed: opens WhatsApp with a ready message. */
export function AskWhatsApp({ what, size = 'sm', tone = 'night', className = '' }: { what?: string; size?: 'sm' | 'lg'; tone?: 'night' | 'gold'; className?: string }) {
  const h = size === 'lg' ? 'h-12 px-7 text-[12px]' : 'h-10 px-5 text-[11px]'
  const toneCls = tone === 'gold' ? 'bg-gold text-night hover:bg-gold-light' : 'bg-night text-ivory hover:bg-gold hover:text-night'
  return (
    <a href={soonWhatsApp(what)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full font-medium uppercase tracking-[.2em] transition-colors ${h} ${toneCls} ${className}`}
      aria-label={what ? `Ask about ${what} on WhatsApp` : 'Ask on WhatsApp'}>
      <MessageCircle size={size === 'lg' ? 15 : 14} /> {size === 'lg' ? 'Ask on WhatsApp' : 'WhatsApp'}
    </a>
  )
}

/** While the store is closed: no form, no prices — the cart (if any) goes to WhatsApp as a message. */
export function OrderingSoon() {
  const { items } = useCart()
  const wanted = items.map((it) => bySlug(it.slug)).filter(Boolean).map((p) => p!.name)
  const href = wanted.length ? whatsappLink(`Hi Sassmi! I'm interested in: ${wanted.join(', ')}. When can I order?`) : soonWhatsApp()
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
      <p className="kicker">Coming soon</p>
      <h1 className="mt-4 text-balance text-5xl">Online ordering opens soon.</h1>
      <p className="mt-5 max-w-md text-ink-soft">Until then, message us on WhatsApp for launch dates, bulk or corporate orders. A person replies.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={href} target="_blank" rel="noreferrer" className="btn btn-gold"><MessageCircle size={15} /> Ask on WhatsApp</a>
        <Link to="/#collection" className="btn btn-outline-ink">Explore the flavours</Link>
      </div>
    </div>
  )
}
