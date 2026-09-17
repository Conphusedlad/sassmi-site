import { useSyncExternalStore } from 'react'

const KEY = 'sassmi.intro.seen'
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const seen = () => { try { return sessionStorage.getItem(KEY) === '1' } catch { return true } }

let show = !seen() && !reduced()
const ls = new Set<() => void>()
const emit = () => ls.forEach((l) => l())
export const introStore = {
  finish() { try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ } show = false; emit() },
  replay() { try { sessionStorage.removeItem(KEY) } catch { /* ignore */ } show = true; emit(); window.scrollTo({ top: 0 }) },
}
export const useIntroVisible = () => useSyncExternalStore((l) => { ls.add(l); return () => { ls.delete(l) } }, () => show, () => false)
