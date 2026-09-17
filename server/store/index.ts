import { env } from '../env'
import { SqlStore, type Driver } from './sql'
import type { Store } from './types'

/** Postgres (Supabase / Neon / any) via postgres.js — used on Vercel. */
async function postgresDriver(url: string): Promise<Driver> {
  const { default: postgres } = await import('postgres')
  // prepare:false is required for Supabase's transaction-mode pooler (port 6543)
  const sql = postgres(url, { prepare: false, max: 1, idle_timeout: 20, connect_timeout: 10, ssl: url.includes('localhost') ? undefined : 'require' })
  return {
    async all<T>(q: string, params: unknown[] = []) { return (await sql.unsafe(q, params as never[])) as unknown as T[] },
    async run(q: string, params: unknown[] = []) { await sql.unsafe(q, params as never[]) },
  }
}

/** SQLite via Bun's built-in driver — used for local development (no accounts needed). */
async function sqliteDriver(file: string): Promise<Driver> {
  const spec = 'bun:' + 'sqlite' // non-literal so Vercel's bundler never tries to resolve it
  const { Database } = (await import(/* @vite-ignore */ spec)) as { Database: new (f: string, o?: { create?: boolean }) => import('bun:sqlite').Database }
  const { mkdirSync } = await import('node:fs')
  const { dirname } = await import('node:path')
  mkdirSync(dirname(file), { recursive: true })
  const db = new Database(file, { create: true })
  db.exec('PRAGMA journal_mode = WAL')
  // map `$n` placeholders to positional `?` and reorder params to match (so a query may reuse or reorder $n)
  const conv = (q: string, params: unknown[]) => {
    const out: unknown[] = []
    const sql = q.replace(/\$(\d+)/g, (_, n: string) => { out.push(params[Number(n) - 1]); return '?' })
    return { sql, out }
  }
  return {
    async all<T>(q: string, params: unknown[] = []) { const { sql, out } = conv(q, params); return db.query(sql).all(...(out as never[])) as T[] },
    async run(q: string, params: unknown[] = []) { const { sql, out } = conv(q, params); db.query(sql).run(...(out as never[])) },
  }
}

let storePromise: Promise<Store> | null = null

export function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = (async () => {
      let driver: Driver
      if (env.databaseUrl) driver = await postgresDriver(env.databaseUrl)
      else if (env.isBun) driver = await sqliteDriver(new URL('../../data/sassmi.sqlite', import.meta.url).pathname)
      else throw new Error('DATABASE_URL is not set (required outside Bun local dev)')
      const store = new SqlStore(driver)
      await store.init()
      return store
    })()
    storePromise.catch(() => { storePromise = null })
  }
  return storePromise
}
