import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, ShieldCheck } from 'lucide-react'
import { cart, useCart } from '../lib/cart'
import { backend, ApiError, type CustomerIn } from '../lib/backend'
import { useSiteConfig } from '../lib/useConfig'
import { openRazorpay } from '../lib/razorpay'
import { toast } from '../lib/toast'
import { bySlug } from '../../shared/products'
import { business, formatINR, whatsappLink } from '../../shared/config'
import { tinCut } from '../components/ProductCard'
import { Container } from '../components/ui/Section'
import { asset } from '../lib/env'

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry']

export default function CheckoutPage() {
  const { items, lines, subtotal, shippingFee, total } = useCart()
  const cfg = useSiteConfig()
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  const [c, setC] = useState<CustomerIn>({ name: '', email: '', phone: '', address1: '', address2: '', city: '', state: 'Delhi', pincode: '', note: '' })
  const set = (k: keyof CustomerIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setC({ ...c, [k]: e.target.value })

  const waText = `Hi Sassmi! I'd like to order:\n${lines.map((l) => `• ${l.name} × ${l.qty}`).join('\n')}\nTotal: ${formatINR(total)}\nName: ${c.name}\nAddress: ${c.address1} ${c.address2 ?? ''}, ${c.city}, ${c.state} ${c.pincode}`

  const pay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(c.phone.replace(/\D/g, '').slice(-10))) return toast('Please enter a valid 10-digit mobile number', 'err')
    if (!/^[1-9]\d{5}$/.test(c.pincode)) return toast('Please enter a valid 6-digit PIN code', 'err')
    setBusy(true)
    try {
      const customer = { ...c, phone: c.phone.replace(/\D/g, '').slice(-10) }
      const created = await backend.createOrder(items, customer)
      if (created.demo) { nav(`/order/${created.orderId}?email=${encodeURIComponent(customer.email)}&demo=1`); cart.clear(); return }
      const rzp = await openRazorpay({
        key: created.keyId, amount: created.amount, currency: created.currency, order_id: created.rzpOrderId,
        name: 'Sassmi', description: `Order ${created.orderId}`, image: `${location.origin}${asset('/img/brand/tile-512.png')}`,
        prefill: created.prefill, notes: { order: created.orderId },
        theme: { color: '#0F1A30', backdrop_color: 'rgba(15,26,48,0.85)' },
        retry: { enabled: true, max_count: 2 },
        modal: { ondismiss: () => { setBusy(false); toast('Payment cancelled — your cart is safe.', 'err') }, confirm_close: true, escape: false },
        handler: async (r) => {
          // money has moved at this point — never re-arm the Pay button. Verify with retries, then fall back to the webhook-confirmed order page.
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const v = await backend.verifyPayment(r)
              nav(`/order/${v.order.id}?email=${encodeURIComponent(v.order.email)}`)
              cart.clear()
              return
            } catch (err) {
              if (err instanceof ApiError && err.status === 400) { toast(err.message, 'err'); setBusy(false); return } // genuine mismatch
              await new Promise((res) => setTimeout(res, 800 * (attempt + 1)))
            }
          }
          nav(`/order/${created.orderId}?email=${encodeURIComponent(customer.email)}&pending=1`)
          cart.clear()
        },
      })
      rzp.on('payment.failed', (r) => { toast(`Payment failed: ${r.error.description}. You can try again.`, 'err'); setBusy(false) })
      rzp.open()
    } catch (err) {
      const msg = err instanceof ApiError && err.issues?.length ? `${err.message} ${err.issues[0]}` : (err as Error).message
      toast(msg || 'Could not start checkout', 'err'); setBusy(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 pt-20 text-center">
        <p className="kicker">Checkout</p><h1 className="mt-4 text-5xl">Your cart is empty.</h1>
        <Link to="/#collection" className="btn btn-night mt-8">Browse the collection</Link>
      </div>
    )
  }
  const paymentsOff = cfg && !cfg.paymentsEnabled && !cfg.demo

  return (
    <section className="bg-ivory pb-24 pt-28">
      <Container className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="kicker">Checkout</p>
          <h1 className="mt-3 text-5xl">Where should the tins go?</h1>
          {cfg?.demo && <p className="mt-4 rounded-xl border border-gold/40 bg-cream px-4 py-3 text-sm text-ink-soft">Preview mode: this walk-through simulates the payment step. On the live site, Razorpay opens here with UPI, cards, net-banking and wallets.</p>}
          {paymentsOff && <p className="mt-4 rounded-xl border border-blush/50 bg-cream px-4 py-3 text-sm text-ink-soft">Online payments are being switched on. Until then, send your order on WhatsApp and we’ll confirm within the hour.</p>}
          <form onSubmit={pay} className="mt-8 grid gap-4 sm:grid-cols-2">
            <input className="input sm:col-span-2" placeholder="Full name" value={c.name} onChange={set('name')} required minLength={2} maxLength={80} autoComplete="name" />
            <input className="input" type="email" placeholder="Email (for your receipt)" value={c.email} onChange={set('email')} required autoComplete="email" />
            <input className="input" type="tel" placeholder="Mobile number" value={c.phone} onChange={set('phone')} required autoComplete="tel" />
            <input className="input sm:col-span-2" placeholder="Address line 1 (house, street)" value={c.address1} onChange={set('address1')} required minLength={5} autoComplete="address-line1" />
            <input className="input sm:col-span-2" placeholder="Address line 2 (area, landmark) — optional" value={c.address2} onChange={set('address2')} autoComplete="address-line2" />
            <input className="input" placeholder="City" value={c.city} onChange={set('city')} required autoComplete="address-level2" />
            <select className="input" value={c.state} onChange={set('state')} required autoComplete="address-level1" aria-label="State">{STATES.map((s) => <option key={s}>{s}</option>)}</select>
            <input className="input" placeholder="PIN code" value={c.pincode} onChange={set('pincode')} required inputMode="numeric" pattern="[1-9][0-9]{5}" autoComplete="postal-code" />
            <textarea className="input sm:col-span-2" placeholder="Note for us (gift message, delivery instructions) — optional" value={c.note} onChange={set('note')} maxLength={300} rows={2} />
            <div className="mt-2 flex flex-col gap-3 sm:col-span-2">
              {paymentsOff ? (
                <a className="btn btn-gold" href={whatsappLink(waText)} target="_blank" rel="noreferrer">Send order on WhatsApp · {formatINR(total)}</a>
              ) : (
                <button className="btn btn-gold" disabled={busy || !cfg}><Lock size={14} /> {busy ? 'Opening secure payment…' : `Pay ${formatINR(total)} securely`}</button>
              )}
              <p className="flex items-center justify-center gap-2 text-center text-[11px] text-muted"><ShieldCheck size={13} /> Payments processed by Razorpay · UPI, cards, net-banking, wallets · We never see your card details</p>
            </div>
          </form>
        </div>
        <aside className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl bg-night p-7 text-ivory shadow-tin">
            <p className="kicker">Your order</p>
            <ul className="mt-5 divide-y divide-ivory/10">
              {items.map((it) => { const p = bySlug(it.slug)!; return (
                <li key={it.slug} className="flex items-center gap-4 py-3">
                  <img src={tinCut(p)} alt="" className="h-14 w-auto" />
                  <div className="flex-1"><p className="font-display text-lg leading-tight">{p.name}</p><p className="text-xs text-ivory/50">{p.netWeight} × {it.qty}</p></div>
                  <p className="font-display">{formatINR(p.price * it.qty)}</p>
                </li>
              ) })}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-ivory/10 pt-4 text-sm">
              <div className="flex justify-between text-ivory/70"><dt>Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
              <div className="flex justify-between text-ivory/70"><dt>Shipping</dt><dd>{shippingFee ? formatINR(shippingFee) : 'Free'}</dd></div>
              <div className="flex justify-between pt-2 font-display text-2xl"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
            </dl>
            <p className="mt-4 text-[11px] leading-relaxed text-ivory/45">Prices include all taxes. Dispatch within 1–2 working days; delivery {business.shipping.etaDays}. See our <Link className="underline" to="/policies/shipping">shipping</Link> and <Link className="underline" to="/policies/refunds">refund</Link> policies.</p>
          </div>
        </aside>
      </Container>
    </section>
  )
}
