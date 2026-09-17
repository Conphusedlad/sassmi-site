import { useCallback, useEffect, useState } from 'react'
import { Check, LogOut, RefreshCw, Trash2 } from 'lucide-react'
import { backend, ApiError } from '../lib/backend'
import { formatINR } from '../../shared/config'
import { toast } from '../lib/toast'
import { Container } from '../components/ui/Section'

type Summary = { orders: number; paidOrders: number; revenue: number; pendingReviews: number; openQueries: number; subscribers: number; payments: boolean; db: string }
type Order = { id: string; status: string; amount: number; items: { name: string; qty: number }[]; customer: { name: string; phone: string; email: string; address1: string; address2?: string; city: string; state: string; pincode: string; note?: string }; rzpPaymentId: string | null; createdAt: string }
type Review = { id: string; name: string; rating: number; text: string; productSlug: string | null; approved: boolean; createdAt: string }
type Query = { id: string; ticket: string; name: string; email: string; phone: string | null; topic: string; message: string; status: 'new' | 'done'; createdAt: string }
type Tab = 'orders' | 'reviews' | 'queries' | 'subscribers'

const fmt = (s: string) => new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export default function AdminPage() {
  const [pw, setPw] = useState(() => sessionStorage.getItem('sassmi.admin') ?? '')
  const [input, setInput] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [tab, setTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [queries, setQueries] = useState<Query[]>([])
  const [subs, setSubs] = useState<{ email: string; createdAt: string }[]>([])
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (p: string) => {
    setBusy(true)
    try {
      const [s, o, r, q, sb] = await Promise.all([
        backend.admin<Summary>('/summary', p), backend.admin<{ orders: Order[] }>('/orders', p), backend.admin<{ reviews: Review[] }>('/reviews', p), backend.admin<{ queries: Query[] }>('/queries', p), backend.admin<{ subscribers: { email: string; createdAt: string }[] }>('/subscribers', p),
      ])
      setSummary(s); setOrders(o.orders); setReviews(r.reviews); setQueries(q.queries); setSubs(sb.subscribers)
      sessionStorage.setItem('sassmi.admin', p); setPw(p)
    } catch (e) {
      const msg = e instanceof ApiError && e.status === 401 ? 'Wrong password' : (e as Error).message
      toast(msg, 'err'); if (e instanceof ApiError && e.status === 401) { sessionStorage.removeItem('sassmi.admin'); setPw('') }
    } finally { setBusy(false) }
  }, [])
  useEffect(() => { if (pw) void load(pw) }, [pw, load])

  if (!pw) {
    return (
      <section className="bg-ivory pb-24 pt-32"><Container className="max-w-md">
        <p className="kicker">Sassmi admin</p><h1 className="mt-3 text-4xl">Family only.</h1>
        <form className="mt-8 space-y-3" onSubmit={(e) => { e.preventDefault(); void load(input) }}>
          <input className="input" type="password" placeholder="Admin password" value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
          <button className="btn btn-night w-full" disabled={busy}>{busy ? 'Checking…' : 'Enter'}</button>
        </form>
        <p className="mt-4 text-xs text-muted">Set ADMIN_PASSWORD in the server environment to enable this panel.</p>
      </Container></section>
    )
  }

  const act = async (fn: () => Promise<unknown>, ok: string) => { try { await fn(); toast(ok); await load(pw) } catch (e) { toast((e as Error).message, 'err') } }

  return (
    <section className="bg-ivory pb-24 pt-28"><Container>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="kicker">Sassmi admin</p><h1 className="mt-2 text-4xl">Orders, reviews, queries.</h1></div>
        <div className="flex gap-2">
          <button className="btn btn-outline-ink !px-4 !py-2" onClick={() => void load(pw)} disabled={busy}><RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> Refresh</button>
          <button className="btn btn-outline-ink !px-4 !py-2" onClick={() => { sessionStorage.removeItem('sassmi.admin'); setPw('') }}><LogOut size={14} /> Sign out</button>
        </div>
      </div>
      {summary && (
        <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[['Paid orders', summary.paidOrders], ['Revenue', formatINR(summary.revenue)], ['All orders', summary.orders], ['Reviews to check', summary.pendingReviews], ['Open queries', summary.openQueries], ['Subscribers', summary.subscribers]].map(([k, v]) => (
            <div key={String(k)} className="rounded-2xl bg-cream p-4 shadow-card"><p className="text-[10px] uppercase tracking-[.2em] text-muted">{k}</p><p className="mt-1 font-display text-3xl">{v}</p></div>
          ))}
          <p className="text-xs text-muted sm:col-span-3 lg:col-span-6">Payments {summary.payments ? 'enabled (Razorpay keys set)' : 'NOT enabled — set RAZORPAY_KEY_ID / SECRET'} · Database: {summary.db}</p>
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-2">
        {(['orders', 'reviews', 'queries', 'subscribers'] as Tab[]).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[.2em] ${tab === t ? 'border-night bg-night text-ivory' : 'border-ink/15 text-ink-soft'}`}>{t}</button>)}
      </div>

      {tab === 'orders' && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ivory-2 bg-cream">
          <table className="w-full text-sm"><thead className="text-left text-[10px] uppercase tracking-[.2em] text-muted"><tr>{['Order', 'When', 'Status', 'Items', 'Customer', 'Ship to', 'Amount'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-ivory-2">
              {orders.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="px-4 py-3 font-medium">{o.id}<br /><span className="text-xs text-muted">{o.rzpPaymentId ?? '—'}</span></td>
                  <td className="px-4 py-3 text-muted">{fmt(o.createdAt)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[.15em] ${o.status === 'paid' ? 'bg-green-700 text-white' : o.status === 'failed' ? 'bg-crunchy-red text-white' : 'bg-ivory-2'}`}>{o.status}</span></td>
                  <td className="px-4 py-3">{o.items.map((i) => <div key={i.name}>{i.name} × {i.qty}</div>)}</td>
                  <td className="px-4 py-3">{o.customer.name}<br /><a className="text-gold-deep" href={`https://wa.me/91${o.customer.phone}`} target="_blank" rel="noreferrer">{o.customer.phone}</a><br /><span className="text-xs text-muted">{o.customer.email}</span></td>
                  <td className="px-4 py-3 text-xs text-ink-soft">{o.customer.address1}{o.customer.address2 ? `, ${o.customer.address2}` : ''}, {o.customer.city}, {o.customer.state} {o.customer.pincode}{o.customer.note && <div className="mt-1 italic">“{o.customer.note}”</div>}</td>
                  <td className="px-4 py-3 font-display text-lg">{formatINR(o.amount / 100)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td className="px-4 py-8 text-center text-muted" colSpan={7}>No orders yet.</td></tr>}
            </tbody></table>
        </div>
      )}

      {tab === 'reviews' && (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className={`rounded-2xl border p-5 ${r.approved ? 'border-ivory-2 bg-cream' : 'border-gold/50 bg-[#FFF8E6]'}`}>
              <div className="flex items-start justify-between gap-3"><div><p className="font-display text-lg">{r.name} <span className="text-gold">{'★'.repeat(r.rating)}</span></p><p className="text-xs text-muted">{r.productSlug ?? 'general'} · {fmt(r.createdAt)} · {r.approved ? 'live' : 'awaiting approval'}</p></div>
                <div className="flex gap-2">
                  {!r.approved && <button className="flex h-8 items-center gap-1 rounded-full bg-green-700 px-3 text-xs text-white" onClick={() => act(() => backend.admin(`/reviews/${r.id}`, pw, { method: 'PATCH', body: JSON.stringify({ approved: true }) }), 'Review published')}><Check size={12} /> Approve</button>}
                  {r.approved && <button className="flex h-8 items-center rounded-full border border-ink/15 px-3 text-xs" onClick={() => act(() => backend.admin(`/reviews/${r.id}`, pw, { method: 'PATCH', body: JSON.stringify({ approved: false }) }), 'Review hidden')}>Hide</button>}
                  <button className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-crunchy-red" onClick={() => { if (confirm('Delete this review permanently?')) void act(() => backend.admin(`/reviews/${r.id}`, pw, { method: 'DELETE' }), 'Review deleted') }} aria-label="Delete"><Trash2 size={13} /></button>
                </div></div>
              <p className="mt-3 text-sm text-ink-soft">“{r.text}”</p>
            </li>
          ))}
          {reviews.length === 0 && <li className="text-muted">No reviews yet.</li>}
        </ul>
      )}

      {tab === 'queries' && (
        <ul className="mt-6 space-y-3">
          {queries.map((q) => (
            <li key={q.id} className={`rounded-2xl border p-5 ${q.status === 'new' ? 'border-gold/50 bg-[#FFF8E6]' : 'border-ivory-2 bg-cream'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-display text-lg">{q.ticket} · {q.topic}</p><p className="text-xs text-muted">{q.name} · <a className="text-gold-deep" href={`mailto:${q.email}?subject=Re: ${q.ticket}`}>{q.email}</a>{q.phone && <> · <a className="text-gold-deep" href={`https://wa.me/91${q.phone}`} target="_blank" rel="noreferrer">{q.phone}</a></>} · {fmt(q.createdAt)}</p></div>
                <button className={`flex h-8 items-center gap-1 rounded-full px-3 text-xs ${q.status === 'new' ? 'bg-night text-ivory' : 'border border-ink/15'}`} onClick={() => act(() => backend.admin(`/queries/${q.id}`, pw, { method: 'PATCH', body: JSON.stringify({ status: q.status === 'new' ? 'done' : 'new' }) }), 'Updated')}>{q.status === 'new' ? 'Mark done' : 'Reopen'}</button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{q.message}</p>
            </li>
          ))}
          {queries.length === 0 && <li className="text-muted">No queries yet.</li>}
        </ul>
      )}

      {tab === 'subscribers' && (
        <div className="mt-6 rounded-2xl border border-ivory-2 bg-cream p-5">
          <p className="text-sm text-muted">{subs.length} subscriber{subs.length === 1 ? '' : 's'} · <button className="text-gold-deep underline" onClick={() => { navigator.clipboard.writeText(subs.map((s) => s.email).join(', ')); toast('Emails copied') }}>copy all</button></p>
          <ul className="mt-3 columns-1 text-sm sm:columns-2 lg:columns-3">{subs.map((s) => <li key={s.email} className="py-0.5">{s.email}</li>)}</ul>
        </div>
      )}
    </Container></section>
  )
}
