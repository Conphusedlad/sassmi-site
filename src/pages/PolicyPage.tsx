import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import { business } from '../../shared/config'
import { Container } from '../components/ui/Section'
import NotFound from './NotFound'

const files = import.meta.glob('../content/policies/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const TITLES: Record<string, string> = { privacy: 'Privacy Policy', terms: 'Terms & Conditions', shipping: 'Shipping Policy', refunds: 'Refund & Cancellation Policy', grievance: 'Grievance Redressal' }

const vars: Record<string, string> = {
  BRAND: business.brand, OPERATOR: business.operator.name, OPERATOR_ADDRESS: business.operator.address, PROPRIETOR: business.operator.proprietor,
  FSSAI: business.operator.fssai, GSTIN: business.operator.gstin, OWNER: business.owner.name, OWNER_FORMERLY: business.owner.formerly, CIN: business.owner.cin, OWNER_ADDRESS: business.owner.address,
  PHONE: business.contact.phoneDisplay, EMAIL: business.contact.email, HOURS: business.contact.hours, DOMAIN: business.domain,
  GRIEVANCE_NAME: business.grievance.name, GRIEVANCE_DESIGNATION: business.grievance.designation, GRIEVANCE_EMAIL: business.grievance.email, GRIEVANCE_PHONE: business.grievance.phone,
  SHIPPING_FEE: String(business.shipping.flatFee), FREE_ABOVE: String(business.shipping.freeAbove), ETA: business.shipping.etaDays, UPDATED: '17 September 2026',
}
const fill = (md: string) => md.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? `{{${k}}}`)

export default function PolicyPage() {
  const { slug = '' } = useParams()
  const raw = files[`../content/policies/${slug}.md`]
  const html = useMemo(() => (raw ? (marked.parse(fill(raw), { async: false }) as string) : ''), [raw])
  useEffect(() => { if (TITLES[slug]) document.title = `${TITLES[slug]} — Sassmi`; return () => { document.title = 'Sassmi — Premium Makhana, Rooted in Mithila' } }, [slug])
  if (!raw) return <NotFound />
  return (
    <section className="bg-ivory pb-24 pt-32">
      <Container max="max-w-3xl">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[.2em] text-muted" aria-label="Policies">
          {Object.entries(TITLES).map(([s, t]) => <Link key={s} to={`/policies/${s}`} className={s === slug ? 'text-gold-deep' : 'hover:text-ink'}>{t}</Link>)}
        </nav>
        <h1 className="mt-6 text-5xl">{TITLES[slug]}</h1>
        <p className="mt-2 text-sm text-muted">Last updated {vars.UPDATED}</p>
        <article className="policy mt-10" dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
    </section>
  )
}
