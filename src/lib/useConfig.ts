import { useEffect, useState } from 'react'
import { backend, type SiteConfig } from './backend'

let cached: SiteConfig | null = null
let inflight: Promise<SiteConfig> | null = null
export function useSiteConfig() {
  const [cfg, setCfg] = useState<SiteConfig | null>(cached)
  useEffect(() => {
    if (cached) return
    if (!inflight) inflight = backend.config().catch(() => ({ paymentsEnabled: false, razorpayKeyId: '', demo: backend.mode === 'preview' }))
    inflight.then((c) => { cached = c; setCfg(c) })
  }, [])
  return cfg
}
