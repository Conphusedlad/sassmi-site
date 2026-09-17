import { useState } from 'react'
import { backend } from '../lib/backend'
import { toast } from '../lib/toast'
import { Container } from '../components/ui/Section'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast('Please enter a valid email', 'err'); return }
    setBusy(true)
    try { const r = await backend.subscribe(email); toast(r.added ? 'You’re on the list. New flavours reach you first.' : 'You’re already on the list — thank you.'); setEmail('') }
    catch (err) { toast((err as Error).message || 'Could not subscribe', 'err') }
    finally { setBusy(false) }
  }
  return (
    <section className="border-t border-ivory-2 bg-cream py-16">
      <Container className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="kicker">Letters from the pond</p>
          <h2 className="mt-3 text-4xl">New flavours, harvest notes, the occasional recipe.</h2>
          <p className="mt-3 text-sm text-ink-soft">One email a month at most. No discounts spam — we don’t do discounts.</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <input className="input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email address" />
          <button className="btn btn-night shrink-0" disabled={busy}>{busy ? 'Adding…' : 'Subscribe'}</button>
        </form>
      </Container>
    </section>
  )
}
