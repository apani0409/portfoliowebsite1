// CHECK-IN: compare the scanned QR with the registered device. Grant or deny.
import { Game, H, Input, W, box, person, rint, rnd, shade, text } from '../engine'

const G = 7
const CELL = 4
const REG_X = 26
const SCAN_X = W - 26 - G * CELL
const CODE_Y = 24

const fixedCell = (x: number, y: number) =>
  (x < 3 && y < 3) || (x > 3 && y < 3) || (x < 3 && y > 3)

function makeCode(): boolean[] {
  const c: boolean[] = []
  for (let y = 0; y < G; y++)
    for (let x = 0; x < G; x++) {
      if (fixedCell(x, y)) c.push((x < 2 || x > 4) && (y < 2 || y > 4))
      else c.push(Math.random() < 0.5)
    }
  return c
}

export default function createCheckin(): Game {
  let reg: boolean[] = []
  let scan: boolean[] = []
  let valid = true
  let t = 0
  let limit = 4
  let time = 0
  let score = 0
  let strikes = 0
  let served = 0
  let msg = ''
  let msgT = 0
  let pause = 0
  let door = 0
  let showDiff = false
  let autoAt = 1.2
  let walk = 0

  const next = () => {
    reg = makeCode()
    valid = Math.random() < 0.55
    scan = reg.slice()
    if (!valid) {
      const n = rint(1, 3)
      let done = 0
      while (done < n) {
        const i = rint(0, G * G - 1)
        if (!fixedCell(i % G, Math.floor(i / G))) {
          scan[i] = !scan[i]
          done++
        }
      }
      if (scan.every((v, i) => v === reg[i])) valid = true
    }
    limit = Math.max(1.7, 4.2 - time * 0.045)
    t = limit
    autoAt = rnd(0.8, 1.7)
    showDiff = false
  }

  const reset = () => {
    time = 0
    score = 0
    strikes = 0
    served = 0
    msg = ''
    msgT = 0
    pause = 0
    door = 0
    walk = 0
    next()
  }
  reset()

  const decide = (grant: boolean | null) => {
    const ok = grant !== null && grant === valid
    if (ok) {
      score += 10 + Math.round(t * 5)
      served++
      msg = grant ? 'ACCESS GRANTED' : 'DENIED: NOT REGISTERED'
      if (grant) door = 1
    } else {
      strikes++
      msg = grant === null ? 'TOO SLOW' : grant ? 'WRONG: CODE MISMATCH' : 'WRONG: IT WAS VALID'
    }
    msgT = 0.9
    showDiff = true
    pause = ok ? 0.45 : 0.95
  }

  return {
    reset,
    over: () => strikes >= 3,
    hud: () => ({ score, a: `CHECKED IN ${served}`, b: `ERRORS ${strikes}/3` }),
    step(dt: number, inp: Input, auto: boolean) {
      if (strikes >= 3) return
      time += dt
      walk += dt
      msgT = Math.max(0, msgT - dt)
      door = Math.max(0, door - dt * 1.6)
      if (pause > 0) {
        pause -= dt
        if (pause <= 0) next()
        return
      }
      t -= dt
      if (t <= 0) {
        decide(null)
        return
      }
      if (auto) {
        if (limit - t > autoAt) decide(Math.random() < 0.92 ? valid : !valid)
        return
      }
      if (inp.pressed.has('left')) decide(false)
      else if (inp.pressed.has('right')) decide(true)
      else if (inp.tap) decide(inp.px >= W / 2)
    },
    draw(g: CanvasRenderingContext2D) {
      const drawCode = (c: boolean[], x0: number, diff: boolean) => {
        shade(g, 0.5)
        box(g, x0 - 3, CODE_Y - 3, G * CELL + 6, G * CELL + 6)
        for (let i = 0; i < G * G; i++) {
          const cx = x0 + (i % G) * CELL
          const cy = CODE_Y + Math.floor(i / G) * CELL
          const differs = diff && c[i] !== reg[i]
          if (differs) {
            shade(g, Math.floor(time * 8) % 2 ? 1 : 0.3)
            box(g, cx - 1, cy - 1, CELL + 2, CELL + 2)
          }
          if (c[i]) {
            shade(g, 1)
            g.fillRect(cx, cy, CELL, CELL)
          }
        }
      }

      shade(g, 0.7)
      text(g, 'REGISTERED', REG_X + (G * CELL) / 2, 13, 1, 'c')
      text(g, 'SCANNED', SCAN_X + (G * CELL) / 2, 13, 1, 'c')
      drawCode(reg, REG_X, false)
      drawCode(scan, SCAN_X, showDiff)
      shade(g, 0.8)
      text(g, '=?', W / 2, CODE_Y + 10, 2, 'c')

      // scanner sweep
      if (pause <= 0) {
        const ly = CODE_Y + ((Math.sin(time * 7) + 1) / 2) * (G * CELL - 1)
        const sg = g.createLinearGradient(0, ly - 5, 0, ly + 5)
        sg.addColorStop(0, 'rgba(255,255,255,0)')
        sg.addColorStop(0.5, 'rgba(255,255,255,0.5)')
        sg.addColorStop(1, 'rgba(255,255,255,0)')
        g.fillStyle = sg
        g.fillRect(SCAN_X - 4, ly - 5, G * CELL + 8, 10)
        shade(g, 1)
        g.fillRect(SCAN_X - 4, Math.round(ly), G * CELL + 8, 1)
      }

      // timer
      shade(g, 0.3)
      g.fillRect(REG_X, 62, SCAN_X + G * CELL - REG_X, 2)
      shade(g, 1)
      g.fillRect(REG_X, 62, Math.round((SCAN_X + G * CELL - REG_X) * Math.max(0, t / limit)), 2)

      if (msgT > 0) {
        shade(g, 1)
        text(g, msg, W / 2, 72, 1, 'c')
      }

      // queue and door
      const dx = 128
      shade(g, 0.6)
      g.fillRect(dx, H - 40, 1, 22)
      g.fillRect(dx + 14, H - 40, 1, 22)
      g.fillRect(dx, H - 40, 15, 1)
      shade(g, 0.9)
      g.fillRect(dx + 1, H - 39, 13, Math.round(21 * (1 - door)))
      for (let i = 0; i < 5; i++) {
        shade(g, i === 0 ? 1 : 0.55)
        person(g, dx - 14 - i * 9, H - 27, Math.floor(walk * 4 + i))
      }

      // buttons
      shade(g, 0.8)
      box(g, 4, H - 15, 50, 12)
      box(g, W - 54, H - 15, 50, 12)
      text(g, '< DENY', 29, H - 11, 1, 'c')
      text(g, 'GRANT >', W - 29, H - 11, 1, 'c')
    },
  }
}
