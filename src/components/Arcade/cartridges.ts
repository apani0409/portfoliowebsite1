import type { Factory } from './engine'
import createTagger from './games/tagger'
import createPaperless from './games/paperless'
import createUptime from './games/uptime'
import createPriceRider from './games/pricerider'
import createSwarm from './games/swarm'
import createCheckin from './games/checkin'
import createBalance from './games/balance'
import createDescent from './games/descent'

export const RESUME = '/download/Alessandro_Pani_Resume.pdf'

export interface Cart {
  id: string
  slot: string
  game: string
  project: string
  context: string
  period: string
  tagline: string
  summary: string
  bullets: string[]
  stack: string[]
  links: { label: string; href: string }[]
  howto: string
  controls: string
  make: Factory
}

export const CARTS: Cart[] = [
  {
    id: 'tagger',
    slot: '01',
    game: 'TAGGER',
    project: 'Ensamblaje Piñero',
    context: 'Research & Development Assistant · Universidad de Costa Rica',
    period: 'Jun 2026 – Present',
    tagline: 'Language-model research on 7,063 parliamentary transcripts',
    summary:
      'Sole developer on a language and discourse research project (C6354, School of Philology), implementing the analysis design defined by a linguistics PhD.',
    bullets: [
      'Python pipelines that collected, extracted and segmented 7,063 Legislative Assembly session transcripts (~17 GB) into a traceable corpus.',
      'Benchmark of Spanish part-of-speech taggers, from pretrained pipelines (Stanza, spaCy) to a fine-tuned transformer language model (BETO), with a strict EAGLES evaluator and 67 automated tests.',
      "SLURM jobs prepared to fine-tune BETO on the A100 GPUs of UCR's high-performance computing cluster.",
      'Bilingual project website (Astro, TypeScript) and user guides so the research team can edit content without programming.',
    ],
    stack: ['Python', 'PyTorch', 'Hugging Face', 'Stanza', 'spaCy', 'pytest', 'SLURM', 'Astro'],
    links: [{ label: 'Résumé', href: RESUME }],
    howto:
      'Tag every word before it reaches the gate. Part-of-speech tagging is the task the benchmark scores, word by word, across the whole corpus.',
    controls: '1-4 or tap a tag',
    make: createTagger,
  },
  {
    id: 'paperless',
    slot: '02',
    game: 'PAPERLESS',
    project: 'SIGECAT',
    context: 'Full-Stack Developer · Vicerrectoría de Administración, UCR',
    period: 'Jan 2026 – Jun 2026',
    tagline: 'Replaced a paper process for 50+ university staff',
    summary:
      "A workload and work-shift declaration platform that replaced a paper-based process for 50+ staff: employees declare shift functions, licenses and rest periods while admins manage the university's organizational hierarchy.",
    bullets: [
      'React 19 + TypeScript SPA (Vite, Material UI) with client-side PDF export of declarations.',
      'Framework-less REST API in PHP 8.4 on Oracle Database with a layered architecture and prepared statements; optimized slow queries from ~4 s to under 1 s.',
      'Token auth with refresh-token rotation, bcrypt, per-IP rate limiting and account lockout.',
      'Dockerized monorepo with CI (lint, build, PHPStan) plus endpoint and concurrency tests.',
    ],
    stack: ['React', 'TypeScript', 'PHP 8.4', 'Oracle', 'Docker', 'CI', 'PHPStan'],
    links: [{ label: 'Résumé', href: RESUME }],
    howto: 'Catch every paper form with the scanner before it hits the floor and turn it into a record. Dodge the bugs.',
    controls: 'arrow keys / A D, or move the pointer',
    make: createPaperless,
  },
  {
    id: 'uptime',
    slot: '03',
    game: 'UPTIME',
    project: 'Freelance web development',
    context: 'Independent · legal, hospitality and e-commerce clients',
    period: '2022 – Present',
    tagline: 'Built, shipped and kept running websites for 10+ clients',
    summary:
      'Designed, built and shipped websites for 10+ clients across legal (VM Legal Group), hospitality and e-commerce, and still support them.',
    bullets: [
      'Own the full delivery cycle: requirements, development, deployment, SEO and analytics. Mostly React.',
      'Troubleshoot site outages, broken forms and email delivery; configure email, DNS, SSL and hosting migrations.',
      'Train clients to update their own content.',
      'Issimo Suites Hotel (Dec 2022 – Jan 2025): website on Wix with custom JavaScript, SEO and booking UX.',
    ],
    stack: ['React', 'JavaScript', 'DNS', 'SSL', 'Email', 'Hosting', 'SEO', 'Wix'],
    links: [{ label: 'Résumé', href: RESUME }],
    howto: 'Ten client sites, and something always breaks: DNS, SSL, mail, a form. Fix each one before its timer runs out.',
    controls: 'click a site or press 1-0',
    make: createUptime,
  },
  {
    id: 'price',
    slot: '04',
    game: 'PRICE RIDER',
    project: 'deferia.cr',
    context: 'Software Engineer · UCR × UN Food and Agriculture Organization (FAO)',
    period: 'Aug 2023 – May 2025',
    tagline: '9,184 agricultural price records turned into a dashboard',
    summary:
      'Joint academic project between Universidad de Costa Rica and the UN Food and Agriculture Organization (FAO) on farmers-market prices.',
    bullets: [
      'Turned four years of CNP (Consejo Nacional de Producción) price bulletins into a clean dataset of 9,184 records across 56 agricultural products.',
      'Cleaned, normalized and structured the data for PostgreSQL and Django.',
      'Interactive dashboard for trends, seasonality and product comparisons (React, TypeScript, Plotly).',
    ],
    stack: ['Python', 'Django', 'PostgreSQL', 'React', 'TypeScript', 'Plotly'],
    links: [{ label: 'Live dashboard', href: 'https://cnp-precios-viz.vercel.app/' }],
    howto:
      'Ride the weekly price line without drifting off the band. The series in the game is simulated; the dashboard has the real data.',
    controls: 'arrow keys / W S, or move the pointer',
    make: createPriceRider,
  },
  {
    id: 'swarm',
    slot: '05',
    game: 'ORBITALS',
    project: 'Museo del Espacio Matemático',
    context: 'Personal project',
    period: '2026',
    tagline: '30+ math & physics simulations, some driven by your hands',
    summary:
      '30+ interactive math and physics simulations (hydrogen orbitals, dipole radiation, Fourier epicycles) built with WebGL and Web Audio. Several are controlled by on-device webcam hand tracking.',
    bullets: [
      'Real-time rendering with Three.js and custom shaders; sound from the Web Audio API.',
      'Hand tracking with MediaPipe runs fully in the browser: no video leaves the device.',
      'One shared lobby, input layer and navigation across every exhibit.',
    ],
    stack: ['JavaScript', 'Three.js', 'WebGL', 'Web Audio', 'MediaPipe'],
    links: [{ label: 'Open the museum', href: 'https://museo-espacio-matematico.vercel.app/' }],
    howto: 'Your pointer is the hand. Herd the swarm into each node before time runs out. Space or click sends a pulse.',
    controls: 'move the pointer or use arrow keys · space or click to pulse',
    make: createSwarm,
  },
  {
    id: 'checkin',
    slot: '06',
    game: 'CHECK-IN',
    project: 'ECCI QR Access Control',
    context: 'Software engineering project · School of Computer Science, UCR',
    period: '2024 – 2025',
    tagline: 'QR sign-in to replace manual device registration',
    summary:
      'A QR-based computer sign-in workflow designed to replace manual device registration, as part of an academic assistance program.',
    bullets: [
      'Requirements gathered through interviews with faculty, security staff and students.',
      'Working demo with backend services, a web interface, authentication and role-based access.',
      'Presented to stakeholders for validation.',
    ],
    stack: ['Full-stack', 'Auth', 'RBAC', 'REST', 'QR'],
    links: [{ label: 'Code on GitHub', href: 'https://github.com/apani0409/ecci-qr-access' }],
    howto: 'Compare the scanned code with the registered device, then grant or deny before the queue backs up.',
    controls: 'left arrow denies, right arrow grants, or tap a side',
    make: createCheckin,
  },
  {
    id: 'balance',
    slot: '07',
    game: 'BALANCE',
    project: 'Mejengas App',
    context: 'Personal project',
    period: '2026',
    tagline: 'Real-time pickup-football sessions with fair teams',
    summary:
      'A real-time Flutter app for pickup football (mejenga) sessions: players join with a unique code, everything syncs live and teams are balanced automatically.',
    bullets: [
      'Live session state synchronized across phones with Supabase Realtime.',
      'Automatic team balancing, so every match starts even.',
    ],
    stack: ['Flutter', 'Dart', 'Supabase', 'Realtime'],
    links: [{ label: 'Code on GitHub', href: 'https://github.com/apani0409/mejengas-live' }],
    howto: 'Send each player to a team and keep the scale level. This is the balancing the app does for you.',
    controls: 'left / right arrow, or tap a side',
    make: createBalance,
  },
  {
    id: 'descent',
    slot: '08',
    game: 'DESCENT',
    project: 'Research: Feature-wise Double Descent',
    context: 'Independent research',
    period: 'Draft paper',
    tagline: '13,000+ training runs mapping the interpolation peak',
    summary:
      'Draft paper: 13,000+ training runs mapping the interpolation peak across model families, showing it is a spectral phenomenon that can be predicted without training any model.',
    bullets: [
      'The peak location follows from the spectrum of the features, so it can be predicted before training.',
      'Also: Conjecture Engine, an automated graph-theory conjecturing system that enumerates graphs, computes invariants and refutes inequality conjectures with an LLM in the loop.',
    ],
    stack: ['Python', 'scikit-learn', 'NumPy', 'NetworkX', 'SQLite', 'LLMs'],
    links: [{ label: 'GitHub profile', href: 'https://github.com/apani0409' }],
    howto:
      'Find the model size with the lowest test error using six training runs. Classical intuition says stop early; the curve disagrees. Press H for the spectral hint.',
    controls: 'aim with arrows or pointer · space or tap to train · H for hint',
    make: createDescent,
  },
]
