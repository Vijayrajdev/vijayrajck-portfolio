import { useEffect, useRef, useState } from 'react'
import { CAREER_TABLES } from '../data/tables.js'
import { EDGES } from '../data/lineage.js'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

const BOOT_LINES = [
  'VJ-OS 2060.4 · cold boot',
  `[ ok ] mounting /career — ${Object.keys(CAREER_TABLES).length} tables`,
  `[ ok ] linking skill lineage — ${EDGES.length} edges`,
  '[ ok ] subscribing github.events',
  '[ ok ] calibrating holo-glass',
  '> welcome, operator',
]

// A one-second boot sequence, once per browser session. Click or any key
// skips it; reduced-motion visitors never see it. The page renders
// underneath the whole time, so nothing waits on it.
export function BootSequence() {
  const [shown, setShown] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).has('boot')) return true
      return !reducedMotion() && !sessionStorage.getItem('vj-booted')
    } catch {
      return false
    }
  })
  const [lines, setLines] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!shown) return
    try {
      sessionStorage.setItem('vj-booted', '1')
    } catch {
      /* boots again next visit — harmless */
    }
    const timers = BOOT_LINES.map((_, i) => setTimeout(() => setLines(i + 1), 120 + i * 140))
    const leave = setTimeout(() => setLeaving(true), 120 + BOOT_LINES.length * 140 + 250)
    const done = setTimeout(() => setShown(false), 120 + BOOT_LINES.length * 140 + 700)
    const skip = () => {
      setLeaving(true)
      setTimeout(() => setShown(false), 350)
    }
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })
    return () => {
      ;[...timers, leave, done].forEach(clearTimeout)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [shown])

  if (!shown) return null
  return (
    <div
      aria-hidden="true"
      className={`boot fixed inset-0 z-[100] flex items-center justify-center bg-[#05020f] transition-opacity duration-400 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="boot-scan" />
      <div className="w-[min(30rem,calc(100vw-3rem))] font-mono text-xs leading-6 text-cyan-300">
        {BOOT_LINES.slice(0, lines).map((l, i) => (
          <p
            key={l}
            className={
              i === 0
                ? 'font-display tracking-[0.3em] text-white'
                : l.startsWith('>')
                  ? 'text-pink-400'
                  : ''
            }
          >
            {l}
          </p>
        ))}
        <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-150"
            style={{ width: `${(lines / BOOT_LINES.length) * 100}%` }}
          />
        </div>
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
