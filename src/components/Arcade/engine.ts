// Tiny 1-bit "engine": every screen is drawn in grayscale at W x H, then run
// through an 8x8 Bayer ordered dither into exactly two colors.

export const W = 192
export const H = 128

export type RGB = [number, number, number]

export interface Input {
  held: Set<string>
  pressed: Set<string>
  px: number
  py: number
  pdown: boolean
  tap: boolean
  pointer: boolean // last input came from the pointer
}

export interface Hud {
  score: number
  a: string
  b: string
}

export interface Game {
  step(dt: number, inp: Input, auto: boolean): void
  draw(g: CanvasRenderingContext2D): void
  hud(): Hud
  over(): boolean
  reset(): void
}

export type Factory = () => Game

// ---------------------------------------------------------------- palette

export interface Palette {
  id: string
  name: string
  light: string
  dark: string
  invert: boolean // page uses the dark color as background
}

export const PALETTES: Palette[] = [
  { id: 'paper', name: 'PAPER', light: '#ece6d4', dark: '#1d1b24', invert: false },
  { id: 'night', name: 'NIGHT', light: '#e4dfd0', dark: '#131218', invert: true },
  { id: 'amber', name: 'AMBER', light: '#ffb547', dark: '#1c1203', invert: true },
  { id: 'mint', name: 'MINT', light: '#a9f0c2', dark: '#0b1d14', invert: true },
  { id: 'blueprint', name: 'BLUEPRINT', light: '#e8eeff', dark: '#2440b8', invert: false },
]

const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]

export const live = { bg: hex(PALETTES[0].dark), fg: hex(PALETTES[0].light) }

export function applyPalette(p: Palette) {
  live.bg = hex(p.dark)
  live.fg = hex(p.light)
}

// ---------------------------------------------------------------- dither

const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
  52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39,
  13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
]
export const THRESH = new Uint8Array(64).map((_, i) => Math.floor((BAYER8[i] + 0.5) * 4))

/** Replace the canvas contents with its 2-color ordered-dither version. */
export function dither(g: CanvasRenderingContext2D, w: number, h: number, bg: RGB, fg: RGB) {
  const img = g.getImageData(0, 0, w, h)
  const d = img.data
  let i = 0
  for (let y = 0; y < h; y++) {
    const row = (y & 7) << 3
    for (let x = 0; x < w; x++, i += 4) {
      const l = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8
      const c = l > THRESH[row | (x & 7)] ? fg : bg
      d[i] = c[0]
      d[i + 1] = c[1]
      d[i + 2] = c[2]
      d[i + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
}

// ---------------------------------------------------------------- drawing helpers

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
export const rnd = (a = 0, b = 1) => a + Math.random() * (b - a)
export const rint = (a: number, b: number) => Math.floor(rnd(a, b + 1))
export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export function shade(g: CanvasRenderingContext2D, v: number) {
  const c = Math.round(clamp(v, 0, 1) * 255)
  g.fillStyle = `rgb(${c},${c},${c})`
}

export function box(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  x = Math.round(x)
  y = Math.round(y)
  g.fillRect(x, y, w, 1)
  g.fillRect(x, y + h - 1, w, 1)
  g.fillRect(x, y, 1, h)
  g.fillRect(x + w - 1, y, 1, h)
}

export function person(g: CanvasRenderingContext2D, x: number, y: number, step = 0) {
  x = Math.round(x)
  y = Math.round(y)
  g.fillRect(x + 1, y, 3, 3)
  g.fillRect(x, y + 3, 5, 3)
  if (step % 2 === 0) {
    g.fillRect(x + 1, y + 6, 1, 2)
    g.fillRect(x + 3, y + 6, 1, 2)
  } else {
    g.fillRect(x, y + 6, 1, 2)
    g.fillRect(x + 4, y + 6, 1, 2)
  }
}

// 3x5 pixel font, rows top to bottom, '1' = lit
const GLYPHS: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111101101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010',
  '8': '111101111101111', '9': '111101111001110',
  '.': '000000000000010', ',': '000000000010100', ':': '000010000010000', '-': '000000111000000',
  '+': '000010111010000', '%': '101001010100101', '/': '001001010100100', '!': '010010010000010',
  '?': '110001010000010', '>': '100010001010100', '<': '001010100010001', '=': '000111000111000',
  '#': '101111101111101', '*': '101010101000000', '(': '010100100100010', ')': '010001001001010',
  '_': '000000000000111', "'": '010010000000000',
}

export const textWidth = (s: string, scale = 1) => (s.length ? s.length * 4 * scale - scale : 0)

export function text(
  g: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  scale = 1,
  align: 'l' | 'c' | 'r' = 'l',
) {
  const str = s.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const wdt = textWidth(str, scale)
  let cx = Math.round(align === 'c' ? x - wdt / 2 : align === 'r' ? x - wdt : x)
  const cy = Math.round(y)
  for (const ch of str) {
    const gl = GLYPHS[ch]
    if (gl) {
      for (let i = 0; i < 15; i++) {
        if (gl.charCodeAt(i) === 49) g.fillRect(cx + (i % 3) * scale, cy + ((i / 3) | 0) * scale, scale, scale)
      }
    }
    cx += 4 * scale
  }
}

// ---------------------------------------------------------------- input

const KEYMAP: Record<string, string> = {
  arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down', ' ': 'space', spacebar: 'space', enter: 'space',
}
const SWALLOW = new Set(['left', 'right', 'up', 'down', 'space'])

export function makeInput(canvas: HTMLCanvasElement, listen: boolean) {
  const inp: Input = {
    held: new Set(), pressed: new Set(), px: NaN, py: NaN, pdown: false, tap: false, pointer: false,
  }
  if (!listen) return { inp, endFrame() {}, dispose() {} }

  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    inp.px = ((e.clientX - r.left) / r.width) * W
    inp.py = ((e.clientY - r.top) / r.height) * H
  }
  const move = (e: PointerEvent) => {
    local(e)
    inp.pointer = true
  }
  const down = (e: PointerEvent) => {
    local(e)
    inp.pdown = true
    inp.tap = true
    inp.pointer = true
  }
  const up = () => {
    inp.pdown = false
  }
  const leave = () => {
    inp.pdown = false
  }
  const keydown = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null
    if (t && t !== canvas && t.closest && t.closest('a,button,input,textarea,select')) return
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const raw = e.key.toLowerCase()
    const k = KEYMAP[raw] || raw
    if (SWALLOW.has(k)) e.preventDefault()
    if (!e.repeat) inp.pressed.add(k)
    inp.held.add(k)
    inp.pointer = false
  }
  const keyup = (e: KeyboardEvent) => {
    const raw = e.key.toLowerCase()
    inp.held.delete(KEYMAP[raw] || raw)
  }
  const blur = () => inp.held.clear()

  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointerleave', leave)
  window.addEventListener('pointerup', up)
  window.addEventListener('keydown', keydown)
  window.addEventListener('keyup', keyup)
  window.addEventListener('blur', blur)
  return {
    inp,
    endFrame() {
      inp.pressed.clear()
      inp.tap = false
    },
    dispose() {
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
      window.removeEventListener('blur', blur)
    },
  }
}
