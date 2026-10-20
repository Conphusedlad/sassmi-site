/** Build target (see vite.config.ts): undefined = own site (Vercel), 'artifact' = claude.ai / GitHub Pages, 'shopify' = theme build. */
export const IS_ARTIFACT = import.meta.env.VITE_TARGET === 'artifact'
export const IS_SHOPIFY = import.meta.env.VITE_TARGET === 'shopify'
/** Shopify owns path routing on its storefront and the static builds have no server, so both route by hash. */
export const USE_HASH_ROUTER = IS_ARTIFACT || IS_SHOPIFY

/** Injected by layout/theme.liquid on Shopify (scripts/shopify-theme.ts writes the map). */
export type ShopInfo = { template: string; handle: string | null; root: string; cartUrl: string; currency: string | null; cartCount: number; moneyFormat: string | null; domain: string | null }
declare global {
  interface Window {
    /** public path ("img/tins/mint-royale.png") → Shopify CDN URL of the flattened theme asset */
    SASSMI_ASSETS?: Record<string, string>
    SASSMI_SHOP?: ShopInfo
  }
}

/** Resolve a `/img/...` or `/favicon.svg` path for the current build. Every image in the app goes through this. */
export const asset = (path: string) => {
  if (IS_SHOPIFY) {
    const key = path.replace(/^\//, '')
    const url = typeof window !== 'undefined' ? window.SASSMI_ASSETS?.[key] : undefined
    return url || path // asset_url is protocol-relative (//shop/cdn/…); the browser resolves it against the page
  }
  return IS_ARTIFACT ? path.replace(/^\//, './') : path
}
