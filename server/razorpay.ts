import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from './env'

const API = 'https://api.razorpay.com/v1'

const authHeader = () => 'Basic ' + Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString('base64')

export type RzpOrder = { id: string; amount: number; currency: string; receipt: string; status: string }

/** Create a Razorpay Order. `amountPaise` must be an integer in paise (₹1 = 100). */
export async function createRazorpayOrder(input: { amountPaise: number; receipt: string; notes?: Record<string, string> }): Promise<RzpOrder> {
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: input.amountPaise, currency: 'INR', receipt: input.receipt.slice(0, 40), notes: input.notes ?? {} }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Razorpay order failed (${res.status}): ${text.slice(0, 300)}`)
  }
  return (await res.json()) as RzpOrder
}

const safeEq = (a: string, b: string) => {
  const ba = Buffer.from(a, 'utf8'); const bb = Buffer.from(b, 'utf8')
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

/** Checkout success handler: HMAC_SHA256(order_id + "|" + payment_id, key_secret) === razorpay_signature */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  if (!env.razorpayKeySecret) return false
  const expected = createHmac('sha256', env.razorpayKeySecret).update(`${orderId}|${paymentId}`).digest('hex')
  return safeEq(expected, signature)
}

/** Webhook: HMAC_SHA256(raw request body, webhook_secret) === X-Razorpay-Signature */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!env.razorpayWebhookSecret) return false
  const expected = createHmac('sha256', env.razorpayWebhookSecret).update(rawBody).digest('hex')
  return safeEq(expected, signature)
}
