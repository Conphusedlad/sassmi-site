import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Minus, Plus, RotateCcw, X, ZoomIn } from 'lucide-react'

/**
 * Product-image zoom in the ranges people expect from Amazon-style stores:
 *  • hover magnifier at 2.5× inside the frame (pointer devices),
 *  • click/tap opens a lightbox that zooms 1×–4× with the wheel, +/− keys, pinch or double-tap, and drags to pan.
 * Feed it high-resolution photos (≥ 2000 px on the long side) once the real tins are shot.
 */
const MIN = 1, MAX = 4, HOVER_ZOOM = 2.5

export function ZoomImage({ src, alt, className = '', frameClassName = '' }: { src: string; alt: string; className?: string; frameClassName?: string }) {
  const frame = useRef<HTMLDivElement>(null)
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null)
  const [open, setOpen] = useState(false)
  const onMove = (e: React.MouseEvent) => {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return
    const r = frame.current!.getBoundingClientRect()
    setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }
  return (
    <>
      <div ref={frame} onMouseMove={onMove} onMouseLeave={() => setLens(null)} onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } }}
        aria-label={`${alt}. Click to zoom`} className={`group relative cursor-zoom-in select-none ${frameClassName}`}>
        <img src={src} alt={alt} className={className} draggable={false} />
        {lens && (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden
            style={{ backgroundImage: `url(${src})`, backgroundRepeat: 'no-repeat', backgroundSize: `${HOVER_ZOOM * 100}%`, backgroundPosition: `${lens.x}% ${lens.y}%` }} />
        )}
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-night/70 px-3 py-1.5 text-[10px] uppercase tracking-[.2em] text-ivory/90 backdrop-blur transition-opacity group-hover:opacity-100 sm:opacity-0"><ZoomIn size={12} /> Zoom</span>
      </div>
      {open && <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  )
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1.5)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const pinch = useRef<{ d: number; s: number } | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v))
  const zoomTo = useCallback((next: number) => { const s = clamp(next); setScale(s); if (s === MIN) setPos({ x: 0, y: 0 }) }, [])

  useEffect(() => {
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === '+' || e.key === '=') zoomTo(scale + 0.5); if (e.key === '-') zoomTo(scale - 0.5) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose, scale, zoomTo])

  const onWheel = (e: React.WheelEvent) => { e.preventDefault(); zoomTo(scale + (e.deltaY < 0 ? 0.25 : -0.25)) }
  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: scale } }
    else drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]; zoomTo(pinch.current.s * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.d))
    } else if (drag.current && scale > MIN) {
      setPos({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) })
    }
  }
  const onPointerUp = (e: React.PointerEvent) => { pointers.current.delete(e.pointerId); if (pointers.current.size < 2) pinch.current = null; if (pointers.current.size === 0) drag.current = null }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex flex-col bg-night/95 text-ivory backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${alt} — zoom`}>
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <p className="text-[11px] uppercase tracking-[.22em] text-ivory/60">Scroll, pinch or double-tap to zoom · drag to pan</p>
        <div className="flex items-center gap-2">
          <button onClick={() => zoomTo(scale - 0.5)} className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold" aria-label="Zoom out"><Minus size={15} /></button>
          <span className="w-12 text-center font-display text-lg tabular-nums">{scale.toFixed(1)}×</span>
          <button onClick={() => zoomTo(scale + 0.5)} className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold" aria-label="Zoom in"><Plus size={15} /></button>
          <button onClick={() => { setScale(1.5); setPos({ x: 0, y: 0 }) }} className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold" aria-label="Reset zoom"><RotateCcw size={14} /></button>
          <button onClick={onClose} className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-ivory text-night hover:bg-gold" aria-label="Close zoom"><X size={16} /></button>
        </div>
      </div>
      <div className="relative flex-1 touch-none overflow-hidden" onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onDoubleClick={() => zoomTo(scale > 1.5 ? 1 : 2.5)} style={{ cursor: scale > MIN ? 'grab' : 'zoom-in' }}>
        <img src={src} alt={alt} draggable={false} className="absolute left-1/2 top-1/2 max-h-[85%] max-w-[92%] select-none object-contain will-change-transform"
          style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${scale})`, transition: drag.current ? 'none' : 'transform .15s ease-out' }} />
      </div>
    </div>,
    document.body,
  )
}
