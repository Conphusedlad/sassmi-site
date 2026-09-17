import { Hono } from 'hono'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { env, paymentsEnabled, webhookEnabled } from './env'
import { getStore } from './store'
import { createRazorpayOrder, fetchPayment, verifyPaymentSignature, verifyWebhookSignature } from './razorpay'
import { sendOrderEmails, sendQueryEmails } from './mail'
import { waitUntil } from '@vercel/functions'

/** Run side-effects (emails) after the response is sent on Vercel; just runs in the background elsewhere. */
const defer = (p: Promise<unknown>) => { const guarded = p.catch((e) => console.error('[defer]', e)); try { waitUntil(guarded) } catch { /* not on Vercel */ } }
import { bySlug } from '../shared/products'
import { priceItems } from '../shared/pricing'
import { business, queryTopics } from '../shared/config'
import type { Customer, Order } from './store/types'

const app = new Hono().basePath('/api')

// ───────────────────────── helpers ─────────────────────────
const rid = (prefix: string) => {
  const t = Date.now().toString(36).toUpperCase().slice(-6)
  const r = randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}-${t}${r}`
}
const uuid = () => crypto.randomUUID()

// best-effort in-memory rate limit (per serverless instance)
const buckets = new Map<string, { n: number; t: number }>()
const rateLimit = (key: string, max: number, windowMs = 60_000) => {
  const now = Date.now(); const b = buckets.get(key)
  if (buckets.size > 5000) for (const [k, v] of buckets) if (now - v.t > windowMs) buckets.delete(k)
  if (!b || now - b.t > windowMs) { buckets.set(key, { n: 1, t: now }); return true }
  b.n += 1; return b.n <= max
}
const ipOf = (c: { req: { header: (k: string) => string | undefined } }) =>
  (c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'local').split(',')[0].trim()

const honeypot = z.string().max(0).optional() // must stay empty
const phoneIN = z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number')

// every JSON-writing route must say so (blocks form-post CSRF and sloppy clients); the webhook also sends JSON
app.use('/api/*', async (c, next) => {
  if (['POST', 'PATCH', 'PUT'].includes(c.req.method) && !(c.req.header('content-type') ?? '').toLowerCase().startsWith('application/json')) return c.json({ error: 'Expected application/json' }, 415)
  await next()
})

// ───────────────────────── public ─────────────────────────
app.get('/health', (c) => c.json({ ok: true, time: new Date().toISOString(), payments: paymentsEnabled(), webhook: webhookEnabled(), admin: Boolean(env.adminPassword), db: env.databaseUrl ? 'postgres' : env.isBun ? 'sqlite' : 'none' }))

app.get('/config', (c) => c.json({
  paymentsEnabled: paymentsEnabled(),
  razorpayKeyId: env.razorpayKeyId,
  shipping: business.shipping,
}))

app.get('/reviews', async (c) => {
  const store = await getStore()
  const product = c.req.query('product') || undefined
  const reviews = await store.listReviews({ approvedOnly: true, productSlug: product, limit: 60 })
  return c.json({ reviews: reviews.map(({ id, name, rating, text, productSlug, createdAt }) => ({ id, name, rating, text, productSlug, createdAt })) })
})

const ReviewIn = z.object({
  name: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(800),
  productSlug: z.string().trim().max(60).optional().nullable(),
  website: honeypot,
  startedAt: z.number().optional(),
})
app.post('/reviews', async (c) => {
  if (!rateLimit(`rev:${ipOf(c)}`, 5)) return c.json({ error: 'Too many requests. Please try again in a minute.' }, 429)
  const parsed = ReviewIn.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Please check the form.', issues: parsed.error.issues.map((i) => i.message) }, 400)
  const d = parsed.data
  if (d.startedAt && Date.now() - d.startedAt < 2500) return c.json({ ok: true, pending: true }) // bot: silently accept
  if (d.productSlug && !bySlug(d.productSlug)) return c.json({ error: 'Unknown product' }, 400)
  const store = await getStore()
  await store.addReview({ id: uuid(), name: d.name, rating: d.rating, text: d.text, productSlug: d.productSlug ?? null, approved: false })
  return c.json({ ok: true, pending: true })
})

const QueryIn = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(120),
  phone: z.string().trim().max(20).optional().or(z.literal('')).transform((v) => (v ? v.replace(/\D/g, '').slice(-10) : '')).pipe(z.string().regex(/^[6-9]\d{9}$/).or(z.literal(''))),
  topic: z.enum(queryTopics),
  message: z.string().trim().min(10).max(2000),
  website: honeypot,
})
app.post('/queries', async (c) => {
  if (!rateLimit(`qry:${ipOf(c)}`, 5)) return c.json({ error: 'Too many requests. Please try again in a minute.' }, 429)
  const parsed = QueryIn.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Please check the form.', issues: parsed.error.issues.map((i) => i.message) }, 400)
  const d = parsed.data
  const store = await getStore()
  const q = await store.addQuery({ id: uuid(), ticket: rid('SQ'), name: d.name, email: d.email, phone: d.phone || null, topic: d.topic, message: d.message, status: 'new' })
  defer(sendQueryEmails(q))
  return c.json({ ok: true, ticket: q.ticket })
})

app.post('/newsletter', async (c) => {
  if (!rateLimit(`nl:${ipOf(c)}`, 8)) return c.json({ error: 'Too many requests.' }, 429)
  const parsed = z.object({ email: z.email().max(120), website: honeypot }).safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Please enter a valid email.' }, 400)
  const store = await getStore()
  const added = await store.addSubscriber(parsed.data.email.toLowerCase())
  return c.json({ ok: true, added })
})

// ───────────────────────── checkout ─────────────────────────
const CustomerIn = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(120),
  phone: phoneIN,
  address1: z.string().trim().min(5).max(200),
  address2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a 6-digit PIN code'),
  note: z.string().trim().max(300).optional().or(z.literal('')),
})
const OrderIn = z.object({
  items: z.array(z.object({ slug: z.string().max(60), qty: z.number().int().min(1).max(12) })).min(1).max(20),
  customer: CustomerIn,
})

app.post('/checkout/order', async (c) => {
  if (!paymentsEnabled()) return c.json({ error: 'Online payments are not enabled yet. Please order via WhatsApp.' }, 503)
  if (!rateLimit(`ord:${ipOf(c)}`, 10)) return c.json({ error: 'Too many requests.' }, 429)
  const parsed = OrderIn.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Please check your details.', issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }, 400)
  const { customer } = parsed.data
  const items = [...parsed.data.items.reduce((m, i) => m.set(i.slug, Math.min(12, (m.get(i.slug) ?? 0) + i.qty)), new Map<string, number>())].map(([slug, qty]) => ({ slug, qty }))
  const unknown = items.filter((i) => !bySlug(i.slug)).map((i) => i.slug)
  if (unknown.length) return c.json({ error: `Unknown product(s): ${unknown.join(', ')}. Please refresh the page and try again.` }, 400)
  const priced = priceItems(items)
  if (priced.lines.length === 0) return c.json({ error: 'Your cart is empty.' }, 400)
  const id = rid('SM')
  const rzp = await createRazorpayOrder({
    amountPaise: Math.round(priced.total * 100),
    receipt: id,
    notes: {
      customer: customer.name.slice(0, 200), phone: customer.phone, email: customer.email.slice(0, 200),
      items: priced.lines.map((l) => `${l.name} x${l.qty}`).join(', ').slice(0, 250),
    },
  })
  const store = await getStore()
  const cust: Customer = { ...customer, address2: customer.address2 || undefined, note: customer.note || undefined }
  await store.createOrder({ id, rzpOrderId: rzp.id, rzpPaymentId: null, status: 'created', amount: rzp.amount, subtotal: priced.subtotal, shippingFee: priced.shippingFee, items: priced.lines, customer: cust, paidVia: null })
  return c.json({
    orderId: id, rzpOrderId: rzp.id, amount: rzp.amount, currency: rzp.currency, keyId: env.razorpayKeyId,
    prefill: { name: customer.name, email: customer.email, contact: customer.phone },
    summary: { subtotal: priced.subtotal, shippingFee: priced.shippingFee, total: priced.total },
  })
})

const VerifyIn = z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() })
app.post('/checkout/verify', async (c) => {
  const parsed = VerifyIn.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Bad request' }, 400)
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) return c.json({ error: 'Payment could not be verified. If money was deducted, it will be auto-refunded by Razorpay; please contact us with your payment ID.' }, 400)
  const store = await getStore()
  const before = await store.getOrder(razorpay_order_id)
  if (!before) {
    console.error('[verify] signed payment for an order we do not have', { razorpay_order_id, razorpay_payment_id })
    return c.json({ error: 'Order not found. Your payment is safe — please WhatsApp us with this payment ID: ' + razorpay_payment_id }, 404)
  }
  // defence in depth: the payment must be for this order, this amount, in INR, and authorised/captured
  const payment = await fetchPayment(razorpay_payment_id)
  if (payment && (payment.order_id !== razorpay_order_id || payment.amount !== before.amount || payment.currency !== 'INR' || !['authorized', 'captured'].includes(payment.status))) {
    console.error('[verify] payment mismatch', { razorpay_order_id, razorpay_payment_id, payment, expected: before.amount })
    return c.json({ error: 'Payment details did not match the order. Please contact us with payment ID ' + razorpay_payment_id }, 400)
  }
  const { order, transitioned } = await store.markOrderPaid(razorpay_order_id, razorpay_payment_id, 'checkout')
  if (transitioned && order) defer(sendOrderEmails(order))
  return c.json({ ok: true, order: publicOrder(order as Order) })
})

const publicOrder = (o: Order) => ({ id: o.id, status: o.status, amount: o.amount, subtotal: o.subtotal, shippingFee: o.shippingFee, items: o.items, customerName: o.customer.name, email: o.customer.email, createdAt: o.createdAt })

app.get('/orders/:id', async (c) => {
  const store = await getStore()
  const o = await store.getOrderById(c.req.param('id'))
  if (!o) return c.json({ error: 'Not found' }, 404)
  // only minimal info; requires the email to match to reveal details
  const email = c.req.query('email')?.toLowerCase()
  if (!email || email !== o.customer.email.toLowerCase()) return c.json({ id: o.id, status: o.status })
  return c.json(publicOrder(o))
})

app.post('/razorpay/webhook', async (c) => {
  const raw = await c.req.text()
  const sig = c.req.header('x-razorpay-signature') ?? ''
  if (!verifyWebhookSignature(raw, sig)) return c.json({ error: 'invalid signature' }, 400)
  type WebhookBody = { event: string; payload: { payment?: { entity: { id: string; order_id: string; status: string; amount?: number } }; order?: { entity: { id: string } } } }
  let body: WebhookBody
  try { body = JSON.parse(raw) as WebhookBody } catch { return c.json({ error: 'bad json' }, 400) }
  const store = await getStore()
  const eventId = c.req.header('x-razorpay-event-id') ?? `${body.event}:${body.payload.payment?.entity.id ?? body.payload.order?.entity.id ?? raw.length}`
  if (!(await store.claimWebhookEvent(eventId, body.event))) return c.json({ ok: true, duplicate: true })
  try {
    const payment = body.payload.payment?.entity
    const orderId = payment?.order_id ?? body.payload.order?.entity.id
    if (orderId && (body.event === 'payment.captured' || body.event === 'order.paid') && payment) {
      const before = await store.getOrder(orderId)
      if (before && payment.amount !== undefined && payment.amount !== before.amount) console.error('[webhook] amount mismatch', { orderId, got: payment.amount, expected: before.amount })
      const { order, transitioned } = await store.markOrderPaid(orderId, payment.id, 'webhook')
      if (transitioned && order) defer(sendOrderEmails(order))
    } else if (orderId && body.event === 'payment.failed') {
      await store.markOrderFailed(orderId)
    }
  } catch (err) {
    await store.releaseWebhookEvent(eventId).catch(() => undefined) // let Razorpay retry
    throw err
  }
  return c.json({ ok: true })
})

// ───────────────────────── admin ─────────────────────────
const admin = new Hono()
admin.use('*', async (c, next) => {
  if (!env.adminPassword) return c.json({ error: 'Admin is disabled: set ADMIN_PASSWORD (16+ characters)' }, 503)
  const ip = ipOf(c)
  if (!rateLimit(`adm:${ip}`, 30, 10 * 60_000)) return c.json({ error: 'Too many attempts. Try again in 10 minutes.' }, 429)
  const auth = c.req.header('authorization') ?? ''
  const given = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const a = Buffer.from(given); const b = Buffer.from(env.adminPassword)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    // burn extra budget on failures so a brute force locks out after ~10 wrong guesses
    rateLimit(`adm:${ip}`, 30, 10 * 60_000); rateLimit(`adm:${ip}`, 30, 10 * 60_000)
    return c.json({ error: 'Unauthorised' }, 401)
  }
  await next()
})
admin.get('/summary', async (c) => {
  const store = await getStore()
  const [orders, reviews, queries, subs] = await Promise.all([store.listOrders(500), store.listReviews({ approvedOnly: false, limit: 500 }), store.listQueries(500), store.listSubscribers()])
  const paid = orders.filter((o) => o.status === 'paid')
  return c.json({
    orders: orders.length, paidOrders: paid.length, revenue: paid.reduce((s, o) => s + o.amount, 0) / 100,
    pendingReviews: reviews.filter((r) => !r.approved).length, openQueries: queries.filter((q) => q.status === 'new').length, subscribers: subs.length,
    payments: paymentsEnabled(), db: env.databaseUrl ? 'postgres' : 'sqlite',
  })
})
admin.get('/orders', async (c) => c.json({ orders: await (await getStore()).listOrders(300) }))
admin.get('/reviews', async (c) => c.json({ reviews: await (await getStore()).listReviews({ approvedOnly: false, limit: 300 }) }))
admin.patch('/reviews/:id', async (c) => {
  const body = z.object({ approved: z.boolean() }).safeParse(await c.req.json().catch(() => null))
  if (!body.success) return c.json({ error: 'bad request' }, 400)
  await (await getStore()).setReviewApproved(c.req.param('id'), body.data.approved)
  return c.json({ ok: true })
})
admin.delete('/reviews/:id', async (c) => { await (await getStore()).deleteReview(c.req.param('id')); return c.json({ ok: true }) })
admin.get('/queries', async (c) => c.json({ queries: await (await getStore()).listQueries(300) }))
admin.patch('/queries/:id', async (c) => {
  const body = z.object({ status: z.enum(['new', 'done']) }).safeParse(await c.req.json().catch(() => null))
  if (!body.success) return c.json({ error: 'bad request' }, 400)
  await (await getStore()).setQueryStatus(c.req.param('id'), body.data.status)
  return c.json({ ok: true })
})
admin.get('/subscribers', async (c) => c.json({ subscribers: await (await getStore()).listSubscribers() }))
app.route('/admin', admin)

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => { console.error('[api]', err); return c.json({ error: 'Something went wrong on our side. Please try again or WhatsApp us.' }, 500) })

export default app
