import { useCallback, useRef, useState } from 'react'

/**
 * The flavour-select state machine.
 * { i, dir, locked } plus a 1-deep pending slot behind a 420ms lock; every input funnels into step()/goto().
 * `settled` lags `i` until input goes quiet, so the plate can reveal once, on rest, even under a held key.
 */
type Pending = { kind: 'step'; d: number } | { kind: 'goto'; k: number }

export function useFlavourSelector(count: number, opts: { lockMs?: number; restMs?: number; initial?: number } = {}) {
  const { lockMs = 420, restMs = 170, initial = 0 } = opts
  const [state, setState] = useState({ i: initial, dir: 1 as 1 | -1, locked: false })
  const [settled, setSettled] = useState(initial)
  const [turn, setTurn] = useState(initial) // unbounded: index === mod(turn, count); drives the wheel
  const [fast, setFast] = useState(false)
  const lockUntil = useRef(0)
  const pending = useRef<Pending | null>(null)
  const lastInput = useRef(0)
  const restTimer = useRef<number | undefined>(undefined)
  const iRef = useRef(initial)
  iRef.current = state.i

  const noteInput = useCallback(() => {
    const now = performance.now()
    if (now - lastInput.current < 150) setFast(true)
    lastInput.current = now
    window.clearTimeout(restTimer.current)
    restTimer.current = window.setTimeout(() => { if (pending.current !== null) return; setFast(false); setSettled(iRef.current) }, restMs)
  }, [restMs])

  const apply = useCallback((next: number, dir: 1 | -1, delta: number) => {
    lockUntil.current = performance.now() + lockMs
    setState((s) => ({ ...s, i: next, dir }))
    setTurn((t) => t + delta)
    window.setTimeout(() => { const p = pending.current; pending.current = null; if (!p) return; if (p.kind === 'step') stepRef.current(p.d); else gotoRef.current(p.k) }, lockMs)
  }, [lockMs])

  const stepRef = useRef<(d: number) => void>(() => {})
  const gotoRef = useRef<(k: number) => void>(() => {})
  const step = useCallback((d: number) => {
    if (!d) return
    if (state.locked) setState((s) => ({ ...s, locked: false })) // browsing while highlighted just moves on
    noteInput()
    if (performance.now() < lockUntil.current) { pending.current = { kind: 'step', d }; return }
    const dir: 1 | -1 = d > 0 ? 1 : -1
    apply((iRef.current + Math.sign(d) + count) % count, dir, Math.sign(d))
  }, [apply, count, state.locked, noteInput])
  stepRef.current = step

  const goto = useCallback((k: number, forcedDir?: 1 | -1) => {
    if (k === iRef.current) return
    if (state.locked) setState((s) => ({ ...s, locked: false })) // a rail pick while locked unlocks first (spec §3)
    noteInput()
    if (performance.now() < lockUntil.current) { pending.current = { kind: 'goto', k }; return }
    const shortest = ((k - iRef.current) % count + count * 1.5) % count - count / 2 // wrap-aware signed distance
    apply(k, forcedDir ?? (shortest >= 0 ? 1 : -1), shortest)
  }, [apply, noteInput, state.locked, count])
  gotoRef.current = goto

  const commit = useCallback(() => setState((s) => ({ ...s, locked: true })), [])
  const unlock = useCallback(() => setState((s) => ({ ...s, locked: false })), [])
  const lockedRef = useRef(false); lockedRef.current = state.locked
  const commitRef = useRef(commit); commitRef.current = commit
  const unlockRef = useRef(unlock); unlockRef.current = unlock

  /** Keys act only while focus is inside the stage (the section is focusable, so are the discs). Attach to the stage element. */
  const bindKeys = useCallback((el: HTMLElement | null) => {
    if (!el) return () => {}
    const onKey = (e: KeyboardEvent) => {
      const t = e.target instanceof HTMLElement ? e.target : null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      const onRadio = t?.getAttribute('role') === 'radio' // on the rail the full radiogroup key set applies; elsewhere only ← → so page-scroll keys stay the browser's
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); stepRef.current(1); break
        case 'ArrowLeft': e.preventDefault(); stepRef.current(-1); break
        case 'ArrowDown': if (onRadio) { e.preventDefault(); stepRef.current(1) } break
        case 'ArrowUp': if (onRadio) { e.preventDefault(); stepRef.current(-1) } break
        case 'Home': if (onRadio) { e.preventDefault(); gotoRef.current(0) } break
        case 'End': if (onRadio) { e.preventDefault(); gotoRef.current(count - 1) } break
        case ' ': if (onRadio && !lockedRef.current) { e.preventDefault(); commitRef.current() } break
        case 'Enter': {
          // a focused control owns its own activation; the stage itself and the active disc commit
          if (t && t.closest('button, a, [role="button"]') && !onRadio) break
          if (!lockedRef.current) { e.preventDefault(); commitRef.current() }
          break
        }
        case 'Escape': unlockRef.current(); break
        default: if (/^[1-9]$/.test(e.key)) gotoRef.current(Number(e.key) - 1)
      }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [count])

  /** Horizontal wheel/trackpad gestures turn the wheel (one flick = one tin, inertia tails ignored); vertical wheel scrolls the page as usual. Attach to the stage element. */
  const bindWheel = useCallback((el: HTMLElement | null) => {
    if (!el) return () => {}
    let acc = 0, gestureStart = 0, lastAt = 0, lastSign = 0
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      const mode = e.deltaMode // read before the deltas: Firefox ≥ 97 otherwise rewrites the event to pixel mode
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return // vertical: let the page scroll
      e.preventDefault()
      const now = performance.now()
      let d = e.deltaX
      if (mode !== 0) d = Math.sign(d) * 100 // a line/page notch is discrete: always clears the gate regardless of OS lines-per-notch
      const sign = Math.sign(d)
      if (now - lastAt > 90 || (lastSign && sign && sign !== lastSign)) { gestureStart = now; acc = 0 }
      lastAt = now; lastSign = sign || lastSign
      if (now - gestureStart > 300) return // trackpad inertia tail
      acc += d
      if (Math.abs(acc) >= 70) { stepRef.current(Math.sign(acc)); acc = 0; gestureStart = now - 301 } // one step per gesture
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return { index: state.i, dir: state.dir, locked: state.locked, settled, fast, turn, step, goto, commit, unlock, bindWheel, bindKeys }
}
