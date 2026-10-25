import { useEffect, useRef, useState } from 'react'
import LogoVJ from './LogoVJ.jsx'
import { CAREER_TABLES } from '../data/tables.js'
import { EDGES } from '../data/lineage.js'
import { loadGitHub } from '../hooks/useGitHub.js'
import { loadContributions } from '../hooks/useContributions.js'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

// The loading screen runs for BOOT_MS on every full page load. It is never
// idle: GitHub telemetry and the contribution map are fetched while it plays
// and the log reports what actually came back. Any key or tap skips it;
// ?boot=0 turns it off (handy for screenshots and tests).
export const BOOT_MS = 5000

const BOOT_STEPS = [
  { at: 0, text: 'VJ-OS 2060.4 · cold boot', kind: 'title' },
  { at: 450, text: '[ ok ] holo-glass compositor online' },
  { at: 950, text: `[ ok ] mounting /career — ${Object.keys(CAREER_TABLES).length} tables` },
  { at: 1500, text: `[ ok ] linking skill lineage — ${EDGES.length} edges` },
  { at: 2100, key: 'github', text: '[ .. ] subscribing github.events…' },
  { at: 2800, key: 'contrib', text: '[ .. ] indexing a year of contributions…' },
  { at: 3500, text: '[ ok ] voice link · sound · reticle calibrated' },
  { at: 4300, text: '> welcome, operator', kind: 'welcome' },
]

const TIPS = [
  'press ⌘K / Ctrl K for the terminal — it talks back',
  'ask the Query Console a question in plain English',
  '▶ /play hosts Schema Storm, a data-quality game',
  'collect all 11 mission badges 🏆',
]

const bootEnabled = () => {
  try {
    return new URLSearchParams(window.location.search).get('boot') !== '0'
  } catch {
    return true
  }
}

