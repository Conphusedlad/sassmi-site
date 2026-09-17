import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Wordmark } from './Wordmark'
import { Ripples } from './MithilaArt'
import { tins } from '../../shared/products'
import { business, whatsappLink } from '../../shared/config'
import { introStore } from '../lib/intro'
import { asset } from '../lib/env'

const POLICIES = [
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'terms', label: 'Terms & Conditions' },
  { slug: 'shipping', label: 'Shipping Policy' },
  { slug: 'refunds', label: 'Refund & Cancellation' },
]

const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
)

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night text-ivory">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center opacity-80">
        <img src={asset('/img/art/gold-strip.png')} alt="" className="h-7 w-auto max-w-none" aria-hidden />
      </div>
      <Ripples className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-gold opacity-20" rows={4} />
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark className="h-10 w-auto" />
            <p className="mt-5 max-w-sm font-display text-2xl italic text-ivory/80">Rooted in Mithila. Crafted for today.</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/55">Premium roasted makhana in nine flavours, sourced from the ponds of Mithila and roasted in small batches in New Delhi.</p>
            <div className="mt-6 flex gap-3">
              <a href={whatsappLink('Hi Sassmi!')} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/80 transition hover:border-gold hover:text-gold" aria-label="WhatsApp"><MessageCircle size={17} strokeWidth={1.6} /></a>
              {business.social.instagramSassmi && <a href={business.social.instagramSassmi} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/80 transition hover:border-gold hover:text-gold" aria-label="Instagram"><InstagramIcon /></a>}
            </div>
          </div>
          <div className="md:col-span-2">
            <h4 className="kicker">Shop</h4>
            <ul className="mt-5 space-y-2.5 text-sm text-ivory/70">
              {tins.map((p) => <li key={p.slug}><Link className="hover:text-gold" to={`/product/${p.slug}`}>{p.name}</Link></li>)}
              <li><Link className="hover:text-gold" to="/product/nocturne-trio">The Nocturne Trio</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="kicker">Company</h4>
            <ul className="mt-5 space-y-2.5 text-sm text-ivory/70">
              <li><Link className="hover:text-gold" to="/#story">Our story</Link></li>
              <li><Link className="hover:text-gold" to="/#gifting">Gifting & bulk</Link></li>
              <li><Link className="hover:text-gold" to="/crunchy-makhana">Crunchy Makhana</Link></li>
              <li><Link className="hover:text-gold" to="/#reviews">Reviews</Link></li>
              <li><Link className="hover:text-gold" to="/#faq">FAQ</Link></li>
              <li><Link className="hover:text-gold" to="/#contact">Contact</Link></li>
              <li><button className="hover:text-gold" onClick={introStore.replay}>Replay the intro ✦</button></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h4 className="kicker">Legal</h4>
            <ul className="mt-5 space-y-2.5 text-sm text-ivory/70">
              {POLICIES.map((p) => <li key={p.slug}><Link className="hover:text-gold" to={`/policies/${p.slug}`}>{p.label}</Link></li>)}
              <li><Link className="hover:text-gold" to="/policies/grievance">Grievance officer</Link></li>
            </ul>
            <h4 className="kicker mt-8">Contact</h4>
            <ul className="mt-4 space-y-1.5 text-sm text-ivory/70">
              <li><a className="hover:text-gold" href={`tel:${business.contact.phoneE164}`}>{business.contact.phoneDisplay}</a></li>
              <li><a className="hover:text-gold" href={`mailto:${business.contact.email}`}>{business.contact.email}</a></li>
              <li className="text-ivory/50">{business.contact.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-ivory/10 pt-8 text-[12.5px] leading-relaxed text-ivory/45">
          <p><span className="text-ivory/70">Manufactured & marketed by</span> {business.operator.name} · {business.operator.address} · FSSAI Lic. No. {business.operator.fssai} · GSTIN {business.operator.gstin}</p>
          <p className="mt-2">{business.brandLegal} is a brand of {business.owner.name} ({business.owner.formerly}) · CIN {business.owner.cin} · {business.owner.address}</p>
          <p className="mt-2">Country of origin: India · All prices are inclusive of taxes · © {new Date().getFullYear()} {business.owner.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
