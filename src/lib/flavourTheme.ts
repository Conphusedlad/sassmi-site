// One flavour hex becomes a whole stage theme for the flavour-select showcase. Computed once per tin at module load, never per frame.
import { tins, type Product } from '../../shared/products'

export const NIGHT = '#0F1A30'
export const IVORY = '#F4EEE1'
export const GOLD = '#C9A867'

export type StageTheme = {
  hex: string; ground: string; ink: string; glow: string; lamp: number; deep: string; shadow: string
  /** the richer first-version stage the family preferred: saturated deep shade + a lifted glow behind the tin */
  stage: string; stageDeep: string; glowStrong: string
  chipFill: string | null; chipInk: string; plateInk: string; groundHsl: [number, number, number]
}

type RGB = [number, number, number]
const hexToRgb = (hex: string): RGB => { const m = hex.replace('#', ''); return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16)) as RGB }
const rgbToHex = ([r, g, b]: RGB) => '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')
function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60
  return [h, s * 100, l * 100]
}
function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const lum = ([r, g, b]: RGB) => { const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
export const contrast = (a: string, b: string) => { const la = lum(hexToRgb(a)), lb = lum(hexToRgb(b)); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05) }

export function themeFor(f: Product): StageTheme {
  const rgb = hexToRgb(f.hex)
  const [h, s, l] = rgbToHsl(rgb)
  const night = hexToRgb(NIGHT)
  const ground = rgbToHex(mix(rgb, night, 0.78))
  const ink = rgbToHex(hslToRgb(h, clamp(s * 0.55, 22, 60), clamp(l + 34, 62, 80)))
  const glow = rgbToHex(hslToRgb(h, s, clamp(l + 15, 35, 65)))
  const deep = rgbToHex(mix(hslToRgb(h, s * 0.9, clamp(l * 0.42, 6, 100)), night, 0.35))
  const shadow = rgbToHex(mix(rgb, [0, 0, 0], 0.45))
  const chipPasses = contrast(IVORY, f.accent) >= 4.5
  const plateInk = contrast(IVORY, f.hex) >= contrast(NIGHT, f.hex) ? IVORY : NIGHT // the better of the two inks for any text placed on raw hex
  const neutral = s < 12
  const hh = neutral ? 222 : h, ss = neutral ? 34 : s
  const stage = rgbToHex(hslToRgb(hh, clamp(ss * 0.62, 22, 48), 14))
  const stageDeep = rgbToHex(hslToRgb(hh, clamp(ss * 0.62, 22, 48), 9))
  const glowStrong = rgbToHex(hslToRgb(hh, clamp(ss * 0.8, 30, 62), 30))
  return { hex: f.hex, ground, ink, glow, lamp: l <= 48 ? 0.5 : 0.34, deep, shadow, stage, stageDeep, glowStrong, chipFill: chipPasses ? f.accent : null, chipInk: chipPasses ? IVORY : ink, plateInk, groundHsl: rgbToHsl(hexToRgb(ground)) }
}

export const THEMES: Record<string, StageTheme> = Object.fromEntries(tins.map((f) => [f.slug, themeFor(f)]))

// Dev-only legibility assertions: a hex edit must never silently break the plate.
if (import.meta.env.DEV) {
  for (const f of tins) {
    const t = THEMES[f.slug]
    const checks: [string, number, number][] = [
      ['ivory:ground', contrast(IVORY, t.ground), 7], ['ivory:stage', contrast(IVORY, t.stage), 7], ['ink:stage', contrast(t.ink, t.stage), 4.5], ['ink:ground', contrast(t.ink, t.ground), 4.5], 
      ...(t.chipFill ? [['chipInk:chip', contrast(t.chipInk, t.chipFill), 4.5] as [string, number, number]] : []),
    ]
    for (const [name, ratio, min] of checks) if (ratio < min) console.warn(`[flavour theme] ${f.name}: ${name} = ${ratio.toFixed(2)} < ${min}`)
  }
}
