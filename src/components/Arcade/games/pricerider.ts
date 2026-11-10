// PRICE RIDER: stay on the weekly price line as it scrolls. (Simulated series.)
import { Game, H, Input, W, pick, rnd, shade, text } from '../engine'

const PRODUCTS = ['TOMATE', 'PAPA', 'CEBOLLA', 'CHAYOTE', 'ZANAHORIA', 'CULANTRO', 'REPOLLO', 'PLATANO']
const PX = 58
const TOP = 18
const BOT = H - 14

export default function createPriceRider(): Game {
  let off = 0
  let time = 0
  let y = H / 2
  let drift = 0
  let score = 0
  let ph = [0, 0, 0]
  let product = PRODUCTS[0]
  let prodT = 0
  let inside = true

  const curve = (u: number) => {
    const k = Math.min(1.55, 1 + time / 55)
    const v =
      H / 2 + 2 + k * (24 * Math.sin(u * 0.021 + ph[0]) + 11 * Math.sin(u * 0.057 + ph[1]) + 4 * Math.sin(u * 0.15 + ph[2]))
    return Math.max(TOP + 4, Math.min(BOT - 4, v))
  }
  const band = () => 8 - Math.min(3, time / 30)

  const reset = () => {
    off = 0
    time = 0
    drift = 0
    score = 0
    ph = [rnd(0, 6), rnd(0, 6), rnd(0, 6)]
    product = pick(PRODUCTS)
    prodT = 0
    y = curve(PX)
    inside = true
  }
  reset()

  return {
    reset,
    over: () => drift >= 1,
    hud: () => ({
      score: Math.floor(score),
      a: `PRODUCT ${product}`,
      b: `DRIFT ${Math.round(drift * 100)}%`,
    }),
    step(dt: number, inp: Input, auto: boolean) {
      if (drift >= 1) return
      time += dt
      off += Math.min(30 + time * 0.6, 70) * dt
      prodT += dt
      if (prodT > 12) {
        prodT = 0
        product = pick(PRODUCTS.filter((p) => p !== product))
      }
      const cy = curve(off + PX)
      if (auto) {
        y += (cy + Math.sin(time * 1.7) * 4 - y) * Math.min(1, dt * 4.5)
      } else {
        if (inp.held.has('up')) y -= 80 * dt
        if (inp.held.has('down')) y += 80 * dt
        if (inp.pointer && !isNaN(inp.py)) y += (inp.py - y) * Math.min(1, dt * 14)
      }
      y = Math.max(TOP, Math.min(BOT, y))
      inside = Math.abs(y - cy) <= band()
      if (inside) {
        score += dt * 10 * (1 + time / 30)
        drift = Math.max(0, drift - dt * 0.2)
      } else {
        drift = Math.min(1, drift + dt * (time < 2.5 ? 0 : 0.28))
      }
    },
    draw(g: CanvasRenderingContext2D) {
      // grid: price levels + week columns
      shade(g, 0.35)
      for (let gy = TOP + 8; gy < BOT; gy += 16) for (let x = 0; x < W; x += 4) g.fillRect(x, gy, 1, 1)
      const shift = Math.floor(off) % 32
      for (let x = 32 - shift; x < W; x += 32) for (let gy = TOP; gy < BOT; gy += 4) g.fillRect(x, gy, 1, 1)

      // tolerance band
      const b = band()
      let prev = curve(off)
      for (let x = 0; x < W; x++) {
        const c = curve(off + x)
        shade(g, x < PX ? 0.13 : 0.26)
        g.fillRect(x, Math.round(c - b), 1, Math.round(b * 2))
        shade(g, x < PX ? 0.55 : 1)
        const y0 = Math.round(Math.min(prev, c))
        g.fillRect(x, y0, 1, Math.max(1, Math.round(Math.abs(c - prev)) + 1))
        prev = c
      }

      // player crosshair
      const py = Math.round(y)
      shade(g, 1)
      g.fillRect(PX - 6, py, 4, 1)
      g.fillRect(PX + 3, py, 4, 1)
      g.fillRect(PX, py - 6, 1, 4)
      g.fillRect(PX, py + 3, 1, 4)
      if (inside) g.fillRect(PX - 1, py - 1, 3, 3)

      // labels
      shade(g, 0.85)
      text(g, product, 4, 5)
      const price = Math.round(180 + (BOT - curve(off + PX)) * 11)
      text(g, `${price}/KG`, W - 4, 5, 1, 'r')
      shade(g, 0.45)
      text(g, 'DEMO DATA', W - 4, H - 8, 1, 'r')
      // drift meter
      shade(g, 0.3)
      g.fillRect(4, H - 7, 50, 3)
      shade(g, 1)
      g.fillRect(4, H - 7, Math.round(50 * drift), 3)
      shade(g, 0.6)
      text(g, 'DRIFT', 58, H - 8)
    },
  }
}
