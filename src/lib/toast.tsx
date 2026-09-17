import { useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Toast = { id: number; text: string; tone: 'ok' | 'err' }
let toasts: Toast[] = []
const ls = new Set<() => void>()
const emit = () => ls.forEach((l) => l())
let n = 0
export function toast(text: string, tone: Toast['tone'] = 'ok') {
  const id = ++n
  toasts = [...toasts, { id, text, tone }]; emit()
  setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); emit() }, tone === 'err' ? 5200 : 3600)
}
export function Toaster() {
  const list = useSyncExternalStore((l) => { ls.add(l); return () => { ls.delete(l) } }, () => toasts, () => toasts)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 16, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} transition={{ duration: .35, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto max-w-md rounded-full px-5 py-3 text-sm shadow-lg ${t.tone === 'ok' ? 'bg-night text-ivory' : 'bg-[#7A1F1F] text-ivory'}`}>
            <span className={`mr-2 ${t.tone === 'ok' ? 'text-gold' : 'text-[#F5C8C8]'}`}>{t.tone === 'ok' ? '✦' : '!'}</span>{t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
