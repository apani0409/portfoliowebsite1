// BALANCE: send each player to a team and keep the scale level.
import { Game, H, Input, W, person, rint, rnd, shade, text } from '../engine'

const ROUNDS = 5
const PER = 10
const CAP = PER / 2
const PICK = 3.2

export default function createBalance(): Game {
  let round = 1
  let queue: number[] = []
  let A: number[] = []
  let B: number[] = []
  let pickT = PICK
  let score = 0
  let angle = 0
  let result = ''
  let resultT = 0
  let autoAt = 0.8
  let time = 0
  let done = false

  const sum = (a: number[]) => a.reduce((s, v) => s + v, 0)

  const newRound = () => {
    queue = Array.from({ length: PER }, () => rint(1, 9))
    A = []
    B = []
    pickT = PICK
    autoAt = rnd(0.45, 1)
  }

  const reset = () => {
    round = 1
    score = 0
    angle = 0
    result = ''
    resultT = 0
    time = 0
    done = false
    newRound()
  }
  reset()

  const place = (left: boolean) => {
    const v = queue.shift()
    if (v === undefined) return
    if ((left && A.length < CAP) || B.length >= CAP) A.push(v)
    else B.push(v)
    pickT = PICK
    autoAt = rnd(0.45, 1)
    if (!queue.length) {
      const diff = Math.abs(sum(A) - sum(B))
      const pts = Math.max(0, 100 - diff * 12)
      score += pts
      result = diff === 0 ? 'PERFECT BALANCE +100' : `DIFF ${diff}  +${pts}`
      resultT = 1.8
    }
  }

  return {
    reset,
    over: () => done,
    hud: () => ({ score, a: `ROUND ${Math.min(round, ROUNDS)}/${ROUNDS}`, b: `A ${sum(A)} · B ${sum(B)}` }),
    step(dt: number, inp: Input, auto: boolean) {
      if (done) return
      time += dt
      const target = Math.max(-0.3, Math.min(0.3, (sum(B) - sum(A)) * 0.03))
      angle += (target - angle) * Math.min(1, dt * 5)
      if (resultT > 0) {
        resultT -= dt
        if (resultT <= 0) {
          round++
          if (round > ROUNDS) done = true
          else newRound()
        }
        return
      }
      pickT -= dt
      if (auto) {
        if (PICK - pickT > autoAt) {
          const left = A.length >= CAP ? false : B.length >= CAP ? true : sum(A) <= sum(B)
          place(left)
        }
        return
      }
      if (pickT <= 0) place(Math.random() < 0.5)
      else if (inp.pressed.has('left')) place(true)
      else if (inp.pressed.has('right')) place(false)
      else if (inp.tap) place(inp.px < W / 2)
    },
    draw(g: CanvasRenderingContext2D) {
      const cx = W / 2
      const by = H - 30

      // incoming player
      if (queue.length && resultT <= 0) {
        shade(g, 1)
        person(g, cx - 2, 8, Math.floor(time * 3))
        text(g, String(queue[0]), cx, 20, 3, 'c')
        shade(g, 0.8)
        text(g, '<', cx - 24, 24, 2, 'c')
        text(g, '>', cx + 24, 24, 2, 'c')
        shade(g, 0.3)
        g.fillRect(cx - 30, 40, 60, 2)
        shade(g, 1)
        g.fillRect(cx - 30, 40, Math.round(60 * Math.max(0, pickT / PICK)), 2)
        shade(g, 0.5)
        text(g, `NEXT ${queue.slice(1, 5).join(' ')}`, cx, 46, 1, 'c')
      }
      shade(g, 0.75)
      text(g, `TEAM A ${sum(A)}`, 4, 6)
      text(g, `TEAM B ${sum(B)}`, W - 4, 6, 1, 'r')

      // seesaw
      shade(g, 0.6)
      g.beginPath()
      g.moveTo(cx, by + 2)
      g.lineTo(cx - 10, H - 8)
      g.lineTo(cx + 10, H - 8)
      g.closePath()
      g.fill()
      shade(g, 0.3)
      g.fillRect(0, H - 8, W, 1)

      g.save()
      g.translate(cx, by)
      g.rotate(angle)
      shade(g, 1)
      g.fillRect(-82, -1, 164, 3)
      A.forEach((v, i) => {
        shade(g, 1)
        person(g, -78 + i * 13, -10)
        text(g, String(v), -76 + i * 13, -18)
      })
      B.forEach((v, i) => {
        shade(g, 1)
        person(g, 73 - i * 13, -10)
        text(g, String(v), 75 - i * 13, -18)
      })
      g.restore()

      if (resultT > 0) {
        shade(g, 1)
        text(g, result, cx, 22, 1, 'c')
        shade(g, 0.6)
        text(g, round < ROUNDS ? 'NEXT MATCH...' : 'FINAL WHISTLE', cx, 32, 1, 'c')
      }
    },
  }
}
