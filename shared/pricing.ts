import { bySlug } from './products'
import { business } from './config'

export type PricedLine = { slug: string; name: string; qty: number; unitPrice: number }

/** Prices a cart from the catalogue — used by BOTH the browser (display) and the server (authoritative). */
export function priceItems(items: { slug: string; qty: number }[]) {
  const lines: PricedLine[] = []
  for (const it of items) {
    const p = bySlug(it.slug)
    if (!p) throw new Error(`Unknown product: ${it.slug}`)
    lines.push({ slug: p.slug, name: p.kind === 'tin' ? `${p.name} (${p.netWeight})` : p.name, qty: it.qty, unitPrice: p.price })
  }
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0)
  const shippingFee = subtotal === 0 || subtotal >= business.shipping.freeAbove ? 0 : business.shipping.flatFee
  return { lines, subtotal, shippingFee, total: subtotal + shippingFee }
}
