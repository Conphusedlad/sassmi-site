/**
 * What Shopify says is for sale right now. layout/theme.liquid writes it into window.SASSMI_SHOP.products from
 * collections.all (active products published to the Online Store — drafts and archived products are absent),
 * before the app loads. Null outside the Shopify build (own site, GitHub Pages, the Bun server).
 */
export type ShopifyProductInfo = {
  handle: string
  title: string
  available: boolean // false = published but sold out
  price: number // paise
  compareAtPrice: number | null // paise
  variantId: number
  image: string | null
  url: string
}
const injected = (globalThis as { SASSMI_SHOP?: { products?: ShopifyProductInfo[] } }).SASSMI_SHOP?.products
export const SHOPIFY_CATALOGUE: ShopifyProductInfo[] | null = Array.isArray(injected) ? injected : null
