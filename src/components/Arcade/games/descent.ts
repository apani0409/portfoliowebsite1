// DESCENT: find the model size with the lowest test error in six training runs.
import { Game, H, Input, W, rnd, shade, text } from '../engine'

const X0 = 16
const X1 = W - 8
const YB = H - 16
const YT = 16
const PROBES = 6
const ROUNDS = 3

interface Probe {
  u: number
  e: number
}

export default function createDescent(): Game {
  let p = 0.4
  let w = 0.04
  let h = 0.45
  let c = 0
  let emin = 0
  let umin = 0
  let probes: Probe[] = []
  let cur = 0.2
  let train = 0
  let reveal = 0
  let hint = false
  let round = 1
  let score = 0
  let last = 0
  let resultT = 0
  let done = false
  let autoPlan: number[] = []
  let autoWait = 0

  const err = (u: number) =>
    0.17 + 0.45 * Math.exp(-u * 6) + (h * w * w) / ((u - p) * (u - p) + w * w) + c * Math.max(0, u - 0.8) ** 2 * 4
  const ux = (u: number) => X0 + u * (X1 - X0)
  const ey = (e: number) => Math.max(YT, Math.min(YB, YB - (e / 0.85) * (YB - YT)))

  const newRound = () => {
    p = rnd(0.28, 0.52)
    w = rnd(0.025, 0.05)
    h = rnd(0.35, 0.55)
    c = rnd(0, 1.3)
    emin = 9
    for (let i = 0; i <= 300; i++) {
      const e = err(i / 300)
      if (e < emin) {
        emin = e
        umin = i / 300
      }
    }
    probes = []
    cur = 0.2
    train = 0
    reveal = 0
    hint = false
    resultT = 0
    autoPlan = [rnd(0.05, 0.2), rnd(0.25, 0.45), rnd(0.5, 0.7), rnd(0.75, 0.95), rnd(0.6, 1), rnd(0.8, 1)]
    autoWait = 0.6
  }

  const reset = () => {
    round = 1
    score = 0
    last = 0
    done = false
    newRound()
  }
  reset()

  const best = () => probes.reduce((m, q) => (q.e < m.e ? q : m), { u: 0, e: 9 })

  return {
    reset,
    over: () => done,
    hud: () => ({ score, a: `ROUND ${Math.min(round, ROUNDS)}/${ROUNDS}`, b: `RUNS LEFT ${PROBES - probes.length}` }),
    step(dt: number, inp: Input, auto: boolean) {
      if (done) return
      if (reveal > 0 || probes.length >= PROBES) {
        reveal = Math.min(1, reveal + dt * 0.9)
        if (reveal >= 1) {
          if (resultT === 0) {
            const q = Math.max(0, Math.min(1, (best().e - emin) / 0.16))
            last = Math.round(100 * (1 - q))
            score += last
            resultT = 2.6
          }
          resultT -= dt
          if (resultT <= 0) {
            round++
            if (round > ROUNDS) done = true
            else newRound()
          }
        }
        return
      }
      if (train > 0) {
        train -= dt
        if (train <= 0) {
          train = 0
          probes.push({ u: cur, e: err(cur) + rnd(-0.008, 0.008) })
          if (probes.length >= PROBES) reveal = 0.001
        }
        return
      }
      if (auto) {
        const goal = autoPlan[probes.length] ?? 0.9
        cur += Math.sign(goal - cur) * Math.min(Math.abs(goal - cur), dt * 0.6)
        if (Math.abs(goal - cur) < 0.005) {
          autoWait -= dt
          if (autoWait <= 0) {
            train = 0.45
            autoWait = 0.5
          }
        }
        return
      }
      if (inp.held.has('left')) cur -= dt * 0.35
      if (inp.held.has('right')) cur += dt * 0.35
      if (inp.pointer && !isNaN(inp.px)) cur = (inp.px - X0) / (X1 - X0)
      cur = Math.max(0, Math.min(1, cur))
      if (inp.pressed.has('h') || (inp.tap && inp.py < 14 && inp.px > W - 52)) hint = true
      else if (inp.pressed.has('space') || (inp.tap && inp.py >= 14)) train = 0.45
    },
    draw(g: CanvasRenderingContext2D) {
      // axes
      shade(g, 0.5)
      g.fillRect(X0, YT, 1, YB - YT)
      g.fillRect(X0, YB, X1 - X0, 1)
      shade(g, 0.7)
      text(g, 'TEST ERROR', X0 + 3, 5)
      text(g, 'MODEL SIZE >', X1, YB + 4, 1, 'r')

      if (!hint && reveal === 0) {
        shade(g, 0.8)
        text(g, 'H: HINT', W - 4, 5, 1, 'r')
      }
      if (hint || reveal > 0) {
        const hx = Math.round(ux(p))
        shade(g, 0.55)
        for (let y = YT; y < YB; y += 4) g.fillRect(hx, y, 1, 2)
        shade(g, 0.8)
        text(g, 'SPECTRAL PEAK', Math.min(W - 30, Math.max(30, hx)), YT + 2, 1, 'c')
      }

      // revealed curve
      if (reveal > 0) {
        const xe = X0 + (X1 - X0) * reveal
        let prev = ey(err(0))
        for (let x = X0; x <= xe; x++) {
          const yv = ey(err((x - X0) / (X1 - X0)))
          shade(g, 1)
          g.fillRect(x, Math.round(Math.min(prev, yv)), 1, Math.max(1, Math.round(Math.abs(yv - prev)) + 1))
          prev = yv
        }
        if (reveal >= 1) {
          const mx = Math.round(ux(umin))
          const my = Math.round(ey(emin))
          shade(g, 1)
          text(g, 'MIN', mx, my + 4, 1, 'c')
        }
      }

      // probes
      const b = best()
      for (const q of probes) {
        const x = Math.round(ux(q.u))
        const y = Math.round(ey(q.e))
        shade(g, 0.25)
        g.fillRect(x - 2, y, 5, YB - y)
        shade(g, 1)
        g.fillRect(x - 2, y - 2, 5, 5)
        if (q === b) {
          g.fillRect(x - 4, y - 4, 9, 1)
          g.fillRect(x - 4, y + 4, 9, 1)
        }
      }

      // cursor
      if (reveal === 0) {
        const x = Math.round(ux(cur))
        shade(g, 0.75)
        for (let y = YT; y < YB; y += 3) g.fillRect(x, y, 1, 1)
        shade(g, 1)
        g.fillRect(x - 2, YB + 2, 5, 1)
        g.fillRect(x - 1, YB + 1, 3, 1)
        if (train > 0) {
          shade(g, 0.3)
          g.fillRect(x - 10, YT - 6, 21, 3)
          shade(g, 1)
          g.fillRect(x - 10, YT - 6, Math.round(21 * (1 - train / 0.45)), 3)
        }
      }

      if (resultT > 0) {
        shade(g, 1)
        text(g, `+${last}`, W / 2, 30, 2, 'c')
        shade(g, 0.75)
        text(g, last > 80 ? 'PAST THE PEAK. NICE.' : 'THE MINIMUM WAS FURTHER', W / 2, 44, 1, 'c')
      }
    },
  }
}
