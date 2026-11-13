// TRY-ON: the AR fitting room. Keep the cap on a moving head. The number on screen
// is the reprojection error: how far, in pixels, the cap sits from where it belongs.
import { Game, H, Input, W, clamp, rnd, shade, text } from '../engine'

const GOOD = 6 // px: green, the real project's target for this metric
const BAD = 12 // px: red
const LOSE_AFTER = 2 // seconds in red before tracking is lost
const SNAP_EVERY = 6 // seconds between photos
const LIVES = 3

export default function createTryOn(): Game {
  let time = 0
  let score = 0
  let lost = 0
  let red = 0
  let grace = 0
  let streak = 0
  let hx = W / 2
  let hy = 70
  let yaw = 0
  const ph = [0, 0, 0, 0]
  let cx = W / 2
  let cy = 24
  let err = 0
  let snapT = SNAP_EVERY
  let photos = 0
  let flash = 0
  let msg = ''
  let msgT = 0
  let shake = 0

  const reset = () => {
    time = 0
    score = 0
    lost = 0
    red = 0
    grace = 2
    streak = 0
    for (let i = 0; i < 4; i++) ph[i] = rnd(0, Math.PI * 2)
    hx = W / 2
    hy = 70
    yaw = 0
    cx = W / 2 + 40
    cy = 24
    err = 0
    snapT = SNAP_EVERY
    photos = 0
    flash = 0
    msg = ''
    msgT = 0
    shake = 0
  }
  reset()

  const target = () => ({ x: hx, y: hy - 7 })

  return {
    reset,
    over: () => lost >= LIVES,
    hud: () => ({
      score: Math.floor(score),
      a: `ERROR ${Math.round(err)}PX · PHOTOS ${photos}`,
      b: `LOST ${lost}/${LIVES}`,
    }),
    step(dt: number, inp: Input, auto: boolean) {
      if (lost >= LIVES) return
      time += dt
      grace = Math.max(0, grace - dt)
      flash = Math.max(0, flash - dt)
      msgT = Math.max(0, msgT - dt)
      shake = Math.max(0, shake - dt)

      // the customer moves their head; faster as the session goes on
      const k = Math.min(1 + time * 0.012, 2)
      ph[0] += dt * 0.75 * k
      ph[1] += dt * 1.4 * k
      ph[2] += dt * 0.7 * k
      ph[3] += dt * 1.3 * k
      const nx = W / 2 + Math.sin(ph[0]) * 44 + Math.sin(ph[1]) * 14
      const ny = 72 + Math.sin(ph[2]) * 9 + Math.sin(ph[3]) * 5
      const vx = (nx - hx) / Math.max(dt, 1e-3)
      yaw += (clamp(vx / 70, -1, 1) - yaw) * Math.min(1, dt * 6)
      hx = nx
      hy = ny

      const t = target()
      if (auto) {
        // a smoothed tracker: follows the face with a little lag
        const a = Math.min(1, dt * 16)
        cx += (t.x - cx) * a
        cy += (t.y - cy) * a
      } else {
        if (inp.held.has('left')) cx -= 170 * dt
        if (inp.held.has('right')) cx += 170 * dt
        if (inp.held.has('up')) cy -= 170 * dt
        if (inp.held.has('down')) cy += 170 * dt
        if (inp.pointer && !isNaN(inp.px)) {
          cx += (inp.px - cx) * Math.min(1, dt * 18)
          cy += (inp.py - cy) * Math.min(1, dt * 18)
        }
      }
      cx = clamp(cx, 0, W)
      cy = clamp(cy, 0, H)

      err = Math.hypot(cx - t.x, cy - t.y)
      if (err < GOOD) {
        streak += dt
        score += dt * 20 * (1 + Math.min(streak, 10) * 0.2)
      } else {
        streak = 0
      }
      if (err > BAD && grace <= 0) {
        red += dt
        if (red >= LOSE_AFTER) {
          lost++
          red = 0
          grace = 1.5
          shake = 0.4
          msg = 'TRACKING LOST'
          msgT = 1.2
        }
      } else {
        red = Math.max(0, red - dt * 0.6)
      }

      snapT -= dt
      if (snapT <= 0) {
        snapT = SNAP_EVERY
        flash = 0.3
        msgT = 1.2
        if (err < GOOD) {
          photos++
          score += 100
          msg = 'PHOTO +100'
        } else {
          msg = 'BLURRY PHOTO'
        }
      }
    },
    draw(g: CanvasRenderingContext2D) {
      const ox = shake > 0 ? Math.round(Math.sin(shake * 70) * 2) : 0

      // shoulders and neck
      const x = hx + ox
      shade(g, 0.32)
      g.beginPath()
      g.moveTo(x - 40, H)
      g.quadraticCurveTo(x - 36, hy + 22, x - 8, hy + 20)
      g.lineTo(x + 8, hy + 20)
      g.quadraticCurveTo(x + 36, hy + 22, x + 40, H)
      g.fill()
      shade(g, 0.5)
      g.fillRect(Math.round(x - 5), Math.round(hy + 10), 10, 11)

      // face
      shade(g, 0.68)
      g.beginPath()
      g.ellipse(x, hy, 12, 15, 0, 0, Math.PI * 2)
      g.fill()
      const fx = yaw * 4
      shade(g, 0.12)
      g.fillRect(Math.round(x - 6 + fx), Math.round(hy - 1), 3, 2)
      g.fillRect(Math.round(x + 3 + fx), Math.round(hy - 1), 3, 2)
      shade(g, 0.45)
      g.fillRect(Math.round(x + fx), Math.round(hy + 2), 1, 4)
      shade(g, 0.25)
      g.fillRect(Math.round(x - 3 + fx), Math.round(hy + 8), 6, 1)

      // face-mesh landmarks, the points the tracker follows
      shade(g, 1)
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2
        g.fillRect(Math.round(x + Math.cos(a) * 11 + fx * 0.5), Math.round(hy + Math.sin(a) * 14), 1, 1)
      }
      g.fillRect(Math.round(x - 5 + fx), Math.round(hy - 3), 1, 1)
      g.fillRect(Math.round(x + 4 + fx), Math.round(hy - 3), 1, 1)
      g.fillRect(Math.round(x + fx), Math.round(hy + 6), 1, 1)

      // where the cap belongs, shown once it drifts
      const t = target()
      if (err >= GOOD) {
        shade(g, err > BAD ? 0.9 : 0.55)
        const tx = Math.round(t.x) + ox
        const ty = Math.round(t.y)
        g.fillRect(tx - 4, ty, 3, 1)
        g.fillRect(tx + 2, ty, 3, 1)
        g.fillRect(tx, ty - 4, 1, 3)
        g.fillRect(tx, ty + 2, 1, 3)
      }

      // the cap: foam front with the card, mesh sides, visor
      const jit = err > BAD && Math.floor(time * 20) % 2 === 0 ? 1 : 0
      const kx = Math.round(cx) + ox + jit
      const ky = Math.round(cy)
      shade(g, 0.42)
      g.beginPath()
      g.ellipse(kx, ky, 16, 13, 0, Math.PI, Math.PI * 2)
      g.fill()
      shade(g, 0.95)
      g.beginPath()
      g.ellipse(kx, ky, 10, 12, 0, Math.PI, Math.PI * 2)
      g.fill()
      shade(g, 0.6)
      for (let yy = ky - 9; yy < ky; yy += 2) {
        g.fillRect(kx - 14, yy, 1, 1)
        g.fillRect(kx + 13, yy, 1, 1)
      }
      shade(g, 0.2)
      g.fillRect(kx - 3, ky - 9, 7, 8)
      shade(g, 0.85)
      g.fillRect(kx - 1, ky - 7, 3, 4)
      shade(g, 0.8)
      g.fillRect(kx, ky - 13, 1, 1)
      shade(g, 0.55)
      g.beginPath()
      g.ellipse(kx + Math.round(yaw * 3), ky + 1, 18, 3, 0, 0, Math.PI * 2)
      g.fill()

      // viewfinder corners
      shade(g, 0.7)
      for (const [vx, vy, sx, sy] of [
        [3, 12, 1, 1],
        [W - 4, 12, -1, 1],
        [3, H - 4, 1, -1],
        [W - 4, H - 4, -1, -1],
      ]) {
        g.fillRect(vx, vy, 6 * sx, 1)
        g.fillRect(vx, vy, 1, 6 * sy)
      }

      // top strip: the metric and its traffic light
      const state = err < GOOD ? 'GREEN' : err <= BAD ? 'YELLOW' : 'RED'
      shade(g, 0.85)
      text(g, `ERROR ${Math.round(err)}PX ${state}`, 4, 3)
      text(g, 'ON-DEVICE', W - 4, 3, 1, 'r')
      shade(g, 0.25)
      g.fillRect(4, 10, 60, 1)
      shade(g, 1)
      g.fillRect(4, 10, Math.round((60 * red) / LOSE_AFTER), 1)

      // shutter
      const sx = W - 14
      const sy = H - 14
      shade(g, 0.8)
      g.beginPath()
      g.arc(sx, sy, 7, 0, Math.PI * 2)
      g.fill()
      shade(g, 0.1)
      g.beginPath()
      g.arc(sx, sy, 5, 0, Math.PI * 2)
      g.fill()
      if (snapT < 3) {
        shade(g, 1)
        text(g, String(Math.ceil(snapT)), sx, sy - 2, 1, 'c')
      }

      if (msgT > 0) {
        shade(g, 1)
        text(g, msg, W / 2, 30, 2, 'c')
      }
      if (flash > 0) {
        g.fillStyle = `rgba(255,255,255,${Math.min(1, flash * 3)})`
        g.fillRect(0, 0, W, H)
      }
    },
  }
}
