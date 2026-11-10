// TAGGER: tag each word of a parliamentary sentence before it reaches the gate.
import { Game, H, Input, W, box, rnd, shade, text, textWidth } from '../engine'

const TAGS = ['NOUN', 'VERB', 'ADJ', 'FUNC']
const CODE: Record<string, number> = { N: 0, V: 1, A: 2, F: 3 }
const RAW = [
  'LA/F COMISION/N APROBO/V EL/F PROYECTO/N NUEVO/A',
  'EL/F DIPUTADO/N PRESENTA/V UNA/F MOCION/N URGENTE/A',
  'LOS/F VECINOS/N PIDEN/V AGUA/N POTABLE/A',
  'LA/F ASAMBLEA/N DISCUTE/V EL/F PRESUPUESTO/N ANUAL/A',
  'UN/F INFORME/N BREVE/A LLEGA/V A/F LA/F SESION/N',
  'EL/F PRESIDENTE/N LEVANTA/V LA/F SESION/N',
  'LA/F LEY/N GARANTIZA/V EL/F DERECHO/N SOCIAL/A',
  'LOS/F AGRICULTORES/N VENDEN/V PRODUCTOS/N FRESCOS/A EN/F LA/F FERIA/N',
  'ESTA/F COMISION/N RECHAZA/V LA/F REFORMA/N FISCAL/A',
  'NUESTRO/F PAIS/N NECESITA/V CARRETERAS/N SEGURAS/A',
]
const SENTENCES = RAW.map((s) =>
  s.split(' ').map((w) => {
    const [t, c] = w.split('/')
    return { t, tag: CODE[c] }
  }),
)

const GATE = 20
const ROW = 52

interface Word {
  t: string
  tag: number
  x: number
  y: number
  vy: number
  st: 0 | 1 | 2 // pending, right, wrong
  got: number
  end: boolean // last word of its sentence
  autoAt: number
}

export default function createTagger(): Game {
  let words: Word[] = []
  let order: number[] = []
  let si = 0
  let wi = 0
  let score = 0
  let lives = 3
  let combo = 0
  let right = 0
  let total = 0
  let time = 0
  let flash = [0, 0, 0, 0]
  let shake = 0
  let sentencesDone = 0

  const reset = () => {
    words = []
    order = SENTENCES.map((_, i) => i).sort(() => Math.random() - 0.5)
    si = 0
    wi = 0
    score = 0
    lives = 3
    combo = 0
    right = 0
    total = 0
    time = 0
    flash = [0, 0, 0, 0]
    shake = 0
    sentencesDone = 0
  }
  reset()

  const current = () => words.find((w) => w.st === 0)

  const answer = (k: number) => {
    const cur = current()
    flash[k] = 0.22
    if (!cur) return
    total++
    cur.got = k
    if (k === cur.tag) {
      cur.st = 1
      right++
      combo++
      score += 10 + 5 * Math.min(combo, 10)
    } else {
      cur.st = 2
      lives--
      combo = 0
      shake = 0.3
    }
    if (cur.end) sentencesDone++
  }

  const spawn = () => {
    const last = words[words.length - 1]
    const gap = last && last.end ? 34 : 10
    if (last && last.x + textWidth(last.t, 2) > W - gap) return
    const s = SENTENCES[order[si % order.length]]
    const w = s[wi]
    wi++
    const end = wi >= s.length
    if (end) {
      wi = 0
      si++
    }
    words.push({ t: w.t, tag: w.tag, x: W + 2, y: ROW, vy: 0, st: 0, got: -1, end, autoAt: rnd(64, 116) })
  }

  return {
    reset,
    over: () => lives <= 0,
    hud: () => ({
      score,
      a: `LIVES ${Math.max(0, lives)}/3`,
      b: `ACC ${total ? Math.round((right / total) * 100) : 100}%`,
    }),
    step(dt: number, inp: Input, auto: boolean) {
      if (lives <= 0) return
      time += dt
      const speed = Math.min(22 + time * 0.4, 48)
      spawn()
      for (const w of words) {
        w.x -= speed * dt
        if (w.st === 1) w.y -= 26 * dt
        if (w.st === 2) {
          w.vy += 180 * dt
          w.y += w.vy * dt
        }
      }
      words = words.filter((w) => w.y > -14 && w.y < H + 14 && w.x > -120)
      for (let k = 0; k < 4; k++) flash[k] = Math.max(0, flash[k] - dt)
      shake = Math.max(0, shake - dt)

      for (let k = 0; k < 4; k++) if (inp.pressed.has(String(k + 1))) answer(k)
      if (inp.tap && inp.py > H - 24) answer(Math.max(0, Math.min(3, Math.floor(inp.px / (W / 4)))))

      const cur = current()
      if (auto && cur && cur.x < cur.autoAt) {
        answer(Math.random() < 0.93 ? cur.tag : (cur.tag + 1 + Math.floor(Math.random() * 3)) % 4)
      }
      const c2 = current()
      if (c2 && c2.x < GATE) {
        c2.st = 2
        c2.got = -1
        lives--
        combo = 0
        total++
        shake = 0.3
        if (c2.end) sentencesDone++
      }
    },
    draw(g: CanvasRenderingContext2D) {
      const ox = shake > 0 ? Math.round(Math.sin(shake * 60) * 2) : 0
      // the conveyor band
      const grad = g.createLinearGradient(0, ROW - 22, 0, ROW + 30)
      grad.addColorStop(0, '#000')
      grad.addColorStop(0.5, '#3a3a3a')
      grad.addColorStop(1, '#000')
      g.fillStyle = grad
      g.fillRect(0, ROW - 22, W, 52)
      // gate
      shade(g, 0.85)
      for (let y = ROW - 20; y < ROW + 28; y += 4) g.fillRect(GATE + ox, y, 1, 2)
      shade(g, 0.6)
      text(g, 'GATE', GATE + 3 + ox, ROW + 24)

      const cur = current()
      for (const w of words) {
        const x = Math.round(w.x) + ox
        if (w.st === 0) {
          shade(g, w === cur ? 1 : 0.5)
          text(g, w.t, x, w.y, 2)
          if (w === cur) {
            shade(g, 1)
            g.fillRect(x, w.y + 13, textWidth(w.t, 2), 1)
            g.fillRect(x - 3, w.y + 2, 1, 6)
          }
        } else {
          shade(g, w.st === 1 ? 0.95 : 0.4)
          text(g, w.t, x, w.y, 2)
          shade(g, 1)
          text(g, w.st === 1 ? TAGS[w.got] : w.got < 0 ? 'MISS' : 'X ' + TAGS[w.got], x, w.y - 9)
        }
      }

      // top strip
      shade(g, 0.75)
      text(g, `SENTENCE ${sentencesDone + 1}`, 4, 5)
      text(g, 'SPANISH POS TAGGING', W - 4, 5, 1, 'r')
      shade(g, 0.3)
      g.fillRect(0, 13, W, 1)

      // tag buttons
      const bw = W / 4
      for (let k = 0; k < 4; k++) {
        const x = Math.round(k * bw)
        const lit = flash[k] > 0
        if (lit) {
          shade(g, 1)
          g.fillRect(x + 2, H - 21, Math.round(bw) - 4, 19)
          shade(g, 0)
        } else {
          shade(g, 0.8)
          box(g, x + 2, H - 21, Math.round(bw) - 4, 19)
        }
        text(g, `${k + 1} ${TAGS[k]}`, x + bw / 2, H - 14, 1, 'c')
      }
    },
  }
}
