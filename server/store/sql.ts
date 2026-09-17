import type { Customer, Order, OrderItem, Query, Review, Store, Subscriber } from './types'

/** Minimal driver interface: `$1..$n` placeholders (converted to `?` for SQLite). */
export interface Driver {
  all<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>
  run(sql: string, params?: unknown[]): Promise<void>
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    rzp_order_id TEXT UNIQUE NOT NULL,
    rzp_payment_id TEXT,
    status TEXT NOT NULL,
    amount INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping_fee INTEGER NOT NULL,
    items TEXT NOT NULL,
    customer TEXT NOT NULL,
    paid_via TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    product_slug TEXT,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS queries (
    id TEXT PRIMARY KEY,
    ticket TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
]

const now = () => new Date().toISOString()

type OrderRow = {
  id: string; rzp_order_id: string; rzp_payment_id: string | null; status: string; amount: number
  subtotal: number; shipping_fee: number; items: string; customer: string; paid_via: string | null
  created_at: string; updated_at: string
}
type ReviewRow = { id: string; name: string; rating: number; text: string; product_slug: string | null; approved: number | boolean; created_at: string }
type QueryRow = { id: string; ticket: string; name: string; email: string; phone: string | null; topic: string; message: string; status: string; created_at: string }

const toOrder = (r: OrderRow): Order => ({
  id: r.id, rzpOrderId: r.rzp_order_id, rzpPaymentId: r.rzp_payment_id, status: r.status as Order['status'],
  amount: Number(r.amount), subtotal: Number(r.subtotal), shippingFee: Number(r.shipping_fee),
  items: JSON.parse(r.items) as OrderItem[], customer: JSON.parse(r.customer) as Customer,
  paidVia: r.paid_via, createdAt: r.created_at, updatedAt: r.updated_at,
})
const toReview = (r: ReviewRow): Review => ({
  id: r.id, name: r.name, rating: Number(r.rating), text: r.text, productSlug: r.product_slug,
  approved: Boolean(Number(r.approved)), createdAt: r.created_at,
})
const toQuery = (r: QueryRow): Query => ({
  id: r.id, ticket: r.ticket, name: r.name, email: r.email, phone: r.phone, topic: r.topic, message: r.message,
  status: r.status as Query['status'], createdAt: r.created_at,
})

export class SqlStore implements Store {
  constructor(private db: Driver) {}

  async init() { for (const s of SCHEMA) await this.db.run(s) }

  async createOrder(o: Omit<Order, 'createdAt' | 'updatedAt'>) {
    const t = now()
    await this.db.run(
      `INSERT INTO orders (id, rzp_order_id, rzp_payment_id, status, amount, subtotal, shipping_fee, items, customer, paid_via, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [o.id, o.rzpOrderId, o.rzpPaymentId, o.status, o.amount, o.subtotal, o.shippingFee, JSON.stringify(o.items), JSON.stringify(o.customer), o.paidVia, t, t],
    )
    return { ...o, createdAt: t, updatedAt: t }
  }
  async getOrder(rzpOrderId: string) {
    const rows = await this.db.all<OrderRow>(`SELECT * FROM orders WHERE rzp_order_id = $1`, [rzpOrderId])
    return rows[0] ? toOrder(rows[0]) : null
  }
  async getOrderById(id: string) {
    const rows = await this.db.all<OrderRow>(`SELECT * FROM orders WHERE id = $1`, [id])
    return rows[0] ? toOrder(rows[0]) : null
  }
  async markOrderPaid(rzpOrderId: string, paymentId: string, via: string) {
    const rows = await this.db.all<{ id: string }>(
      `UPDATE orders SET status = 'paid', rzp_payment_id = $1, paid_via = $2, updated_at = $3 WHERE rzp_order_id = $4 AND status <> 'paid' RETURNING id`,
      [paymentId, via, now(), rzpOrderId],
    )
    return { order: await this.getOrder(rzpOrderId), transitioned: rows.length > 0 }
  }
  async markOrderFailed(rzpOrderId: string) {
    await this.db.run(`UPDATE orders SET status = 'failed', updated_at = $1 WHERE rzp_order_id = $2 AND status = 'created'`, [now(), rzpOrderId])
  }
  async listOrders(limit = 200) {
    const rows = await this.db.all<OrderRow>(`SELECT * FROM orders ORDER BY created_at DESC LIMIT $1`, [limit])
    return rows.map(toOrder)
  }

  async addReview(r: Omit<Review, 'createdAt'>) {
    const t = now()
    await this.db.run(
      `INSERT INTO reviews (id, name, rating, text, product_slug, approved, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [r.id, r.name, r.rating, r.text, r.productSlug, r.approved ? 1 : 0, t],
    )
    return { ...r, createdAt: t }
  }
  async listReviews({ approvedOnly, productSlug, limit = 100 }: { approvedOnly: boolean; productSlug?: string; limit?: number }) {
    const where: string[] = []; const params: unknown[] = []
    if (approvedOnly) where.push(`approved = 1`)
    if (productSlug) { params.push(productSlug); where.push(`product_slug = $${params.length}`) }
    params.push(limit)
    const rows = await this.db.all<ReviewRow>(
      `SELECT * FROM reviews ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT $${params.length}`, params,
    )
    return rows.map(toReview)
  }
  async setReviewApproved(id: string, approved: boolean) {
    await this.db.run(`UPDATE reviews SET approved = $1 WHERE id = $2`, [approved ? 1 : 0, id])
  }
  async deleteReview(id: string) { await this.db.run(`DELETE FROM reviews WHERE id = $1`, [id]) }

  async addQuery(q: Omit<Query, 'createdAt'>) {
    const t = now()
    await this.db.run(
      `INSERT INTO queries (id, ticket, name, email, phone, topic, message, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [q.id, q.ticket, q.name, q.email, q.phone, q.topic, q.message, q.status, t],
    )
    return { ...q, createdAt: t }
  }
  async listQueries(limit = 200) {
    const rows = await this.db.all<QueryRow>(`SELECT * FROM queries ORDER BY created_at DESC LIMIT $1`, [limit])
    return rows.map(toQuery)
  }
  async setQueryStatus(id: string, status: Query['status']) {
    await this.db.run(`UPDATE queries SET status = $1 WHERE id = $2`, [status, id])
  }

  async addSubscriber(email: string) {
    const rows = await this.db.all(`INSERT INTO subscribers (email, created_at) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING RETURNING email`, [email, now()])
    return rows.length > 0
  }
  async listSubscribers() {
    return this.db.all<Subscriber & { created_at: string }>(`SELECT email, created_at FROM subscribers ORDER BY created_at DESC`)
      .then((rows) => rows.map((r) => ({ email: r.email, createdAt: r.created_at })))
  }

  async claimWebhookEvent(eventId: string, type: string) {
    const rows = await this.db.all(`INSERT INTO webhook_events (id, type, created_at) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING RETURNING id`, [eventId, type, now()])
    return rows.length > 0
  }
  async releaseWebhookEvent(eventId: string) { await this.db.run(`DELETE FROM webhook_events WHERE id = $1`, [eventId]) }
}
