/**
 * Shopify storefront cart (theme build only). Same-origin Ajax API — no app, no token, no CSRF:
 *   GET  {root}products/{handle}.js  → the product and its variants (Shopify handle = our slug; one variant per product)
 *   GET  {root}cart.js               → the live cart; each line carries the product handle
 *   POST {root}cart/update.js        → { updates: { [variantId]: qty } } sets absolute quantities; adds a missing variant, 0 removes
 *   POST {root}cart/clear.js         → empty the cart
 *   POST {routes.cart_url} + name=checkout → the documented hand-off to Shopify's hosted checkout (Razorpay app pays there)
 * `root` is routes.root_url from Liquid (locale prefixes). Money in these responses is in paise.
 * Behind the password page or an hCaptcha challenge Shopify answers with an HTML redirect instead of JSON — handled below.
 */
import { bySlug } from '../../shared/products'

export class ShopifyError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}

export type ShopifyCartItem = { key: string; variant_id: number; product_id: number; handle: string; quantity: number; final_price: number; product_title: string; image: string | null }
export type ShopifyCart = { token: string; item_count: number; items: ShopifyCartItem[]; total_price: number; items_subtotal_price: number; currency: string }
type Variant = { id: number; available: boolean; price: number }

const root = () => (window.SASSMI_SHOP?.root || '/').replace(/\/?$/, '/') // routes.root_url is '/' or '/xx' (no slash) on a secondary locale
const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' }

async function parse<T>(r: Response, fallback: string): Promise<T> {
  const isJson = (r.headers.get('content-type') ?? '').includes('json')
  if (r.ok && isJson) return (await r.json()) as T
  if (!isJson) {
    if (/\/password/.test(r.url)) throw new ShopifyError('Please enter the store password first', r.status)
    if (/\/challenge/.test(r.url)) throw new ShopifyError('Shopify asked for a quick security check — reload the page and try again', r.status)
    throw new ShopifyError(r.ok ? `${fallback} — unexpected reply from the store` : `${fallback} (${r.status})`, r.status)
  }
  let message = `${fallback} (${r.status})`
  try {
    const body = (await r.json()) as { description?: string; message?: string }
    if (body.description) message = body.description
    else if (body.message && r.status !== 404) message = body.message
  } catch { /* unreadable body */ }
  throw new ShopifyError(message, r.status)
}

const variants = new Map<string, Promise<Variant>>()
/** First variant of the Shopify product whose handle is this slug. Cached per page load; a failure is not cached. */
export function variantFor(slug: string): Promise<Variant> {
  let p = variants.get(slug)
  if (!p) {
    p = fetch(`${root()}products/${encodeURIComponent(slug)}.js`, { headers: { Accept: 'application/json' } }).then(async (r) => {
      if (r.status === 404) throw new ShopifyError(`${bySlug(slug)?.name ?? slug} isn't in the Shopify catalogue yet`, 404)
      const data = await parse<{ variants?: Variant[] }>(r, 'Product lookup failed')
      const v = data.variants?.[0]
      if (!v) throw new ShopifyError(`${bySlug(slug)?.name ?? slug} has no variant to add`, 500)
      return { id: v.id, available: v.available, price: v.price }
    })
    p.catch(() => variants.delete(slug))
    variants.set(slug, p)
  }
  return p
}

export async function readCart(): Promise<ShopifyCart> {
  const r = await fetch(`${root()}cart.js`, { headers: { Accept: 'application/json' }, cache: 'no-store' })
  return parse<ShopifyCart>(r, 'Could not read the cart')
}

/** Make the Shopify line for `slug` hold exactly `qty` (0 removes it). Returns the cart after the change. */
export async function setLine(slug: string, qty: number): Promise<ShopifyCart> {
  const v = await variantFor(slug)
  if (qty > 0 && !v.available) throw new ShopifyError(`${bySlug(slug)?.name ?? slug} is sold out right now`, 422)
  const r = await fetch(`${root()}cart/update.js`, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ updates: { [String(v.id)]: qty } }) })
  return parse<ShopifyCart>(r, 'Could not update the cart')
}

export async function clearCart(): Promise<ShopifyCart> {
  const r = await fetch(`${root()}cart/clear.js`, { method: 'POST', headers: JSON_HEADERS })
  return parse<ShopifyCart>(r, 'Could not empty the cart')
}

/** Hand the Shopify cart to checkout the documented way: POST the cart form with a `checkout` field. */
export function goToCheckout() {
  if (document.getElementById('sassmi-checkout-form')) return // already on its way
  const form = document.createElement('form')
  form.id = 'sassmi-checkout-form'
  form.method = 'post'
  form.action = window.SASSMI_SHOP?.cartUrl || `${root()}cart`
  for (const [name, value] of [['form_type', 'cart'], ['utf8', '✓'], ['checkout', '1']]) {
    const field = document.createElement('input')
    field.type = 'hidden'; field.name = name; field.value = value
    form.appendChild(field)
  }
  document.body.appendChild(form)
  form.submit()
}
