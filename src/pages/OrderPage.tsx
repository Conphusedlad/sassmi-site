import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { backend, type OrderPublic } from '../lib/backend'
import { business, formatINR, whatsappLink, STORE_OPEN } from '../../shared/config'
import { OrderingSoon } from '../components/ComingSoon'
import { Container } from '../components/ui/Section'
import { PondScene } from '../components/MithilaArt'

export default function OrderPage() {
  return STORE_OPEN ? <OrderConfirmation /> : <OrderingSoon />
}

function OrderConfirmation() {
  const { id = '' } = useParams()
  const [sp] = useSearchParams()
  const [order, setOrder] = useState<OrderPublic | { id: string; status: string } | null | undefined>(undefined)
  const pending = sp.get('pending') === '1'
  useEffect(() => {
    let alive = true, tries = 0
    const load = async () => {
      const o = await backend.getOrder(id, sp.get('email') ?? undefined)
      if (!alive) return
      setOrder(o)
      // after a Razorpay success we could not verify inline, keep asking the server until the webhook has confirmed it
      if (pending && (!o || o.status !== 'paid') && tries++ < 15) setTimeout(load, 4000)
    }
    void load()
    return () => { alive = false }
  }, [id, sp, pending])
  const full = order && 'items' in order ? order : null
  const demo = sp.get('demo') === '1'

  return (
    <section className="relative overflow-hidden bg-night pb-24 pt-32 text-ivory">
      <PondScene opacity={0.3} leaves={false} lotus="center" fish="none" />
      <Container max="max-w-3xl" className="relative text-center">
        <CheckCircle2 className="mx-auto text-gold" size={44} strokeWidth={1.2} />
        <p className="kicker mt-6">{demo ? 'Preview order' : pending && (!full || full.status !== 'paid') ? 'Payment received' : 'Order confirmed'}</p>
        <h1 className="mt-4 text-5xl sm:text-6xl">Thank you{full ? `, ${full.customerName.split(' ')[0]}` : ''}.</h1>
        <p className="mt-4 text-ivory/70">Order <span className="font-display text-xl text-gold">{id}</span>{full ? ` · ${formatINR(full.amount / 100)}` : ''}</p>
        {pending && (!full || full.status !== 'paid') && <p className="mx-auto mt-4 max-w-lg rounded-xl border border-gold/40 bg-night-soft px-4 py-3 text-sm text-ivory/70">Razorpay has accepted your payment. We are confirming it with our system now — this page updates itself; your email receipt follows within a few minutes.</p>}
        {demo && <p className="mx-auto mt-4 max-w-lg rounded-xl border border-gold/40 bg-night-soft px-4 py-3 text-sm text-ivory/70">This was a preview. No payment was taken. On the live site this page follows a successful Razorpay payment and a confirmation email.</p>}
        {order === undefined && <p className="mt-8 text-ivory/50">Fetching your order…</p>}
        {order === null && <p className="mt-8 text-ivory/70">We couldn’t find that order. If you just paid, check your email for the confirmation, or WhatsApp us with your payment ID.</p>}
        {full && (
          <div className="mx-auto mt-10 max-w-xl rounded-3xl bg-ivory p-7 text-left text-ink shadow-tin">
            <ul className="divide-y divide-ivory-2">
              {full.items.map((l) => <li key={l.slug} className="flex justify-between py-2.5"><span>{l.name} × {l.qty}</span><span>{formatINR(l.unitPrice * l.qty)}</span></li>)}
              <li className="flex justify-between py-2.5 text-ink-soft"><span>Shipping</span><span>{full.shippingFee ? formatINR(full.shippingFee) : 'Free'}</span></li>
              <li className="flex justify-between py-2.5 font-display text-xl"><span>Total paid</span><span>{formatINR(full.amount / 100)}</span></li>
            </ul>
            <p className="mt-4 text-sm text-ink-soft">A confirmation has been sent to <strong>{full.email}</strong>. We roast in small batches and dispatch within 1–2 working days; delivery usually takes {business.shipping.etaDays}.</p>
          </div>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/#collection" className="btn btn-gold">Continue shopping</Link>
          <a href={whatsappLink(`Hi Sassmi! Question about my order ${id}.`)} target="_blank" rel="noreferrer" className="btn btn-outline-gold">Ask about this order</a>
        </div>
      </Container>
    </section>
  )
}
