import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, MessageCircle, ShoppingBag, X } from 'lucide-react'
import { Wordmark } from './Wordmark'
import { useCart, uiStore } from '../lib/cart'
import { business, whatsappLink } from '../../shared/config'
import { EASE } from '../lib/motion'

const LINKS = [
  { to: '/#collection', label: 'Collection' },
  { to: '/#story', label: 'Story' },
  { to: '/#gifting', label: 'Gifting' },
  { to: '/#flavour-works', label: 'Flavour Works' },
  { to: '/crunchy-makhana', label: 'Crunchy Makhana' },
  { to: '/#contact', label: 'Contact' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { pathname } = useLocation()

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' ; return () => { document.body.style.overflow = '' } }, [open])

  const solid = scrolled || pathname !== '/' || open
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 text-ivory transition-[background-color,border-color,backdrop-filter] duration-500 ${solid ? 'border-b border-gold/15 bg-night/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent'}`}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="Sassmi — home" className="flex items-center gap-3">
            <Wordmark className="h-7 w-auto" />
            <span className="hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[.3em] text-gold xl:block">Premium Makhana</span>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Primary">
            {LINKS.map((l) => <Link key={l.to} to={l.to} className="nav-link whitespace-nowrap text-ivory/85 hover:text-ivory">{l.label}</Link>)}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href={whatsappLink('Hi Sassmi! I have a question about your makhana.')} target="_blank" rel="noreferrer" className="hidden h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/80 transition hover:border-gold hover:text-gold sm:flex" aria-label={`WhatsApp ${business.contact.phoneDisplay}`}>
              <MessageCircle size={18} strokeWidth={1.6} />
            </a>
            <button onClick={uiStore.openCart} className="relative flex h-10 items-center gap-2 rounded-full border border-ivory/15 px-3 text-ivory/90 transition hover:border-gold hover:text-gold sm:px-4" aria-label={`Open cart, ${count} items`}>
              <ShoppingBag size={18} strokeWidth={1.6} />
              <span className="hidden text-[11px] font-medium uppercase tracking-[.2em] sm:inline">Cart</span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span key={count} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                    className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold text-night tabular-nums">{count}</motion.span>
                )}
              </AnimatePresence>
            </button>
            <button onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="fixed inset-0 z-40 flex flex-col bg-night pt-[72px] text-ivory lg:hidden">
            <nav className="flex flex-1 flex-col justify-center gap-2 px-8" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease: EASE }}>
                  <Link to={l.to} onClick={() => setOpen(false)} className="block border-b border-ivory/10 py-4 font-display text-4xl font-medium hover:text-gold">{l.label}</Link>
                </motion.div>
              ))}
            </nav>
            <div className="px-8 pb-10 text-sm text-ivory/60">
              <a className="block hover:text-gold" href={`tel:${business.contact.phoneE164}`}>{business.contact.phoneDisplay}</a>
              <a className="block hover:text-gold" href={`mailto:${business.contact.email}`}>{business.contact.email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
