#!/usr/bin/env bun
/**
 * A stand-in for Shopify's storefront, for testing dist-shopify/theme locally without a store:
 * renders the Liquid layout/templates (liquidjs with Shopify's asset_url/json/money/form filled in),
 * serves assets/ at /cdn/shop/t/1/assets/, and fakes the Ajax cart API with the catalogue from shared/products.ts.
 * It is a test double, not Shopify: Liquid edge cases and the real checkout are only proven on a real store.
 *   bun scripts/shopify-mock.ts   → http://localhost:8790
 */
import { Liquid, Tag, type TagToken, type TopLevelToken, type Context, type Emitter } from 'liquidjs'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { products, bySlug } from '../shared/products'

const ROOT = join(import.meta.dir, '..')
const THEME = join(ROOT, 'dist-shopify', 'theme')
const PORT = Number(process.env.PORT ?? 8790)
if (!existsSync(join(THEME, 'layout', 'theme.liquid'))) throw new Error('dist-shopify/theme is missing — run `bun run build:shopify` first')

// ── Liquid with Shopify's bits ──
const engine = new Liquid({ root: THEME, extname: '.liquid', cache: false, strictFilters: false, strictVariables: false })
engine.registerFilter('asset_url', (name: string) => `//localhost:${PORT}/cdn/shop/t/1/assets/${name}?v=1`) // protocol-relative, like Shopify
engine.registerFilter('json', (v: unknown) => JSON.stringify(v ?? null))
engine.registerFilter('money', (paise: number) => `₹${(paise / 100).toFixed(2)}`)
engine.registerFilter('format_code', (s: string) => String(s ?? '').replace(/(.{4})(?=.)/g, '$1 '))
engine.registerFilter('default_errors', (e: unknown) => (Array.isArray(e) ? e.join(', ') : String(e ?? '')))
engine.registerFilter('t', (s: string) => s)
engine.registerFilter('strip_html', (s: string) => String(s ?? '').replace(/<[^>]*>/g, ''))
engine.registerFilter('truncatewords', (s: string, n = 15) => String(s ?? '').split(/\s+/).slice(0, n).join(' '))
// {% form 'storefront_password' %} … {% endform %}
engine.registerTag('form', class extends Tag {
  kind: string; templates: unknown[]
  constructor(token: TagToken, remain: TopLevelToken[], liquid: Liquid) {
    super(token, remain, liquid)
    this.kind = token.args.match(/['"]([^'"]+)['"]/)?.[1] ?? token.args.trim()
    this.templates = []
    const stream = liquid.parser.parseStream(remain)
    stream.on('tag:endform', () => stream.stop()).on('template', (t: unknown) => this.templates.push(t)).on('end', () => { throw new Error('form tag not closed') })
    stream.start()
  }
  *render(ctx: Context, emitter: Emitter) {
    const action = this.kind === 'storefront_password' ? '/password' : this.kind === 'cart' ? '/cart' : '/contact'
    emitter.write(`<form method="post" action="${action}" id="${this.kind}_form"><input type="hidden" name="form_type" value="${this.kind}"><input type="hidden" name="utf8" value="✓">`)
    yield this.liquid.renderer.renderTemplates(this.templates as never, ctx, emitter)
    emitter.write('</form>')
  }
})
// {% layout 'password' %} / {% layout none %} — Shopify picks the layout from the template's first line
engine.registerTag('layout', class extends Tag { *render() { /* read by renderPage below */ } })

// ── catalogue → Shopify shapes ──
const variantId = (slug: string) => 1000 + products.findIndex((p) => p.slug === slug)
const productJson = (slug: string) => {
  const p = bySlug(slug)!
  return { id: 5000 + variantId(slug), title: p.name, handle: p.slug, available: true, price: p.price * 100,
    variants: [{ id: variantId(slug), title: 'Default Title', price: p.price * 100 + priceDelta, available: true, requires_shipping: true }] }
}
const cart = new Map<number, number>() // variantId → qty
let priceDelta = 0 // paise added to every Shopify price (GET /__price_delta?paise=N) — proves the drawer prices from Shopify, not the catalogue
const cartJson = () => {
  const items = [...cart].filter(([, q]) => q > 0).map(([id, quantity]) => {
    const p = products[id - 1000]
    const unit = p.price * 100 + priceDelta
    return { id, key: `${id}:mock`, variant_id: id, product_id: 5000 + id, handle: p.slug, quantity, price: unit, final_price: unit, line_price: unit * quantity, title: p.name, product_title: p.name, image: null }
  })
  const subtotal = items.reduce((s, i) => s + i.line_price, 0)
  return { token: 'mock', item_count: items.reduce((s, i) => s + i.quantity, 0), items, total_price: subtotal, items_subtotal_price: subtotal, currency: 'INR' }
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const html = (body: string, status = 200) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } })
const log: string[] = []
const note = (s: string) => { log.push(`${new Date().toISOString().slice(11, 19)} ${s}`); console.log(s) }

