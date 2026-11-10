// SWARM: your pointer is the hand. Herd the particle swarm into each node.
import { Game, H, Input, W, rnd, shade, text } from '../engine'

const N = 150
const ROUND = 45
const R = 15

export default function createSwarm(): Game {
  const px = new Float32Array(N)
  const py = new Float32Array(N)
  const vx = new Float32Array(N)
  const vy = new Float32Array(N)
  let ax = W / 2
  let ay = H / 2
  let tx = 0
  let ty = 0
  let tvx = 0
  let tvy = 0
  let prog = 0
  let nodes = 0
  let score = 0
  let left = ROUND
  let time = 0
  let pulse = 0
  let flash = 0
  let near = 0

  const newTarget = () => {
    for (let k = 0; k < 20; k++) {
      tx = rnd(24, W - 24)
      ty = rnd(26, H - 18)
      if (Math.hypot(tx - ax, ty - ay) > 60) break
    }
    const a = rnd(0, Math.PI * 2)
    tvx = Math.cos(a) * 6
    tvy = Math.sin(a) * 6
    prog = 0
  }

  const reset = () => {
    for (let i = 0; i < N; i++) {
      px[i] = rnd(0, W)
      py[i] = rnd(0, H)
      vx[i] = rnd(-10, 10)
      vy[i] = rnd(-10, 10)
    }
    ax = W / 2
    ay = H / 2
    nodes = 0
    score = 0
    left = ROUND
    time = 0
    pulse = 0
    flash = 0
    newTarget()
  }
  reset()

  return {
    reset,
    over: () => left <= 0,
    hud: () => ({ score, a: `NODES ${nodes}`, b: `TIME ${Math.max(0, Math.ceil(left))}S` }),
    step(dt: number, inp: Input, auto: boolean) {
      if (left <= 0) return
      time += dt
      left -= dt
      pulse = Math.max(0, pulse - dt)
      flash = Math.max(0, flash - dt)

      if (auto) {
        const gx = tx + Math.sin(time * 2.1) * 10
        const gy = ty + Math.cos(time * 1.7) * 8
        ax += (gx - ax) * Math.min(1, dt * 1.6)
        ay += (gy - ay) * Math.min(1, dt * 1.6)
      } else {
        if (inp.held.has('left')) ax -= 90 * dt
        if (inp.held.has('right')) ax += 90 * dt
        if (inp.held.has('up')) ay -= 90 * dt
        if (inp.held.has('down')) ay += 90 * dt
        if (inp.pointer && !isNaN(inp.px)) {
          ax += (inp.px - ax) * Math.min(1, dt * 12)
          ay += (inp.py - ay) * Math.min(1, dt * 12)
        }
      }
      ax = Math.max(4, Math.min(W - 4, ax))
      ay = Math.max(4, Math.min(H - 4, ay))

      const kick = !auto && (inp.pressed.has('space') || inp.tap)
      if (kick) pulse = 0.4

      // target drifts slowly and bounces off the walls
      tx += tvx * dt
      ty += tvy * dt
      if (tx < 20 || tx > W - 20) tvx = -tvx
      if (ty < 22 || ty > H - 14) tvy = -tvy

      const damp = Math.pow(0.96, dt * 60)
      near = 0
      for (let i = 0; i < N; i++) {
        const dx = ax - px[i]
        const dy = ay - py[i]
        const d = Math.sqrt(dx * dx + dy * dy) + 0.001
        const a = 6000 / (d + 16)
        const s = 0.3 * a
        vx[i] = (vx[i] + (dx / d * a - dy / d * s) * dt) * damp
        vy[i] = (vy[i] + (dy / d * a + dx / d * s) * dt) * damp
        if (kick && d < 46) {
          vx[i] -= (dx / d) * 160
          vy[i] -= (dy / d) * 160
        }
        px[i] += vx[i] * dt
        py[i] += vy[i] * dt
        if (px[i] < 0) { px[i] = 0; vx[i] = -vx[i] * 0.6 }
        if (px[i] > W - 1) { px[i] = W - 1; vx[i] = -vx[i] * 0.6 }
        if (py[i] < 0) { py[i] = 0; vy[i] = -vy[i] * 0.6 }
        if (py[i] > H - 1) { py[i] = H - 1; vy[i] = -vy[i] * 0.6 }
        const ex = px[i] - tx
        const ey = py[i] - ty
        if (ex * ex + ey * ey < R * R) near++
      }
      const need = N * 0.35
      prog = Math.max(0, Math.min(1, prog + (near >= need ? dt * 0.9 : -dt * 0.25)))
      if (prog >= 1) {
        nodes++
        score += 100 + Math.round(left * 2)
        flash = 0.5
        newTarget()
      }
    },
    draw(g: CanvasRenderingContext2D) {
      // halo around the hand
      const glow = g.createRadialGradient(ax, ay, 0, ax, ay, 38)
      glow.addColorStop(0, `rgba(255,255,255,${0.42 + pulse * 0.8})`)
      glow.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = glow
      g.fillRect(ax - 40, ay - 40, 80, 80)

      // target node
      const tg = g.createRadialGradient(tx, ty, 0, tx, ty, R)
      tg.addColorStop(0, `rgba(255,255,255,${0.1 + prog * 0.35 + flash})`)
      tg.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = tg
      g.fillRect(tx - R, ty - R, R * 2, R * 2)
      for (let k = 0; k < 40; k++) {
        const ang = (k / 40) * Math.PI * 2 - Math.PI / 2
        const on = k / 40 < prog
        shade(g, on ? 1 : 0.55)
        const r = on ? R + 1 : R
        g.fillRect(Math.round(tx + Math.cos(ang) * r), Math.round(ty + Math.sin(ang) * r), on ? 2 : 1, on ? 2 : 1)
      }
      shade(g, 0.8)
      g.fillRect(Math.round(tx) - 2, Math.round(ty), 5, 1)
      g.fillRect(Math.round(tx), Math.round(ty) - 2, 1, 5)

      // particles
      shade(g, 1)
      for (let i = 0; i < N; i++) g.fillRect(px[i] | 0, py[i] | 0, 1, 1)

      // timer + count
      shade(g, 0.6)
      g.fillRect(0, 0, Math.round((W * Math.max(0, left)) / ROUND), 2)
      shade(g, 0.8)
      text(g, `NODES ${nodes}`, 4, 6)
      text(g, 'ORBITALS', W - 4, 6, 1, 'r')
    },
  }
}
