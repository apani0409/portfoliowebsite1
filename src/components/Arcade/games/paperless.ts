// PAPERLESS: catch the paper forms with the scanner tray, dodge the bugs.
import { Game, H, Input, W, rnd, shade, text } from '../engine'

const TRAY_Y = H - 14
const TRAY_W = 30
const MAX_MISS = 5
const GOAL = 50

interface Item {
  x: number
  y: number
  vy: number
  bug: boolean
  ph: number
}

export default function createPaperless(): Game {
  let items: Item[] = []
  let tx = W / 2
  let time = 0
  let spawnT = 0
  let score = 0
  let caught = 0
  let misses = 0
  let beam = 0
  let shake = 0
  let banner = 0
  let pile = 0

  const reset = () => {
    items = []
    tx = W / 2
    time = 0
    spawnT = 0.4
    score = 0
    caught = 0
    misses = 0
    beam = 0
    shake = 0
    banner = 0
    pile = 0
  }
  reset()

  return {
    reset,
    over: () => misses >= MAX_MISS,
    hud: () => ({
      score,
      a: caught < GOAL ? `DIGITIZED ${caught}/${GOAL}` : `DIGITIZED ${caught}`,
      b: `MISSES ${misses}/${MAX_MISS}`,
    }),
    step(dt: number, inp: Input, auto: boolean) {
      if (misses >= MAX_MISS) return
      time += dt
      beam = Math.max(0, beam - dt * 3)
      shake = Math.max(0, shake - dt)
      banner = Math.max(0, banner - dt)

      spawnT -= dt
      if (spawnT <= 0) {
        const bugChance = Math.min(0.24, 0.06 + time * 0.004)
        items.push({ x: rnd(10, W - 10), y: -12, vy: rnd(20, 28) + time * 0.45, bug: Math.random() < bugChance, ph: rnd(0, 6) })
        const rate = Math.min(1 + time * 0.03, 3)
        spawnT = rnd(0.6, 1.4) / rate
      }

      // control
      if (auto) {
        const papers = items.filter((i) => !i.bug && i.y < TRAY_Y).sort((a, b) => b.y - a.y)
        let goal = papers.length ? papers[0].x : W / 2
        const bug = items.find((i) => i.bug && i.y > TRAY_Y - 40 && i.y < TRAY_Y && Math.abs(i.x - tx) < 22)
        if (bug) goal = bug.x > tx ? bug.x - 30 : bug.x + 30
        const d = goal - tx
        tx += Math.sign(d) * Math.min(Math.abs(d), 95 * dt)
      } else {
        if (inp.held.has('left')) tx -= 120 * dt
        if (inp.held.has('right')) tx += 120 * dt
        if (inp.pointer && !isNaN(inp.px)) tx += (inp.px - tx) * Math.min(1, dt * 16)
      }
      tx = Math.max(TRAY_W / 2, Math.min(W - TRAY_W / 2, tx))

      for (const it of items) {
        it.y += it.vy * dt
        it.x += Math.sin(time * 2 + it.ph) * 7 * dt
      }
      items = items.filter((it) => {
        if (it.y + 10 >= TRAY_Y && it.y < TRAY_Y + 3 && Math.abs(it.x - tx) < TRAY_W / 2 + 3) {
          if (it.bug) {
            misses++
            shake = 0.35
          } else {
            caught++
            score += 10 + Math.min(caught, 40)
            beam = 1
            if (caught === GOAL) banner = 2.4
          }
          return false
        }
        if (it.y > H) {
          if (!it.bug) {
            misses++
            pile++
          }
          return false
        }
        return true
      })
    },
    draw(g: CanvasRenderingContext2D) {
      const ox = shake > 0 ? Math.round(Math.sin(shake * 70) * 2) : 0
      // floor: the pile of paper that never got digitized
      const fl = g.createLinearGradient(0, H - 8, 0, H)
      fl.addColorStop(0, '#111')
      fl.addColorStop(1, '#555')
      g.fillStyle = fl
      g.fillRect(0, H - 6, W, 6)
      shade(g, 0.8)
      for (let i = 0; i < pile; i++) g.fillRect(8 + i * 37 + ox, H - 5 - (i % 2), 9, 3)

      // scanner beam
      const bm = g.createLinearGradient(0, TRAY_Y - 44, 0, TRAY_Y)
      bm.addColorStop(0, 'rgba(255,255,255,0)')
      bm.addColorStop(1, `rgba(255,255,255,${0.22 + beam * 0.45})`)
      g.fillStyle = bm
      g.fillRect(Math.round(tx - TRAY_W / 2) + ox, TRAY_Y - 44, TRAY_W, 44)

      // tray
      shade(g, 1)
      g.fillRect(Math.round(tx - TRAY_W / 2) + ox, TRAY_Y, TRAY_W, 3)
      shade(g, 0.6)
      g.fillRect(Math.round(tx - TRAY_W / 2) + 2 + ox, TRAY_Y + 3, TRAY_W - 4, 2)

      // falling items
      for (const it of items) {
        const x = Math.round(it.x) + ox
        const y = Math.round(it.y)
        if (it.bug) {
          shade(g, 1)
          g.fillRect(x - 2, y + 2, 5, 5)
          g.fillRect(x - 1, y, 1, 2)
          g.fillRect(x + 1, y, 1, 2)
          const f = Math.floor(it.y / 3) % 2
          g.fillRect(x - 4, y + 3 + f, 2, 1)
          g.fillRect(x + 3, y + 3 + f, 2, 1)
          g.fillRect(x - 4, y + 6 - f, 2, 1)
          g.fillRect(x + 3, y + 6 - f, 2, 1)
          shade(g, 0)
          g.fillRect(x, y + 3, 1, 3)
        } else {
          shade(g, 0.95)
          g.fillRect(x - 4, y, 8, 10)
          shade(g, 0.35)
          g.fillRect(x - 3, y + 2, 6, 1)
          g.fillRect(x - 3, y + 4, 4, 1)
          g.fillRect(x - 3, y + 6, 6, 1)
          shade(g, 0)
          g.fillRect(x + 3, y, 1, 1)
        }
      }

      // HUD strip: remaining misses + records counter
      shade(g, 0.75)
      text(g, 'PAPER FORMS', 4, 4)
      for (let i = 0; i < MAX_MISS; i++) {
        shade(g, i < MAX_MISS - misses ? 0.9 : 0.2)
        g.fillRect(52 + i * 6, 4, 4, 5)
      }
      shade(g, 0.75)
      text(g, `DB ${caught}`, W - 4, 4, 1, 'r')
      for (let i = 0; i < Math.min(caught, 12); i++) {
        shade(g, 0.55)
        g.fillRect(W - 10, 12 + i * 2, 6, 1)
      }

      if (banner > 0) {
        shade(g, 1)
        text(g, '50 STAFF ONLINE', W / 2, 44, 2, 'c')
        shade(g, 0.7)
        text(g, 'NO MORE PAPER', W / 2, 60, 1, 'c')
      }
    },
  }
}
