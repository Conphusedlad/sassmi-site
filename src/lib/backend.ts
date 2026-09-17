/**
 * Data layer. `live` talks to the Hono API (/api/*). `preview` runs inside the claude.ai artifact
 * (no server): reviews/queries persist in the artifact's shared db when available, else localStorage,
 * and checkout is simulated so the family can walk through the flow.
 */
import { IS_ARTIFACT } from './env'
import { business } from '../../shared/config'
import { priceItems } from '../../shared/pricing'

export type SiteConfig = { paymentsEnabled: boolean; razorpayKeyId: string; demo: boolean }
export type ReviewPublic = { id: string; name: string; rating: number; text: string; productSlug: string | null; createdAt: string }
export type ReviewIn = { name: string; rating: number; text: string; productSlug?: string | null; website?: string; startedAt?: number }
export type QueryIn = { name: string; email: string; phone?: string; topic: string; message: string; website?: string }
export type CustomerIn = { name: string; email: string; phone: string; address1: string; address2?: string; city: string; state: string; pincode: string; note?: string }
export type OrderCreated = { orderId: string; rzpOrderId: string; amount: number; currency: string; keyId: string; prefill: { name: string; email: string; contact: string }; summary: { subtotal: number; shippingFee: number; total: number }; demo?: boolean }
export type OrderPublic = { id: string; status: string; amount: number; subtotal: number; shippingFee: number; items: { slug: string; name: string; qty: number; unitPrice: number }[]; customerName: string; email: string; createdAt: string }

export class ApiError extends Error {
  status: number
  issues?: string[]
  constructor(message: string, status: number, issues?: string[]) { super(message); this.status = status; this.issues = issues }
}

export interface Backend {
  mode: 'live' | 'preview'
  config(): Promise<SiteConfig>
  listReviews(productSlug?: string): Promise<ReviewPublic[]>
  postReview(r: ReviewIn): Promise<{ pending: boolean }>
  postQuery(q: QueryIn): Promise<{ ticket: string }>
  subscribe(email: string): Promise<{ added: boolean }>
  createOrder(items: { slug: string; qty: number }[], customer: CustomerIn): Promise<OrderCreated>
  verifyPayment(p: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }): Promise<{ order: OrderPublic }>
  getOrder(id: string, email?: string): Promise<OrderPublic | { id: string; status: string } | null>
  admin<T>(path: string, password: string, init?: RequestInit): Promise<T>
}

async function j<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } })
  const body = (await res.json().catch(() => ({}))) as { error?: string; issues?: string[] } & T
  if (!res.ok) throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status, body.issues)
  return body
}

const live: Backend = {
  mode: 'live',
  async config() { const c = await j<{ paymentsEnabled: boolean; razorpayKeyId: string }>('/api/config'); return { ...c, demo: false } },
  async listReviews(productSlug) { return (await j<{ reviews: ReviewPublic[] }>(`/api/reviews${productSlug ? `?product=${encodeURIComponent(productSlug)}` : ''}`)).reviews },
  postReview: (r) => j('/api/reviews', { method: 'POST', body: JSON.stringify(r) }),
  postQuery: (q) => j('/api/queries', { method: 'POST', body: JSON.stringify(q) }),
  subscribe: (email) => j('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
  createOrder: (items, customer) => j('/api/checkout/order', { method: 'POST', body: JSON.stringify({ items, customer }) }),
  verifyPayment: (p) => j('/api/checkout/verify', { method: 'POST', body: JSON.stringify(p) }),
  async getOrder(id, email) { try { return await j(`/api/orders/${encodeURIComponent(id)}${email ? `?email=${encodeURIComponent(email)}` : ''}`) } catch { return null } },
  admin: (path, password, init) => j(`/api/admin${path}`, { ...init, headers: { authorization: `Bearer ${password}` } }),
}

// ───────── preview (artifact) backend ─────────
type DocSnap = { id: string; exists: boolean; data(): Record<string, unknown> | undefined }
type Query = { orderBy(f: string, d?: 'asc' | 'desc'): Query; limit(n: number): Query; get(): Promise<{ docs: DocSnap[] }> }
type Collection = Query & { add(data: Record<string, unknown>): Promise<unknown> }
type Db = { collection(path: string): Collection }
declare global { interface Window { claude?: { use: (name: string) => Promise<unknown> } } }

let dbPromise: Promise<Db | null> | null = null
const getDb = () => {
  if (!dbPromise) dbPromise = (async () => {
    try {
      if (!window.claude) return null
      // never let an undeclared capability stall the page: fall back to localStorage after 1.5 s
      const timeout = new Promise<null>((r) => setTimeout(() => r(null), 1500))
      return (await Promise.race([window.claude.use('db') as Promise<Db | null>, timeout])) ?? null
    } catch { return null }
  })()
  return dbPromise
}
const lsGet = <T,>(k: string, d: T): T => { try { const r = localStorage.getItem(k); return r ? (JSON.parse(r) as T) : d } catch { return d } }
const lsSet = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }
const genId = () => Math.random().toString(36).slice(2, 10)
const ticketId = (p: string) => `${p}-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.random().toString(36).toUpperCase().slice(2, 5)}`

