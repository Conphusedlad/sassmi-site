/**
 * A resolution-independent makhana (popped lotus seed), painted on canvas at device resolution.
 * Deterministic for a given seed, so the same seed looks the same on every load.
 */
const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

export function renderMakhana(cssSize: number, dpr = 1, seed = 11): HTMLCanvasElement {
  const rand = rng(seed)
  const S = Math.round(cssSize * dpr)
  const canvas = document.createElement('canvas')
  canvas.width = S; canvas.height = Math.round(S * 1.28)
  const ctx = canvas.getContext('2d')!
  const R = S * 0.44, cx = S / 2, cy = R * 1.12

  // soft ground shadow
  ctx.save(); ctx.filter = `blur(${R * 0.12}px)`; ctx.fillStyle = 'rgba(0,0,0,.42)'
  ctx.beginPath(); ctx.ellipse(cx, cy + R * 1.18, R * 0.82, R * 0.16, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()

  // organic silhouette
  const ph1 = rand() * 6.28, ph2 = rand() * 6.28
  const outline = new Path2D()
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2
    const r = R * (1 + 0.032 * Math.sin(3 * a + ph1) + 0.018 * Math.sin(7 * a + ph2) + 0.01 * Math.sin(11 * a))
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.97
    if (i === 0) outline.moveTo(x, y); else outline.lineTo(x, y)
  }
  outline.closePath()
  ctx.save(); ctx.clip(outline)

  // base shading (light from top-left, warm cream)
  let g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.34, R * 0.05, cx - R * 0.1, cy - R * 0.05, R * 1.25)
  g.addColorStop(0, '#FDF8EC'); g.addColorStop(0.42, '#F3E7CC'); g.addColorStop(0.78, '#DCC9A1'); g.addColorStop(1, '#A08A5E')
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, canvas.height)

  // lobes — the popped seed's bulbous segments — and the creases between them
  const lobes = 9
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + rand() * 0.5
    const d = R * (0.42 + rand() * 0.2), lx = cx + Math.cos(a) * d, ly = cy + Math.sin(a) * d
    const lr = R * (0.36 + rand() * 0.14)
    g = ctx.createRadialGradient(lx - lr * 0.25, ly - lr * 0.3, 0, lx, ly, lr)
    g.addColorStop(0, 'rgba(255,251,240,.6)'); g.addColorStop(0.55, 'rgba(255,251,240,.14)'); g.addColorStop(0.85, 'rgba(150,120,80,.10)'); g.addColorStop(1, 'rgba(150,120,80,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill()
  }
  // low-frequency mottling (the slightly uneven colour of a roasted seed)
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * R * 0.9
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, rr = R * (0.12 + rand() * 0.2)
    g = ctx.createRadialGradient(x, y, 0, x, y, rr)
    const warm = rand() < 0.5
    g.addColorStop(0, warm ? 'rgba(205,170,120,.16)' : 'rgba(255,248,232,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill()
  }
  ctx.save(); ctx.filter = `blur(${Math.max(1, R * 0.025)}px)`; ctx.strokeStyle = 'rgba(120,88,48,.13)'; ctx.lineWidth = R * 0.028; ctx.lineCap = 'round'
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.7 + rand() * 0.5
    const r0 = R * (0.3 + rand() * 0.15), r1 = R * (0.8 + rand() * 0.1)
    const bend = (rand() - 0.5) * R * 0.5
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
    ctx.quadraticCurveTo(cx + Math.cos(a + 0.35) * (r1 * 0.55) + bend, cy + Math.sin(a + 0.35) * (r1 * 0.55), cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)
    ctx.stroke()
  }
  ctx.restore()

  // grain
  for (let i = 0; i < 2600; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * R * 0.98
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d
    const dark = rand() < 0.45
    ctx.fillStyle = dark ? `rgba(150,120,80,${0.05 + rand() * 0.09})` : `rgba(255,250,238,${0.06 + rand() * 0.12})`
    ctx.beginPath(); ctx.arc(x, y, (0.4 + rand() * 1.1) * dpr, 0, Math.PI * 2); ctx.fill()
  }

  // speckles (the seed's brown eyes)
  const spots = 4 + Math.floor(rand() * 2)
  for (let i = 0; i < spots; i++) {
    const a = -2.6 + rand() * 2.4, d = R * (0.25 + rand() * 0.5)
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d
    const rx = R * (0.045 + rand() * 0.04), ry = rx * (0.7 + rand() * 0.3), rot = rand() * Math.PI
    g = ctx.createRadialGradient(x, y, 0, x, y, rx)
    g.addColorStop(0, '#4E2410'); g.addColorStop(0.55, '#7E3F1E'); g.addColorStop(0.85, 'rgba(155,95,55,.7)'); g.addColorStop(1, 'rgba(155,95,55,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill()
  }
  // the navel crease
  ctx.save(); ctx.filter = `blur(${Math.max(1, R * 0.015)}px)`; ctx.strokeStyle = 'rgba(70,45,25,.3)'; ctx.lineWidth = R * 0.035; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx - R * 0.55, cy + R * 0.3); ctx.quadraticCurveTo(cx - R * 0.35, cy + R * 0.5, cx - R * 0.3, cy + R * 0.75); ctx.stroke(); ctx.restore()

  // specular highlight + subsurface rim + bottom occlusion
  g = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, 0, cx - R * 0.38, cy - R * 0.42, R * 0.55)
  g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, S, canvas.height)
  g = ctx.createRadialGradient(cx + R * 0.15, cy + R * 0.1, R * 0.6, cx + R * 0.15, cy + R * 0.1, R * 1.05)
  g.addColorStop(0, 'rgba(90,70,40,0)'); g.addColorStop(0.75, 'rgba(90,70,40,.12)'); g.addColorStop(1, 'rgba(70,50,30,.42)'); ctx.fillStyle = g; ctx.fillRect(0, 0, S, canvas.height)
  g = ctx.createRadialGradient(cx + R * 0.45, cy + R * 0.5, R * 0.75, cx + R * 0.45, cy + R * 0.5, R * 1.02)
  g.addColorStop(0, 'rgba(255,225,180,0)'); g.addColorStop(0.9, 'rgba(255,225,180,.16)'); g.addColorStop(1, 'rgba(255,225,180,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, S, canvas.height)
  ctx.restore()
  return canvas
}
