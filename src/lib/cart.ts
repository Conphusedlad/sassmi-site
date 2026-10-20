import { useSyncExternalStore } from 'react'
import { priceItems } from '../../shared/pricing'
import { bySlug, type Product } from '../../shared/products'
import { IS_SHOPIFY } from './env'
import { toast } from './toast'
import * as shop from './shopify'

export type CartItem = { slug: string; qty: number }
/** One drawer row. `product` is set for catalogue items; a line that exists only in Shopify carries its own name, price and image. */
export type CartLine = { slug: string; qty: number; name: string; unitPrice: number; product?: Product; image?: string | null }
export const MAX_QTY = 12
const KEY = 'sassmi.cart.v1'

const load = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as CartItem[]) : []
    return list.filter((i) => bySlug(i.slug) && i.qty > 0) // drop items from an older catalogue
  } catch { return [] }
}
// On Shopify the server cart is the truth: an empty Shopify cart (e.g. right after an order) must not resurrect the local copy
let items: CartItem[] = IS_SHOPIFY && typeof window !== 'undefined' && window.SASSMI_SHOP?.cartCount === 0 ? [] : load()
const listeners = new Set<() => void>()
const emit = () => { try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* private mode */ } listeners.forEach((l) => l()) }
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
const get = () => items

// ── Shopify write-through (theme build only) ──
// The local list stays the UI's source of truth so every button responds instantly; each change is then queued
// to Shopify's cart in order, and once the queue drains the local list is replaced by what Shopify actually holds.
// Prices come from Shopify's cart (final_price) so the drawer always agrees with checkout.
let shopCart: shop.ShopifyCart | null = null
const getShopCart = () => shopCart
const fromShopify = (c: shop.ShopifyCart): CartItem[] => {
  const merged = new Map<string, number>()
  for (const i of c.items) merged.set(i.handle, (merged.get(i.handle) ?? 0) + i.quantity) // every line, catalogue or not
  return [...merged].map(([slug, qty]) => ({ slug, qty }))
}
let chain: Promise<void> = Promise.resolve()
let pending = 0
const sync = (job: () => Promise<shop.ShopifyCart>, opts: { silent?: boolean } = {}) => {
  if (!IS_SHOPIFY) return
  pending++
  chain = chain
    .then(job)
    .then((c) => { shopCart = c; if (pending === 1) { items = fromShopify(c); emit() } })
    .catch(async (e: unknown) => {
      if (!opts.silent) toast(e instanceof Error ? e.message : 'The cart could not be updated', 'err')
      try { const c = await shop.readCart(); shopCart = c; if (pending === 1) { items = fromShopify(c); emit() } } catch { /* offline: keep the local list */ }
    })
    .finally(() => { pending-- })
}
/** Resolves once every queued Shopify cart change has landed — await before handing off to checkout. */
export const cartSettled = () => chain
/** Number of Shopify cart changes still in flight. */
export const cartPending = () => pending
if (IS_SHOPIFY && typeof window !== 'undefined') {
  sync(() => shop.readCart(), { silent: true })
  // coming back via the bfcache (browser Back from checkout) must re-read the cart Shopify may have emptied
  window.addEventListener('pageshow', (e) => { if (e.persisted) sync(() => shop.readCart(), { silent: true }) })
}
// keep two open tabs in sync
if (typeof window !== 'undefined') window.addEventListener('storage', (e) => { if (e.key !== KEY) return; if (IS_SHOPIFY) sync(() => shop.readCart(), { silent: true }); else { items = load(); listeners.forEach((l) => l()) } })

const qtyOf = (slug: string) => items.find((i) => i.slug === slug)?.qty ?? 0

export const cart = {
  add(slug: string, qty = 1) {
    const ex = items.find((i) => i.slug === slug)
    items = ex ? items.map((i) => (i.slug === slug ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i)) : [...items, { slug, qty: Math.min(MAX_QTY, qty) }]
    emit()
    const target = qtyOf(slug); sync(() => shop.setLine(slug, target))
  },
  setQty(slug: string, qty: number) {
    items = qty <= 0 ? items.filter((i) => i.slug !== slug) : items.map((i) => (i.slug === slug ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    emit()
    const target = qtyOf(slug); sync(() => shop.setLine(slug, target))
  },
  remove(slug: string) { items = items.filter((i) => i.slug !== slug); emit(); sync(() => shop.setLine(slug, 0)) },
  clear() { items = []; emit(); sync(() => shop.clearCart()) },
}

const displayName = (p: Product) => p.name
function priceLocal(list: CartItem[]) {
  const priced = priceItems(list)
  const lines: CartLine[] = priced.lines.map((l) => { const p = bySlug(l.slug)!; return { slug: l.slug, qty: l.qty, name: displayName(p), unitPrice: l.unitPrice, product: p } })
  return { lines, subtotal: priced.subtotal, shippingFee: priced.shippingFee, total: priced.total, shippingAtCheckout: false }
}
/** Shopify: unit prices from the live cart (paise → rupees); the catalogue only fills in while a line is still being added. */
function priceShopify(list: CartItem[], c: shop.ShopifyCart | null) {
  const lines: CartLine[] = []
  for (const it of list) {
    const p = bySlug(it.slug)
    const sl = c?.items.find((i) => i.handle === it.slug)
    if (!p && !sl) continue
    lines.push({ slug: it.slug, qty: it.qty, name: p ? displayName(p) : sl!.product_title, unitPrice: sl ? sl.final_price / 100 : p!.price, product: p, image: sl?.image ?? null })
  }
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0)
  return { lines, subtotal, shippingFee: 0, total: subtotal, shippingAtCheckout: true }
}

export function useCart() {
  const list = useSyncExternalStore(subscribe, get, get)
  const sc = useSyncExternalStore(subscribe, getShopCart, getShopCart)
  const priced = IS_SHOPIFY ? priceShopify(list, sc) : priceLocal(list)
  const count = list.reduce((s, i) => s + i.qty, 0)
  return { items: list, count, ...priced }
}

// ── lightweight UI store (drawer / quick view) ──
type UI = { cartOpen: boolean; quickView: string | null }
let ui: UI = { cartOpen: false, quickView: null }
const uiListeners = new Set<() => void>()
const uiEmit = () => uiListeners.forEach((l) => l())
export const uiStore = {
  openCart() { ui = { ...ui, cartOpen: true }; uiEmit() },
  closeCart() { ui = { ...ui, cartOpen: false }; uiEmit() },
  quickView(slug: string | null) { ui = { ...ui, quickView: slug }; uiEmit() },
}
export const useUI = () => useSyncExternalStore((l) => { uiListeners.add(l); return () => { uiListeners.delete(l) } }, () => ui, () => ui)
