// UPTIME: ten client sites, something always breaks. Fix it before it goes down.
import { Game, H, Input, W, box, pick, rnd, shade, text } from '../engine'

const ISSUES = ['DNS', 'SSL', 'MAIL', 'FORM', '500', 'CACHE', 'HOST']
const BW = 32
const BH = 36
const X0 = 6
const GAP = 5
const ROWS = [18, 66]

interface Site {
  st: 0 | 1 | 2 // ok, failing, down
  t: number
  limit: number
  issue: string
  fixed: number
  autoAt: number
}

const pos = (i: number) => ({ x: X0 + (i % 5) * (BW + GAP), y: ROWS[Math.floor(i / 5)] })

export default function createUptime(): Game {
  let sites: Site[] = []
  let time = 0
  let next = 0
  let score = 0
  let fixed = 0
  let strikes = 0
  let downSec = 0

  const reset = () => {
    sites = Array.from({ length: 10 }, () => ({ st: 0 as const, t: 0, limit: 1, issue: '', fixed: 0, autoAt: 1 }))
    time = 0
    next = 1
    score = 0
    fixed = 0
    strikes = 0
    downSec = 0
  }
  reset()

  const fix = (i: number) => {
    const s = sites[i]
    if (!s || s.st !== 1) return
    s.st = 0
    s.fixed = 0.6
    fixed++
    score += 10 + Math.round(s.t * 6)
  }

  return {
    reset,
    over: () => strikes >= 3,
    hud: () => ({
      score,
      a: `FIXED ${fixed} · DOWN ${strikes}/3`,
      b: `UPTIME ${time > 0 ? Math.max(0, 100 - (downSec / (10 * time)) * 100).toFixed(1) : '100.0'}%`,
    }),
    step(dt: number, inp: Input, auto: boolean) {
      if (strikes >= 3) return
      time += dt
      next -= dt
      if (next <= 0) {
        const ok = sites.map((s, i) => (s.st === 0 ? i : -1)).filter((i) => i >= 0)
        if (ok.length) {
          const s = sites[pick(ok)]
          s.st = 1
          s.limit = Math.max(2.1, 4.6 - time * 0.03)
          s.t = s.limit
          s.issue = pick(ISSUES)
          s.autoAt = Math.random() < 0.07 ? 99 : rnd(0.5, 1.6)
        }
        next = rnd(0.8, 1.8) * Math.max(0.42, 1 - time / 110)
      }
      for (const s of sites) {
        s.fixed = Math.max(0, s.fixed - dt)
        if (s.st === 1) {
          s.t -= dt
          if (s.t <= 0) {
            s.st = 2
            s.t = 2.4
            strikes++
          }
        } else if (s.st === 2) {
          downSec += dt
          s.t -= dt
          if (s.t <= 0) s.st = 0
        }
      }

      for (let k = 0; k < 10; k++) if (inp.pressed.has(String((k + 1) % 10))) fix(k)
      if (inp.tap) {
        for (let i = 0; i < 10; i++) {
          const p = pos(i)
          if (inp.px >= p.x - 2 && inp.px <= p.x + BW + 2 && inp.py >= p.y - 2 && inp.py <= p.y + BH + 6) fix(i)
        }
      }
      if (auto) sites.forEach((s, i) => s.st === 1 && s.limit - s.t > s.autoAt && fix(i))
    },
    draw(g: CanvasRenderingContext2D) {
      shade(g, 0.7)
      text(g, 'CLIENT SITES', 6, 6)
      text(g, 'PRESS 1-0 OR CLICK', W - 6, 6, 1, 'r')

      sites.forEach((s, i) => {
        const { x, y } = pos(i)
        const label = String((i + 1) % 10)
        if (s.st === 0) {
          shade(g, 0.7)
          box(g, x, y, BW, BH)
          g.fillRect(x, y, BW, 7)
          shade(g, 0)
          text(g, label, x + BW - 5, y + 1)
          g.fillRect(x + 2, y + 3, 1, 1)
          g.fillRect(x + 4, y + 3, 1, 1)
          shade(g, 0.4)
          g.fillRect(x + 4, y + 11, 18, 2)
          g.fillRect(x + 4, y + 16, 24, 1)
          g.fillRect(x + 4, y + 19, 20, 1)
          shade(g, 0.2)
          g.fillRect(x + 4, y + 23, 24, 9)
          if (s.fixed > 0) {
            shade(g, 1)
            text(g, 'OK', x + BW / 2, y + 25, 1, 'c')
          }
        } else if (s.st === 1) {
          const blink = Math.floor(s.t * 5) % 2 === 0
          if (blink) {
            shade(g, 1)
            g.fillRect(x, y, BW, BH)
            shade(g, 0)
          } else {
            shade(g, 1)
            box(g, x, y, BW, BH)
            box(g, x + 1, y + 1, BW - 2, BH - 2)
          }
          text(g, label, x + BW - 5, y + 2)
          text(g, s.issue, x + BW / 2, y + 11, 1, 'c')
          text(g, '!', x + BW / 2, y + 20, 2, 'c')
          shade(g, 1)
          g.fillRect(x, y + BH + 3, Math.max(0, Math.round(BW * (s.t / s.limit))), 2)
        } else {
          shade(g, 0.18)
          g.fillRect(x, y, BW, BH)
          shade(g, 0.6)
          box(g, x, y, BW, BH)
          shade(g, 0.85)
          text(g, 'DOWN', x + BW / 2, y + 15, 1, 'c')
          text(g, label, x + BW - 5, y + 2)
        }
      })

      // uptime bar
      const up = time > 0 ? Math.max(0, 1 - downSec / (10 * time)) : 1
      shade(g, 0.3)
      g.fillRect(6, H - 9, W - 12, 3)
      shade(g, 1)
      g.fillRect(6, H - 9, Math.round((W - 12) * up), 3)
    },
  }
}