const preview: Backend = {
  mode: 'preview',
  async config() { return { paymentsEnabled: false, razorpayKeyId: '', demo: true } },
  async listReviews(productSlug) {
    const db = await getDb()
    let list: ReviewPublic[]
    if (db) {
      const snap = await db.collection('reviews').orderBy('createdAt', 'desc').limit(60).get()
      list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReviewPublic, 'id'>) }))
    } else list = lsGet<ReviewPublic[]>('sassmi.preview.reviews', [])
    return productSlug ? list.filter((r) => r.productSlug === productSlug) : list
  },
  async postReview(r) {
    const doc = { name: r.name, rating: r.rating, text: r.text, productSlug: r.productSlug ?? null, createdAt: new Date().toISOString() }
    const db = await getDb()
    if (db) await db.collection('reviews').add(doc)
    else lsSet('sassmi.preview.reviews', [{ id: genId(), ...doc }, ...lsGet<ReviewPublic[]>('sassmi.preview.reviews', [])])
    return { pending: false }
  },
  async postQuery(q) {
    const ticket = ticketId('SQ')
    const doc = { ...q, ticket, createdAt: new Date().toISOString() }
    const db = await getDb()
    if (db) await db.collection('queries').add(doc)
    else lsSet('sassmi.preview.queries', [doc, ...lsGet<unknown[]>('sassmi.preview.queries', [])])
    return { ticket }
  },
  async subscribe(email) {
    const db = await getDb()
    if (db) await db.collection('subscribers').add({ email, createdAt: new Date().toISOString() })
    else lsSet('sassmi.preview.subs', [email, ...lsGet<string[]>('sassmi.preview.subs', [])])
    return { added: true }
  },
  async createOrder(items, customer) {
    const priced = priceItems(items)
    const orderId = ticketId('SM')
    const order: OrderPublic = { id: orderId, status: 'paid', amount: priced.total * 100, subtotal: priced.subtotal, shippingFee: priced.shippingFee, items: priced.lines, customerName: customer.name, email: customer.email, createdAt: new Date().toISOString() }
    lsSet(`sassmi.preview.order.${orderId}`, order)
    return { orderId, rzpOrderId: 'order_DEMO', amount: order.amount, currency: 'INR', keyId: '', prefill: { name: customer.name, email: customer.email, contact: customer.phone }, summary: { subtotal: priced.subtotal, shippingFee: priced.shippingFee, total: priced.total }, demo: true }
  },
  async verifyPayment() { throw new ApiError('Demo mode', 400) },
  async getOrder(id) { return lsGet<OrderPublic | null>(`sassmi.preview.order.${id}`, null) },
  async admin() { throw new ApiError('The admin panel is available on the live site only.', 503) },
}

export const backend: Backend = IS_ARTIFACT ? preview : live
export const shippingInfo = business.shipping
