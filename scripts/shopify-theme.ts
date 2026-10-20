#!/usr/bin/env bun
/**
 * Wraps the Shopify build (dist-shopify/sassmi.js + sassmi.css, from `VITE_TARGET=shopify vite build --mode shopify`)
 * in an uploadable Online Store theme:
 *   dist-shopify/theme/                 the theme folder (layout/, templates/, config/, locales/, assets/)
 *   dist-shopify/sassmi-theme-<date>.zip  → Shopify admin › Online Store › Themes › Add theme › Upload zip file
 * Shopify themes are Liquid; the React app ships as plain assets that layout/theme.liquid loads. assets/ is flat,
 * so public/img/tins/x.png becomes assets/img-tins-x.png and theme.liquid hands the app a path → CDN URL map.
 * Run through `bun run build:shopify`.
 */
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { $ } from 'bun'

const ROOT = join(import.meta.dir, '..')
const OUT = join(ROOT, 'dist-shopify')
const THEME = join(OUT, 'theme')
const SKELETON = join(ROOT, 'scripts', 'shopify-theme')
const PUBLIC = join(ROOT, 'public')
const now = new Date()
const today = now.toISOString().slice(0, 10)
const hhmm = `${now.getHours()}`.padStart(2, '0') + `${now.getMinutes()}`.padStart(2, '0')
const version = `0.1.${today.replaceAll('-', '')}.${hhmm}` // theme_version shown in the Shopify admin: build date and local time

for (const f of ['sassmi.js', 'sassmi.css']) {
  if (!existsSync(join(OUT, f))) throw new Error(`dist-shopify/${f} is missing — run \`bun run build:shopify\` (it builds first, then packages)`)
}

await rm(THEME, { recursive: true, force: true })
for (const d of ['layout', 'templates/customers', 'config', 'locales', 'assets']) await mkdir(join(THEME, d), { recursive: true })

// 1. the Liquid skeleton, verbatim (placeholders filled below)
async function copyTree(from: string, to: string) {
  for (const e of await readdir(from, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue
    const src = join(from, e.name), dst = join(to, e.name)
    if (e.isDirectory()) { await mkdir(dst, { recursive: true }); await copyTree(src, dst) } else await copyFile(src, dst)
  }
}
await copyTree(SKELETON, THEME)

// 2. public/ → flat assets/, remembering public path → asset name
const assetMap: Record<string, string> = {}
async function flatten(dir: string) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue
    const full = join(dir, e.name)
    if (e.isDirectory()) { await flatten(full); continue }
    const rel = relative(PUBLIC, full)
    const name = rel.split(/[\\/]/).join('-').replace(/[^A-Za-z0-9._-]/g, '-')
    const clash = Object.entries(assetMap).find(([, n]) => n === name)
    if (clash) throw new Error(`asset name clash: ${rel} and ${clash[0]} both flatten to ${name}`)
    assetMap[rel] = name
    await copyFile(full, join(THEME, 'assets', name))
  }
}
await flatten(PUBLIC)

// 3. the bundle (and anything else Vite emitted) → assets/
const built = (await readdir(OUT, { withFileTypes: true })).filter((e) => e.isFile() && !/\.(html|zip|csv|txt)$/.test(e.name) && !e.name.startsWith('.')).map((e) => e.name)
for (const f of built) await copyFile(join(OUT, f), join(THEME, 'assets', f))
const extra = built.filter((f) => f !== 'sassmi.js' && f !== 'sassmi.css')
if (extra.length) throw new Error(`Vite emitted files theme.liquid cannot reference (base is relative, Shopify assets are CDN URLs): ${extra.join(', ')} — keep the build to one sassmi.js + sassmi.css`)

// 4. fill the placeholders
const mapLines = Object.entries(assetMap).sort(([a], [b]) => a.localeCompare(b))
  .map(([pub, name]) => `        ${JSON.stringify(pub)}: {{ '${name}' | asset_url | json }}`).join(',\n')
const layoutPath = join(THEME, 'layout', 'theme.liquid')
let layout = await readFile(layoutPath, 'utf8')
if (!layout.includes('<!--SASSMI_ASSET_MAP-->')) throw new Error('theme.liquid lost its <!--SASSMI_ASSET_MAP--> placeholder')
layout = layout.replace('<!--SASSMI_ASSET_MAP-->', mapLines)
for (const must of ['{{ content_for_header }}', '{{ content_for_layout }}']) if (!layout.includes(must)) throw new Error(`theme.liquid must contain ${must}`)
await writeFile(layoutPath, layout)
const schemaPath = join(THEME, 'config', 'settings_schema.json')
await writeFile(schemaPath, (await readFile(schemaPath, 'utf8')).replace('<!--SASSMI_VERSION-->', version))
JSON.parse(await readFile(schemaPath, 'utf8')) // must stay valid JSON

// every asset any Liquid file names must exist
async function liquidFiles(dir: string): Promise<string[]> {
  const out: string[] = []
  for (const e of await readdir(dir, { withFileTypes: true })) { const f = join(dir, e.name); if (e.isDirectory()) out.push(...(await liquidFiles(f))); else if (f.endsWith('.liquid')) out.push(f) }
  return out
}
for (const f of await liquidFiles(THEME)) {
  const src = await readFile(f, 'utf8')
  for (const m of src.matchAll(/'([^']+)'\s*\|\s*asset_url/g)) {
    if (!existsSync(join(THEME, 'assets', m[1]))) throw new Error(`${relative(THEME, f)} references assets/${m[1]} which was not packaged`)
  }
}

// 5. zip from inside the theme folder (Shopify wants layout/ etc. at the archive root), no macOS metadata
const zipName = `sassmi-theme-${today}-${hhmm}.zip`
const zipPath = join(OUT, zipName)
await rm(zipPath, { force: true })
await $`cd ${THEME} && zip -rXq ${zipPath} . -x '.*' '*/.*' '__MACOSX*'`

// 6. report
let bytes = 0
for (const f of await readdir(join(THEME, 'assets'))) bytes += (await stat(join(THEME, 'assets', f))).size
const zipBytes = (await stat(zipPath)).size
const mb = (n: number) => (n / 1048576).toFixed(1) + ' MB'
console.log(`Sassmi theme ${version}
  assets: ${Object.keys(assetMap).length} public files + ${built.length} bundle files (${mb(bytes)} uncompressed; Shopify caps a zip at 50 MB)
  theme:  ${relative(ROOT, THEME)}/
  zip:    ${relative(ROOT, zipPath)} (${mb(zipBytes)})
Upload: Shopify admin › Online Store › Themes › Add theme › Upload zip file. It arrives unpublished; use its Preview link to test.`)