export function BootSequence() {
  const [shown, setShown] = useState(bootEnabled)
  const [elapsed, setElapsed] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [results, setResults] = useState({})

  // Real work during the boot: warm the shared data caches.
  useEffect(() => {
    if (!shown) return
    loadGitHub()
      .then((d) =>
        setResults((r) => ({
          ...r,
          github: `[ ok ] github.events — ${d.events.length} events · ${d.repos.filter((x) => !x.fork).length} repos`,
        })),
      )
      .catch(() =>
        setResults((r) => ({ ...r, github: '[ -- ] github.events offline — continuing' })),
      )
    loadContributions()
      .then((d) =>
        setResults((r) => ({
          ...r,
          contrib: `[ ok ] contributions — ${d.stats.total.toLocaleString()} in 12 months`,
        })),
      )
      .catch(() =>
        setResults((r) => ({ ...r, contrib: '[ -- ] contributions offline — continuing' })),
      )
  }, [shown])

  useEffect(() => {
    if (!shown) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = now - start
      setElapsed(Math.min(t, BOOT_MS))
      if (t < BOOT_MS) raf = requestAnimationFrame(tick)
      else setLeaving(true)
    }
    raf = requestAnimationFrame(tick)
    const skip = () => setLeaving(true)
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })
    return () => {
      cancelAnimationFrame(raf)
      root.style.overflow = previousOverflow
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [shown])

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => setShown(false), 450)
    return () => clearTimeout(t)
  }, [leaving])

  if (!shown) return null
  const pct = Math.round((elapsed / BOOT_MS) * 100)
  const tip = TIPS[Math.min(TIPS.length - 1, Math.floor((elapsed / BOOT_MS) * TIPS.length))]

  return (
    <div
      role="status"
      aria-label={`Loading, ${pct}%`}
      className={`boot fixed inset-0 z-[100] flex items-center justify-center bg-[#05020f] transition-opacity duration-450 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="boot-scan" />
      <div className="relative flex w-[min(32rem,calc(100vw-3rem))] flex-col items-center">
        <div className="boot-core relative mb-8 flex h-28 w-28 items-center justify-center">
          <span className="boot-ring" />
          <span className="boot-ring is-inner" />
          <LogoVJ className="h-12 w-12" />
        </div>

        <p className="font-display text-aurora text-5xl font-black tabular-nums">{pct}%</p>

        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-6 h-[12rem] w-full font-mono text-xs leading-6 text-cyan-300">
          {BOOT_STEPS.filter((step) => step.at <= elapsed).map((step) => (
            <p
              key={step.text}
              className={`boot-line ${
                step.kind === 'title'
                  ? 'font-display tracking-[0.3em] text-white'
                  : step.kind === 'welcome'
                    ? 'text-pink-400'
                    : step.key && !results[step.key]
                      ? 'text-slate-400'
                      : ''
              }`}
            >
              {(step.key && results[step.key]) || step.text}
            </p>
          ))}
        </div>

        <p className="mt-2 text-center font-mono text-[11px] text-slate-500">
          tip: {tip} · <span className="text-slate-400">press any key to skip</span>
        </p>
      </div>
    </div>
  )
}

// Heads-up readout running up the left edge on large screens (vertical, so it
// fits the page margin): frame rate, Chennai time, network, scroll depth.
// Purely decorative.
export function Hud() {
  const fpsRef = useRef(null)
  const [clock, setClock] = useState('')
  const [online, setOnline] = useState(() => navigator.onLine)
  const [depth, setDepth] = useState(0)

  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf
    const loop = (now) => {
      frames++
      if (now - last >= 1000) {
        if (fpsRef.current)
          fpsRef.current.textContent = String(Math.round((frames * 1000) / (now - last)))
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const tick = () => setClock(fmt.format(new Date()))
    tick()
    const clockTimer = setInterval(tick, 1000)

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setDepth(max > 0 ? Math.round((window.scrollY / max) * 100) : 0)
    }
    const onNet = () => setOnline(navigator.onLine)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('online', onNet)
    window.addEventListener('offline', onNet)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(clockTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('online', onNet)
      window.removeEventListener('offline', onNet)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="hud pointer-events-none fixed bottom-5 left-3 z-40 hidden rotate-180 font-mono text-[10px] leading-4 tracking-wider text-slate-500 uppercase [writing-mode:vertical-rl] xl:block dark:text-cyan-300/70"
    >
      <p>
        <span className={online ? 'text-emerald-500' : 'text-rose-500'}>◉</span> uplink{' '}
        {online ? 'nominal' : 'lost'} · fps <span ref={fpsRef}>--</span>
      </p>
      <p>chn {clock} ist · 13.08°n 80.27°e</p>
      <p>
        depth {String(depth).padStart(3, '0')}%{' '}
        <span className="hud-bar" style={{ '--w': `${depth}%` }} />
      </p>
    </div>
  )
}

const INTERACTIVE =
  'a, button, [role="tab"], input, textarea, select, label, .lineage-node, .heat-cell'

// A targeting reticle that trails the pointer and locks onto controls.
// The native cursor stays — this is an accent, not a replacement.
export function Reticle() {
  const ring = useRef(null)
  const [enabled] = useState(() => finePointer() && !reducedMotion())

  useEffect(() => {
    if (!enabled) return
    const pos = { x: -100, y: -100 }
    const cur = { x: -100, y: -100 }
    let locked = false
    let raf
    const onMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const hit = e.target instanceof Element && e.target.closest(INTERACTIVE)
      if (Boolean(hit) !== locked) {
        locked = Boolean(hit)
        ring.current?.classList.toggle('is-locked', locked)
      }
    }
    const loop = () => {
      cur.x += (pos.x - cur.x) * 0.22
      cur.y += (pos.y - cur.y) * 0.22
      if (ring.current) ring.current.style.transform = `translate(${cur.x}px, ${cur.y}px)`
      raf = requestAnimationFrame(loop)
    }
    const onLeave = () => {
      pos.x = pos.y = -100
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div
      ref={ring}
      aria-hidden="true"
      className="reticle pointer-events-none fixed top-0 left-0 z-[95]"
    >
      <span />
    </div>
  )
}
