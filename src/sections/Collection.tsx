import { useState } from 'react'
import { products } from '../../shared/products'
import { ProductCard } from '../components/ProductCard'
import { Container, SectionHead } from '../components/ui/Section'

const FILTERS = [
  { key: 'all', label: 'All nine' },
  { key: 'savoury', label: 'Savoury' },
  { key: 'sweet', label: 'Sweet' },
  { key: 'spicy', label: 'Spicy' },
] as const

export function Collection() {
  const [f, setF] = useState<(typeof FILTERS)[number]['key']>('all')
  const list = products.filter((p) => f === 'all' || p.kind === 'bundle' ? true : p.profile === f).filter((p) => (f === 'all' ? true : p.kind === 'tin'))
  return (
    <section id="collection" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
      <Container>
        <SectionHead kicker="The collection" title={<>Nine flavours.<br />One midnight tin.</>} sub="Every tin starts with the same plump, evenly-popped makhana from Mithila. Then it goes somewhere different." />
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {FILTERS.map((x) => (
            <button key={x.key} onClick={() => setF(x.key)} className={`rounded-full border px-5 py-2 text-[11px] font-medium uppercase tracking-[.2em] transition ${f === x.key ? 'border-night bg-night text-ivory' : 'border-ink/15 text-ink-soft hover:border-gold hover:text-gold-deep'}`}>{x.label}</button>
          ))}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}
        </div>
        <p className="mt-10 text-center text-xs text-muted">Prices inclusive of all taxes · Free shipping on orders above ₹499 · Ships across India</p>
      </Container>
    </section>
  )
}
