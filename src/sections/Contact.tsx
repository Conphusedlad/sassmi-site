import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { backend, ApiError, FORMS_OFFLINE } from '../lib/backend'
import { toast } from '../lib/toast'
import { Container, SectionHead } from '../components/ui/Section'
import { business, queryTopics, whatsappLink, type QueryTopic } from '../../shared/config'
import { fadeUp } from '../lib/motion'

export function Contact() {
  const loc = useLocation()
  const prefill = (loc.state as { topic?: QueryTopic } | null)?.topic ?? null
  const [form, setForm] = useState<{ name: string; email: string; phone: string; topic: QueryTopic; message: string; website: string }>({ name: '', email: '', phone: '', topic: 'Something else', message: '', website: '' })
  const [busy, setBusy] = useState(false)
  const [ticket, setTicket] = useState<string | null>(null)
  useEffect(() => { if (prefill && (queryTopics as readonly string[]).includes(prefill)) setForm((f) => ({ ...f, topic: prefill })) }, [prefill])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.message.trim().length < 10) return toast('Tell us a little more (at least 10 characters)', 'err')
    if (FORMS_OFFLINE) {
      const contact = [form.email, form.phone].filter(Boolean).join(' · ')
      const text = `Hi Sassmi! I'm ${form.name.trim()}.\nTopic: ${form.topic}\n\n${form.message.trim()}${contact ? `\n\n${contact}` : ''}`
      window.open(whatsappLink(text), '_blank', 'noopener')
      return
    }
    setBusy(true)
    try {
      const r = await backend.postQuery({ ...form, phone: form.phone.replace(/\D/g, '').slice(-10) })
      setTicket(r.ticket)
      setForm({ name: '', email: '', phone: '', topic: 'Something else', message: '', website: '' })
    } catch (err) { toast(err instanceof ApiError && err.issues?.length ? `${err.message} ${err.issues[0]}` : (err as Error).message || 'Could not send', 'err') }
    finally { setBusy(false) }
  }

  return (
    <section id="contact" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
      <Container>
        <SectionHead kicker="Contact" title="Write to us. A person replies." sub="Orders, bulk gifting, distribution, press — or just to tell us which flavour won." />
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <motion.div {...fadeUp()} className="space-y-6 lg:col-span-5">
            <a href={whatsappLink('Hi Sassmi!')} target="_blank" rel="noreferrer" className="flex items-start gap-4 rounded-2xl bg-night p-6 text-ivory shadow-card transition hover:-translate-y-0.5">
              <MessageCircle className="mt-0.5 shrink-0 text-gold" strokeWidth={1.4} />
              <div><p className="kicker">WhatsApp</p><p className="mt-1 font-display text-2xl">{business.contact.phoneDisplay}</p><p className="text-xs text-ivory/60">Fastest way to reach us</p></div>
            </a>
            <ul className="space-y-4 text-[15px] text-ink-soft">
              <li className="flex gap-4"><Phone className="mt-0.5 shrink-0 text-gold-deep" size={18} strokeWidth={1.5} /><a className="hover:text-gold-deep" href={`tel:${business.contact.phoneE164}`}>{business.contact.phoneDisplay}</a></li>
              <li className="flex gap-4"><Mail className="mt-0.5 shrink-0 text-gold-deep" size={18} strokeWidth={1.5} /><a className="hover:text-gold-deep" href={`mailto:${business.contact.email}`}>{business.contact.email}</a></li>
              <li className="flex gap-4"><Clock className="mt-0.5 shrink-0 text-gold-deep" size={18} strokeWidth={1.5} />{business.contact.hours}</li>
              <li className="flex gap-4"><MapPin className="mt-0.5 shrink-0 text-gold-deep" size={18} strokeWidth={1.5} /><span>{business.operator.name}<br />{business.operator.address}</span></li>
              <li className="flex gap-4"><ShieldCheck className="mt-0.5 shrink-0 text-gold-deep" size={18} strokeWidth={1.5} /><span>FSSAI Lic. No. {business.operator.fssai}<br />GSTIN {business.operator.gstin}</span></li>
            </ul>
            <p className="text-xs leading-relaxed text-muted">Grievance officer: {business.grievance.name}, {business.grievance.designation} · {business.grievance.email} · {business.grievance.phone}. We acknowledge every complaint within 48 hours and aim to resolve it within one month, as required under the Consumer Protection (E-Commerce) Rules, 2020.</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="lg:col-span-7">
            {ticket ? (
              <div className="rounded-3xl border border-gold/40 bg-cream p-10 text-center shadow-card">
                <p className="kicker">Received</p>
                <h3 className="mt-3 text-4xl">Thank you. Your ticket is {ticket}.</h3>
                <p className="mt-4 text-ink-soft">We’ve emailed you an acknowledgement and will reply within 48 hours. Need us faster? WhatsApp {business.contact.phoneDisplay}.</p>
                <button className="btn btn-outline-ink mt-8" onClick={() => setTicket(null)}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-ivory-2 bg-cream p-7 shadow-card sm:grid-cols-2 sm:p-9">
                <input className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={80} />
                <input className="input" type="email" placeholder={FORMS_OFFLINE ? 'Email (optional)' : 'Email'} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required={!FORMS_OFFLINE} maxLength={120} />
                <input className="input" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={15} />
                <select className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value as QueryTopic })} aria-label="Topic">
                  {queryTopics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <textarea className="input min-h-[140px] sm:col-span-2" placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={2000} />
                <input type="text" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-muted">{FORMS_OFFLINE ? 'This opens WhatsApp with your message ready to send.' : 'By sending, you agree to our privacy policy. We use your details only to reply.'}</p>
                  <button className="btn btn-night max-w-full whitespace-normal !px-5 sm:!px-[30px]" disabled={busy}>{FORMS_OFFLINE ? <><MessageCircle size={15} /> Send on WhatsApp</> : busy ? 'Sending…' : 'Send message'}</button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