// ── render a template inside its layout, as Shopify does ──
async function renderPage(name: string, scope: Record<string, unknown>, status = 200) {
  const file = join(THEME, 'templates', `${name}.liquid`)
  if (!existsSync(file)) return html(`<h1>mock: no template ${name}</h1>`, 500)
  let src = await readFile(file, 'utf8')
  let layoutName: string | null = 'theme'
  const m = src.match(/{%-?\s*layout\s+(?:'([^']+)'|"([^"]+)"|(none))\s*-?%}/)
  if (m) { layoutName = m[3] ? null : (m[1] ?? m[2]); src = src.replace(m[0], '') }
  const dir = name.includes('/') ? name.split('/')[0] : null
  const ctx = {
    template: { name: name.replace(/^customers\//, ''), directory: dir, suffix: null },
    routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_update_url: '/cart/update' },
    cart: { item_count: cartJson().item_count, currency: { iso_code: 'INR' } },
    shop: { name: 'Sassmi', url: `http://localhost:${PORT}`, money_format: 'Rs. {{amount}}', password_message: '' },
    canonical_url: `http://localhost:${PORT}/`, page_title: scope.page_title ?? '',
    ...scope,
  }
  const body = await engine.parseAndRender(src, ctx)
  if (!layoutName) return html(body, status)
  const layout = await readFile(join(THEME, 'layout', `${layoutName}.liquid`), 'utf8')
  const page = await engine.parseAndRender(layout, { ...ctx, content_for_layout: body, content_for_header: '<!-- mock content_for_header -->' })
  return html(page, status)
}

const MIME: Record<string, string> = { js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', json: 'application/json' }
Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const p = url.pathname
    if (p.startsWith('/cdn/shop/t/1/assets/')) {
      const f = Bun.file(join(THEME, 'assets', p.split('/').pop()!))
      return (await f.exists()) ? new Response(f, { headers: { 'content-type': MIME[p.split('.').pop()!] ?? 'application/octet-stream', 'cache-control': 'no-store' } }) : new Response('no such asset', { status: 404 })
    }
    // Ajax cart API
    if (p === '/cart.js') return json(cartJson())
    if (p === '/cart/update.js' && req.method === 'POST') {
      const { updates } = (await req.json()) as { updates: Record<string, number> }
      for (const [id, qty] of Object.entries(updates)) { const v = Number(id); if (!products[v - 1000]) return json({ status: 404, message: 'Cart Error', description: `Cannot find variant` }, 404); if (qty > 12) return json({ status: 422, message: 'Cart Error', description: `You can only add 12 of this item to your cart.` }, 422); cart.set(v, qty) }
      note(`POST /cart/update.js ${JSON.stringify(updates)} → ${cartJson().item_count} items`)
      return json(cartJson())
    }
    if (p === '/cart/add.js' && req.method === 'POST') {
      const { items } = (await req.json()) as { items: { id: number; quantity: number }[] }
      for (const i of items) cart.set(i.id, (cart.get(i.id) ?? 0) + i.quantity)
      note(`POST /cart/add.js ${JSON.stringify(items)}`)
      return json({ items })
    }
    if (p === '/cart/clear.js' && req.method === 'POST') { cart.clear(); note('POST /cart/clear.js'); return json(cartJson()) }
    const pj = p.match(/^\/products\/([a-z0-9-]+)\.js$/)
    if (pj) return bySlug(pj[1]) ? json(productJson(pj[1])) : json({ status: 404, message: 'Not Found' }, 404)
    // checkout hand-off (documented form POST with name=checkout)
    if (p === '/cart' && req.method === 'POST') {
      const form = await req.formData()
      if (form.has('checkout')) { note(`POST /cart checkout=${form.get('checkout')} with ${cartJson().item_count} items`); return Response.redirect(`http://localhost:${PORT}/checkout`, 302) }
      return html('mock: cart form without checkout', 400)
    }
    if (p === '/checkout') {
      const c = cartJson()
      return html(`<!doctype html><title>Mock Shopify checkout</title><body style="font-family:system-ui;padding:40px"><h1 id="mock-checkout">Shopify checkout (mock)</h1><p>${c.item_count} items, total ₹${(c.total_price / 100).toFixed(2)}</p><ul>${c.items.map((i) => `<li>${i.product_title} × ${i.quantity}</li>`).join('')}</ul><p>On the real store the Razorpay app takes payment here.</p><a href="/">Back</a></body>`)
    }
    // storefront pages through the theme
    if (p === '/' ) return renderPage('index', {})
    if (p === '/password') return renderPage('password', { page_title: 'Opening soon' })
    const pr = p.match(/^\/products\/([a-z0-9-]+)$/)
    if (pr) { const prod = bySlug(pr[1]); return prod ? renderPage('product', { product: { handle: prod.slug, title: prod.name }, page_title: prod.name }) : renderPage('404', {}, 404) }
    if (p === '/collections' ) return renderPage('list-collections', { page_title: 'Collections' })
    if (p.startsWith('/collections/')) return renderPage('collection', { collection: { handle: p.split('/')[2], title: 'All' }, page_title: 'All products' })
    if (p === '/cart') return renderPage('cart', { page_title: 'Your cart' })
    if (p === '/search') return renderPage('search', { page_title: 'Search' })
    const pg = p.match(/^\/pages\/([a-z0-9-]+)$/)
    if (pg) return renderPage('page', { page: { handle: pg[1], title: pg[1].replace(/-/g, ' '), content: `<p>Mock page content for <strong>${pg[1]}</strong>.</p>` }, page_title: pg[1] })
    if (p.startsWith('/account')) return renderPage('customers/login', { page_title: 'Account' })
    if (p === '/__log') return json(log)
    if (p === '/__price_delta') { priceDelta = Number(url.searchParams.get('paise') ?? 0); return json({ priceDelta }) }
    if (p === '/__reset') { cart.clear(); priceDelta = 0; log.length = 0; return json({ ok: true }) }
    return renderPage('404', { page_title: 'Page not found' }, 404)
  },
})
console.log(`mock Shopify storefront for dist-shopify/theme → http://localhost:${PORT}  (log at /__log)`)
