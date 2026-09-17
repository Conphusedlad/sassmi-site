// Local development server (Bun). Vite proxies /api → here.
// Loads the project's .env regardless of the shell's working directory.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
try {
  const envPath = fileURLToPath(new URL('../.env', import.meta.url))
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch { /* no .env — fine */ }

const { default: app } = await import('./app')
const port = Number(process.env.PORT ?? 8787)
Bun.serve({ port, fetch: app.fetch })
console.log(`[api] listening on http://127.0.0.1:${port}/api/health (admin ${process.env.ADMIN_PASSWORD ? 'enabled' : 'disabled'})`)
