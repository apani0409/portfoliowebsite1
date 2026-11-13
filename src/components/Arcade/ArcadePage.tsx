import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import './arcade.css'
import DitherScreen from './DitherScreen'
import HeroWaves from './HeroWaves'
import { CARTS, Cart, RESUME } from './cartridges'
import { Hud, PALETTES, applyPalette } from './engine'
import experiences from '../../data/experiences.json'

const GITHUB = 'https://github.com/apani0409'
const LINKEDIN = 'https://www.linkedin.com/in/alessandro-pani-931945245/'
const EMAIL = 'mailto:alessandro.pani1010@gmail.com'

const SKILLS: [string, string[]][] = [
  ['Languages', ['Python', 'TypeScript / JavaScript', 'PHP', 'SQL (Oracle, PostgreSQL, SQLite)']],
  ['Web', ['React', 'Astro', 'Django', 'REST APIs']],
  ['Data & ML', ['pandas', 'scikit-learn', 'Power BI', 'PyTorch', 'Hugging Face Transformers', 'spaCy', 'Stanza']],
  ['Tools', ['Git', 'Docker', 'Linux / Bash', 'SLURM (HPC)', 'pytest', 'CI pipelines', 'Jira', 'Oracle Cloud']],
  ['Spoken', ['Spanish (native)', 'Italian (native)', 'English (C1, professional)']],
]

interface Experience {
  company: string
  position: string
  period: string
  details: string[]
}

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(6, '0')

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduced
}

function Tile({ c, onOpen, paused, reduced }: { c: Cart; onOpen: (c: Cart, el: HTMLElement) => void; paused: boolean; reduced: boolean }) {
  const [hot, setHot] = useState(false)
  return (
    <li className="arc-tile-wrap">
      <button
        type="button"
        className="arc-tile"
        onClick={(e) => onOpen(c, e.currentTarget)}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
      >
        <span className="arc-tile-screen">
          <DitherScreen make={c.make} running={!paused && (!reduced || hot)} label={`${c.game} demo`} />
        </span>
        <span className="arc-tile-meta">
          <span className="arc-tile-slot">CART {c.slot}</span>
          <span className="arc-tile-game">{c.game}</span>
          <span className="arc-tile-project">{c.project}</span>
          <span className="arc-tile-line">{c.tagline}</span>
          <span className="arc-tile-press">
            PRESS START <span className="arc-ico" aria-hidden="true">▶</span>
          </span>
        </span>
      </button>
    </li>
  )
}

