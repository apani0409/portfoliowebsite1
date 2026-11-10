import * as React from 'react'
import { useEffect, useRef } from 'react'
import { THRESH, live } from './engine'

const PX = 4 // CSS pixels per dither pixel

/** Two-source wave interference, dithered. One source follows the pointer. */
export default function HeroWaves({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    const host = c?.parentElement
    if (!c || !host) return
    const g = c.getContext('2d')
    if (!g) return
    let w = 0
    let h = 0
    let img: ImageData | null = null
    let mx = -1
    let my = -1
    let t = 0
    let visible = true

    const size = () => {
      w = Math.max(16, Math.ceil(host.clientWidth / PX))
      h = Math.max(16, Math.ceil(host.clientHeight / PX))
      c.width = w
      c.height = h
      img = g.createImageData(w, h)
    }

    const frame = () => {
      if (!img) return
      const d = img.data
      const bg = live.bg
      const fg = live.fg
      const s1x = w * (0.7 + 0.12 * Math.sin(t * 0.31))
      const s1y = h * (0.45 + 0.25 * Math.cos(t * 0.23))
      const s2x = mx >= 0 ? mx : w * (0.88 + 0.06 * Math.cos(t * 0.4))
      const s2y = my >= 0 ? my : h * (0.2 + 0.2 * Math.sin(t * 0.37))
      const k = 0.42
      const ph = t * 2.4
      let i = 0
      for (let y = 0; y < h; y++) {
        const row = (y & 7) << 3
        for (let x = 0; x < w; x++, i += 4) {
          const r1 = Math.sqrt((x - s1x) * (x - s1x) + (y - s1y) * (y - s1y))
          const r2 = Math.sqrt((x - s2x) * (x - s2x) + (y - s2y) * (y - s2y))
          const fade = Math.min(1, (x / w) * 1.6)
          const v = (0.5 + 0.25 * Math.cos(r1 * k - ph) + 0.25 * Math.cos(r2 * k - ph)) * (0.35 + 0.65 * fade)
          const col = v * 255 > THRESH[row | (x & 7)] ? fg : bg
          d[i] = col[0]
          d[i + 1] = col[1]
          d[i + 2] = col[2]
          d[i + 3] = 255
        }
      }
      g.putImageData(img, 0, 0)
    }

    size()
    frame()
    const ro = new ResizeObserver(() => {
      size()
      frame()
    })
    ro.observe(host)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(host)
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      mx = ((e.clientX - r.left) / r.width) * w
      my = ((e.clientY - r.top) / r.height) * h
      if (reduced) frame()
    }
    const leave = () => {
      mx = -1
      my = -1
    }
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    const repaint = () => frame()
    window.addEventListener('arc-palette', repaint)

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!visible || reduced) return
      t += dt
      frame()
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      window.removeEventListener('arc-palette', repaint)
    }
  }, [reduced])

  return <canvas ref={ref} className="arc-hero-canvas" aria-hidden="true" />
}
