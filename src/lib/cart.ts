import { useSyncExternalStore } from 'react'
import { priceItems } from '../../shared/pricing'
import { bySlug } from '../../shared/products'

export type CartItem = { slug: string; qty: number }
export const MAX_QTY = 12
const KEY = 'sassmi.cart.v1'

const load = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as CartItem[]) : []
    return list.filter((i) => bySlug(i.slug) && i.qty > 0) // drop items from an older catalogue
  } catch { return [] }
}
let items: CartItem[] = load()
const listeners = new Set<() => void>()
const emit = () => { try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* private mode */ } listeners.forEach((l) => l()) }
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
// keep two open tabs in sync
if (typeof window !== 'undefined') window.addEventListener('storage', (e) => { if (e.key === KEY) { items = load(); listeners.forEach((l) => l()) } })
const get = () => items

export const cart = {
  add(slug: string, qty = 1) {
    const ex = items.find((i) => i.slug === slug)
    items = ex ? items.map((i) => (i.slug === slug ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i)) : [...items, { slug, qty: Math.min(MAX_QTY, qty) }]
    emit()
  },
  setQty(slug: string, qty: number) {
    items = qty <= 0 ? items.filter((i) => i.slug !== slug) : items.map((i) => (i.slug === slug ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    emit()
  },
  remove(slug: string) { items = items.filter((i) => i.slug !== slug); emit() },
  clear() { items = []; emit() },
}

export function useCart() {
  const list = useSyncExternalStore(subscribe, get, get)
  const priced = priceItems(list)
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