function Cabinet({ c, onClose }: { c: Cart; onClose: () => void }) {
  const [hud, setHud] = useState<Hud & { over: boolean }>({ score: 0, a: '', b: '', over: false })
  const [hi, setHi] = useState(0)
  const screen = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      setHi(Number(localStorage.getItem(`arc-hi-${c.id}`)) || 0)
    } catch {
      setHi(0)
    }
  }, [c.id])

  const onHud = useCallback((h: Hud, over: boolean) => {
    setHud((p) => (p.score === h.score && p.a === h.a && p.b === h.b && p.over === over ? p : { ...h, over }))
  }, [])

  useEffect(() => {
    if (hud.over && hud.score > hi) {
      setHi(hud.score)
      try {
        localStorage.setItem(`arc-hi-${c.id}`, String(hud.score))
      } catch {
        /* storage blocked: keep it in memory */
      }
    }
  }, [hud.over, hud.score, hi, c.id])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    screen.current?.querySelector('canvas')?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="arc-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="arc-cab-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="arc-cab">
        <div className="arc-cab-bar">
          <span>
            CART {c.slot} · {c.game}
          </span>
          <button type="button" className="arc-cab-x" onClick={onClose}>
            ESC · EXIT
          </button>
        </div>
        <div className="arc-cab-body">
          <div className="arc-cab-play">
            <div className="arc-hud" aria-live="off">
              <span>SCORE {pad(hud.score)}</span>
              <span>{hud.a}</span>
              <span>{hud.b}</span>
              <span>HI {pad(Math.max(hi, hud.over ? hud.score : 0))}</span>
            </div>
            <div className="arc-screen" ref={screen}>
              <DitherScreen make={c.make} play running onHud={onHud} label={`${c.game}, a mini-game about ${c.project}`} />
              {hud.over && (
                <div className="arc-over" role="status">
                  <strong>GAME OVER</strong>
                  <span>
                    SCORE {hud.score} · HI {Math.max(hi, hud.score)}
                  </span>
                  <span className="arc-blink">SPACE OR TAP TO PLAY AGAIN</span>
                </div>
              )}
            </div>
            <p className="arc-howto">{c.howto}</p>
            <p className="arc-controls">CONTROLS · {c.controls}</p>
          </div>
          <aside className="arc-brief">
            <p className="arc-kicker">THE REAL PROJECT</p>
            <h2 id="arc-cab-title" className="arc-brief-title">
              {c.project}
            </h2>
            <p className="arc-brief-role">
              {c.context}
              <br />
              <span>{c.period}</span>
            </p>
            <p>{c.summary}</p>
            <ul className="arc-list">
              {c.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <ul className="arc-chips" aria-label="Stack">
              {c.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="arc-brief-links">
              {c.links.map((l) => (
                <a key={l.href} className="arc-btn" href={l.href} target="_blank" rel="noreferrer">
                  {l.label} <span className="arc-ico" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function ArcadePage() {
  const [pal, setPal] = useState(0)
  const [open, setOpen] = useState<Cart | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  const p = PALETTES[pal]

  useEffect(() => {
    let i = -1
    try {
      const saved = localStorage.getItem('arc-palette')
      if (saved) i = PALETTES.findIndex((x) => x.id === saved)
    } catch {
      i = -1
    }
    if (i < 0) i = window.matchMedia('(prefers-color-scheme: dark)').matches ? 1 : 0
    setPal(i)
  }, [])

  useEffect(() => {
    applyPalette(p)
    document.documentElement.style.background = p.invert ? p.dark : p.light
    window.dispatchEvent(new Event('arc-palette'))
  }, [p])

  const cyclePalette = () => {
    const n = (pal + 1) % PALETTES.length
    setPal(n)
    try {
      localStorage.setItem('arc-palette', PALETTES[n].id)
    } catch {
      /* ignore */
    }
  }

  const onOpen = useCallback((c: Cart, el: HTMLElement) => {
    opener.current = el
    setOpen(c)
  }, [])
  const onClose = useCallback(() => {
    setOpen(null)
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }))
  }, [])

  const vars = {
    '--light': p.light,
    '--dark': p.dark,
    '--bg': p.invert ? p.dark : p.light,
    '--fg': p.invert ? p.light : p.dark,
  } as React.CSSProperties

  return (
    <div className="arc" style={vars}>
      <a className="arc-skip" href="#games">
        Skip to projects
      </a>
      <header className="arc-top arc-wrap">
        <span className="arc-logo">
          <span className="arc-logo-mark" aria-hidden="true">
            AP
          </span>
          PORTFOLIO.EXE
        </span>
        <nav className="arc-nav" aria-label="Sections">
          <a href="#games">Games</a>
          <a href="#log">Career</a>
          <a href="#inventory">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
        <button type="button" className="arc-btn arc-btn--small" onClick={cyclePalette} aria-label={`Change palette, current ${p.name}`}>
          <span className="arc-ico" aria-hidden="true">◐</span> {p.name}
        </button>
      </header>

      <section className="arc-hero arc-wrap" aria-labelledby="arc-name">
        <div className="arc-hero-screen">
          <HeroWaves reduced={reduced} />
          <div className="arc-marquee">
            <p className="arc-eyebrow">
              PLAYER 1 · COSTA RICA<span className="arc-cursor" aria-hidden="true" />
            </p>
            <h1 id="arc-name" className="arc-name">
              Alessandro
              <br />
              Pani
            </h1>
            <p className="arc-lede">
              Computer Science student at the Universidad de Costa Rica who builds and ships production software: a web
              platform that replaced a paper process for 50+ university staff, language-model research pipelines for a UCR
              linguistics project, and websites for 10+ freelance clients.
            </p>
            <p className="arc-open">Open to internships and junior roles in 2027.</p>
            <div className="arc-actions">
              <a className="arc-btn arc-btn--solid" href={RESUME} target="_blank" rel="noreferrer">
                <span className="arc-ico" aria-hidden="true">▶</span> Résumé (PDF)
              </a>
              <a className="arc-btn" href={GITHUB} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="arc-btn" href={LINKEDIN} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a className="arc-btn" href={EMAIL}>
                Email
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="games" className="arc-section arc-wrap" aria-labelledby="arc-games-h">
        <h2 id="arc-games-h" className="arc-h2">
          Select game
        </h2>
        <p className="arc-intro">
          Every cartridge is a real project. Press start to play a short game about what it does; the brief, stack and
          links are inside. <span className="arc-insert">INSERT COIN</span>
        </p>
        <ul className="arc-grid">
          {CARTS.map((c) => (
            <Tile key={c.id} c={c} onOpen={onOpen} paused={open !== null} reduced={reduced} />
          ))}
        </ul>
      </section>

      <section id="log" className="arc-section arc-wrap" aria-labelledby="arc-log-h">
        <h2 id="arc-log-h" className="arc-h2">
          Career log
        </h2>
        <ol className="arc-log">
          {(experiences as Experience[]).map((e) => (
            <li key={e.company} className="arc-log-item">
              <p className="arc-log-period">{e.period}</p>
              <div>
                <h3 className="arc-log-company">{e.company}</h3>
                <p className="arc-log-role">{e.position}</p>
                <ul className="arc-list">
                  {e.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        <div className="arc-edu">
          <p className="arc-log-period">Coursework ends Dec 2027</p>
          <div>
            <h3 className="arc-log-company">Universidad de Costa Rica</h3>
            <p className="arc-log-role">B.S. Computer Science (Software Engineering)</p>
          </div>
        </div>
      </section>

      <section id="inventory" className="arc-section arc-wrap" aria-labelledby="arc-inv-h">
        <h2 id="arc-inv-h" className="arc-h2">
          Inventory
        </h2>
        <div className="arc-inv">
          {SKILLS.map(([k, items]) => (
            <div key={k} className="arc-inv-box">
              <h3 className="arc-inv-title">{k}</h3>
              <ul>
                {items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="arc-footer arc-wrap">
        <p className="arc-continue">
          Continue?<span className="arc-cursor" aria-hidden="true" />
        </p>
        <p className="arc-footer-text">
          Looking for a 2027 internship or junior role in software engineering, full-stack or ML. Spanish, Italian and
          English.
        </p>
        <div className="arc-actions">
          <a className="arc-btn arc-btn--solid" href={EMAIL}>
            alessandro.pani1010@gmail.com
          </a>
          <a className="arc-btn" href={LINKEDIN} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="arc-btn" href={GITHUB} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="arc-btn" href={RESUME} target="_blank" rel="noreferrer">
            Résumé
          </a>
        </div>
        <p className="arc-credits">
          Every screen is drawn at 192×128 and passed through an 8×8 Bayer ordered dither: two colors, no images, no game
          engine. Built with Gatsby and canvas. <a href="/classic/">Classic version</a>
        </p>
      </footer>

      {open && <Cabinet c={open} onClose={onClose} />}
    </div>
  )
}
