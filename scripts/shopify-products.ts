#!/usr/bin/env bun
/**
 * Writes dist-shopify/shopify-products.csv from shared/products.ts for Shopify admin › Products › Import.
 * The handle IS the slug — the theme looks products up by handle (src/lib/shopify.ts), so never rename handles in Shopify.
 * Prices and pack size come from the catalogue and are still PLACEHOLDERS until the family confirms them.
 * Images are fetched by Shopify from the public GitHub repo at import time.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { products, productImage } from '../shared/products'

const ROOT = join(import.meta.dir, '..')
const RAW = 'https://raw.githubusercontent.com/Conphusedlad/sassmi-site/main/public'
const cols = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams',
  'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position', 'Image Alt Text', 'SEO Title', 'SEO Description', 'Status']
const q = (v: string | number | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const rows = [cols.map(q).join(',')]
for (const p of products) {
  const mult = p.netWeight.match(/(\d+)\s*[×x]\s*(\d+)/) // '3 × 100 g' → 300
  const grams = mult ? Number(mult[1]) * Number(mult[2]) : parseInt(p.netWeight, 10) || 0
  const body = `<p><em>${esc(p.tagline)}</em></p><p>${esc(p.description)}</p><p><strong>Pairs with:</strong> ${esc(p.pairing)}</p><p><strong>Ingredients:</strong> ${esc(p.ingredientHint)}${p.allergens ? ` · <strong>Allergens:</strong> ${esc(p.allergens)}` : ''}</p><p>Net weight ${esc(p.netWeight)}.</p>`
  const tags = [p.kind, p.profile, `spice-${p.spice}`, ...p.badges.map((b) => b.toLowerCase())].join(', ')
  const images = [productImage(p), ...(p.images ?? [])]
  images.forEach((img, i) => {
    const first = i === 0
    rows.push([
      p.slug, first ? p.name : '', first ? body : '', first ? 'Sassmi' : '', first ? (p.kind === 'tin' ? 'Makhana tin' : 'Gift bundle') : '', first ? tags : '', first ? 'TRUE' : '',
      first ? 'Title' : '', first ? 'Default Title' : '', first ? `SASSMI-${p.slug.toUpperCase()}` : '', first ? grams : '',
      '', '', first ? 'continue' : '', first ? 'manual' : '', first ? p.price : '', first ? (p.compareAt ?? '') : '',
      first ? 'TRUE' : '', first ? 'TRUE' : '', `${RAW}${img}`, i + 1, first ? `${p.name} — Sassmi premium makhana` : p.name, first ? `${p.name} — Sassmi` : '', first ? p.tagline : '', first ? 'active' : '',
    ].map(q).join(','))
  })
}
await mkdir(join(ROOT, 'dist-shopify'), { recursive: true })
const out = join(ROOT, 'dist-shopify', 'shopify-products.csv')
await writeFile(out, '﻿' + rows.join('\r\n') + '\r\n')
console.log(`wrote ${out}: ${products.length} products, ${rows.length - 1} rows (inventory not tracked; prices are catalogue placeholders)`)
