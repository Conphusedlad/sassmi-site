import { ArrowUpRight, MessageCircle, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { business, whatsappLink } from '../../shared/config'
import { Container, SectionHead } from '../components/ui/Section'

export function WhereToBuy() {
  return (
    <section id="where-to-buy" className="scroll-mt-20 bg-cream py-20 sm:py-24">
      <Container>
        <SectionHead kicker="Where to find us" title="Direct, or wherever you already shop." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/#collection" className="group flex items-center justify-between rounded-2xl bg-night p-6 text-ivory shadow-card transition hover:-translate-y-0.5">
            <div><p className="kicker">Order direct</p><p className="mt-2 font-display text-2xl">sassmiglobal.com</p><p className="mt-1 text-xs text-ivory/60">Freshest batches · free shipping above ₹{business.shipping.freeAbove}</p></div>
            <ShoppingBag className="text-gold" strokeWidth={1.4} />
          </Link>
          <a href={whatsappLink('Hi Sassmi! I would like to place an order.')} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-ivory-2 bg-ivory p-6 shadow-card transition hover:-translate-y-0.5">
            <div><p className="kicker !text-gold-deep">WhatsApp</p><p className="mt-2 font-display text-2xl">{business.contact.phoneDisplay}</p><p className="mt-1 text-xs text-muted">Orders, bulk, questions — a human replies</p></div>
            <MessageCircle className="text-gold-deep" strokeWidth={1.4} />
          </a>
          {business.channels.map((ch) => (
            ch.url ? (
              <a key={ch.key} href={ch.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-ivory-2 bg-ivory p-6 shadow-card transition hover:-translate-y-0.5">
                <div><p className="kicker !text-gold-deep">Marketplace</p><p className="mt-2 font-display text-2xl">{ch.name}</p><p className="mt-1 text-xs text-muted">Buy on {ch.name}</p></div>
                <ArrowUpRight className="text-gold-deep" strokeWidth={1.4} />
              </a>
            ) : (
              <div key={ch.key} className="flex items-center justify-between rounded-2xl border border-dashed border-ivory-2 p-6 text-muted">
                <div><p className="kicker !text-muted">Marketplace</p><p className="mt-2 font-display text-2xl text-ink-soft">{ch.name}</p><p className="mt-1 text-xs">Listing coming soon</p></div>
              </div>
            )
          ))}
        </div>
      </Container>
    </section>
  )
}
