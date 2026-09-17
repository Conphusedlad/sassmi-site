import { useSyncExternalStore } from 'react'
import type { QueryTopic } from '../../shared/config'

let topic: QueryTopic | null = null
const ls = new Set<() => void>()
export const contactStore = {
  prefill(t: QueryTopic) { topic = t; ls.forEach((l) => l()) },
  clear() { topic = null; ls.forEach((l) => l()) },
}
export const useContactPrefill = () => useSyncExternalStore((l) => { ls.add(l); return () => { ls.delete(l) } }, () => topic, () => null)
