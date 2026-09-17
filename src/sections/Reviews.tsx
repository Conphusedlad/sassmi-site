import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { backend, type ReviewPublic } from '../lib/backend'
import { toast } from '../lib/toast'
import { Container, SectionHead } from '../components/ui/Section'
import { tins } from '../../shared/products'
import { fadeUp } from '../lib/motion'

function Stars({ n, size = 14, onPick, hover }: { n: number; size?: number; onPick?: (v: number) => void; hover?: (v: number) => void }) {
  return (
    <span className="inline-flex gap-0.5" role={onPick ? 'radiogroup' : 'img'} aria-label={onPick ? 'Rating' : `${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((v) => onPick ? (
        <button key={v} type="button" role="radio" aria-checked={v === n} onClick={() => onPick(v)} onMouseEnter={() => hover?.(v)} onMouseLeave={() => hover?.(0)} className="cursor-pointer" aria-label={`${v} star${v > 1 ? 's' : ''}`}>
          <Star size={size} className={v <= n ? 'fill-gold text-gold' : 'text-ink/20'} />
        </button>
      ) : (
        <Star key={v} size={size} aria-hidden className={v <= n ? 'fill-gold text-gold' : 'text-ink/20'} />
      ))}
    </span>
  )
}

export function Reviews({ productSlug }: { productSlug?: string }) {
  const [list, setList] = useState<ReviewPublic[] | null>(null)
  const [form, setForm] = useState({ name: '', rating: 5, text: '', productSlug: productSlug ?? '', website: '' })
  const [hover, setHover] = useState(0)
  const [busy, setBusy] = useState(false)
  const [startedAt] = useState(() => Date.now())

  useEffect(() => { let alive = true; backend.listReviews(productSlug).then((l) => { if (alive) setList(l) }).catch(() => { if (alive) setList([]) }); return () => { alive = false } }, [productSlug])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name.trim().length < 2) return toast('Please tell us your name', 'err')
    if (form.text.trim().length < 10) return toast('A few more words, please (at least 10 characters)', 'err')
    setBusy(true)
    try {
      const r = await backend.postReview({ ...form, productSlug: form.productSlug || null, startedAt })
      toast(r.pending ? 'Thank you! Your review will appear after a quick check by our team.' : 'Thank you! Your review is live.')
      setForm({ name: '', rating: 5, text: '', productSlug: productSlug ?? '', website: '' })
      if (!r.pending) setList(await backend.listReviews(productSlug))
    } catch (err) { toast((err as Error).message || 'Could not submit', 'err') }
    finally { setBusy(false) }
  }

  const avg = list && list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : null
  return (
    <section id="reviews" className="scroll-mt-20 bg-cream py-24 sm:py-32">
      <Container>
        <SectionHead kicker="Reviews" title="What people say between bites." sub={avg ? `${avg.toFixed(1)} out of 5 from ${list!.length} review${list!.length === 1 ? '' : 's'}` : 'Tried a tin? Tell us — and everyone else — what you thought.'} />
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {list === null && <p className="text-sm text-muted">Loading reviews…</p>}
            {list && list.length === 0 && (
              <div className="rounded-3xl border border-dashed border-ivory-2 p-10 text-center">
                <p className="font-display text-2xl italic text-ink-soft">No reviews yet.</p>
                <p className="mt-2 text-sm text-muted">Be the first — the form is right there.</p>
              </div>
            )}
            <ul className="grid gap-4 sm:grid-cols-2">
              {list?.map((r, i) => (
                <motion.li key={r.id} {...fadeUp((i % 2) * 0.06)} className="rounded-2xl border border-ivory-2 bg-ivory p-6 shadow-card">
                  <div className="flex items-center justify-between"><Stars n={r.rating} /><span className="text-[11px] uppercase tracking-[.15em] text-muted">{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span></div>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">“{r.text}”</p>
                  <p className="mt-4 font-display text-lg">{r.name}{r.productSlug && <span className="ml-2 text-sm italic text-muted">on {tins.find((t) => t.slug === r.productSlug)?.name ?? r.productSlug}</span>}</p>
                </motion.li>
              ))}
            </ul>
          </div>
          <motion.form {...fadeUp(0.1)} onSubmit={submit} className="rounded-3xl bg-night p-7 text-ivory shadow-tin lg:col-span-5 sm:p-9">
            <p className="kicker">Write a review</p>
            <h3 className="mt-2 text-3xl text-ivory">Your two paise.</h3>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[.2em] text-ivory/60">Rating</label>
                <Stars n={hover || form.rating} size={24} onPick={(v) => setForm({ ...form, rating: v })} hover={setHover} />
              </div>
              <input className="input input-dark" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} required />
              {!productSlug && (
                <select className="input input-dark" value={form.productSlug} onChange={(e) => setForm({ ...form, productSlug: e.target.value })} aria-label="Which flavour?">
                  <option value="">Which flavour? (optional)</option>
                  {tins.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                </select>
              )}
              <textarea className="input input-dark min-h-[120px]" placeholder="What did you think?" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} maxLength={800} required />
              <input type="text" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
              <button className="btn btn-gold w-full" disabled={busy}>{busy ? 'Sending…' : 'Post review'}</button>
              <p className="text-[11px] leading-relaxed text-ivory/45">Reviews are checked by a person before they appear. We never edit the words, only remove spam.</p>
            </div>
          </motion.form>
        </div>
      </Container>
    </section>
  )
}
