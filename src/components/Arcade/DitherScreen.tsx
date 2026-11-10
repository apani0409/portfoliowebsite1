import * as React from 'react'
import { useEffect, useRef } from 'react'
import { Factory, H, Hud, W, dither, live, makeInput } from './engine'

interface Props {
  make: Factory
  play?: boolean
  running: boolean
  onHud?: (h: Hud, over: boolean) => void
  label: string
}

/** Runs one game on a W x H canvas and dithers every frame to two colors. */
export default function DitherScreen({ make, play = false, running, onHud, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const runRef = useRef(running)
  runRef.current = running
  const hudRef = useRef(onHud)
  hudRef.current = onHud

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const g = c.getContext('2d', { willReadFrequently: true })
    if (!g) return
    const game = make()
    const io = makeInput(c, play)
    let visible = true
    const ob = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    ob.observe(c)

    const render = () => {
      g.setTransform(1, 0, 0, 1, 0, 0)
      g.fillStyle = '#000'
      g.fillRect(0, 0, W, H)
      game.draw(g)
      dither(g, W, H, live.bg, live.fg)
    }

    if (!play) for (let i = 0; i < 120; i++) game.step(1 / 30, io.inp, true)
    render()
    const repaint = () => render()
    window.addEventListener('arc-palette', repaint)

    let raf = 0
    let last = performance.now()
    let hudT = 0
    let overAt = -1
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!runRef.current || !visible) {
        io.endFrame()
        return
      }
      game.step(dt, io.inp, !play)
      if (game.over()) {
        if (!play) game.reset()
        else {
          if (overAt < 0) overAt = now
          if (now - overAt > 700 && (io.inp.pressed.has('space') || io.inp.tap)) {
            game.reset()
            overAt = -1
          }
        }
      }
      render()
      hudT -= dt
      if (hudT <= 0 && hudRef.current) {
        hudT = 0.12
        hudRef.current(game.hud(), game.over())
      }
      io.endFrame()
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ob.disconnect()
      io.dispose()
      window.removeEventListener('arc-palette', repaint)
    }
  }, [make, play])

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      className={play ? 'arc-canvas arc-canvas--play' : 'arc-canvas'}
      role={play ? 'img' : undefined}
      aria-label={play ? label : undefined}
      aria-hidden={play ? undefined : true}
      tabIndex={play ? 0 : -1}
    />
  )
}
