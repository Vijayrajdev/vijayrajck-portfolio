import { useEffect, useRef, useState } from 'react'
import LogoVJ from './LogoVJ.jsx'
import { useScrollSpy } from '../hooks/useScrollSpy.js'
import { APPLE_PLATFORM } from '../utils/capabilities.js'
import { unlock } from '../utils/achievements.js'

const LINKS = [
  { href: '#origin', label: 'Origin' },
  { href: '#craft', label: 'Craft' },
  { href: '#missions', label: 'Missions' },
  { href: '#console', label: 'Console' },
  { href: '#flight-log', label: 'Flight Log' },
  { href: '#awards', label: 'Awards' },
  { href: '#contact', label: 'Contact' },
]

const SECTION_IDS = LINKS.map((l) => l.href.slice(1))

export default function Nav({
  theme,
  toggleTheme,
  canInstall,
  install,
  openTerminal,
  badgeCount,
  badgeTotal,
  openBadges,
}) {
  const [open, setOpen] = useState(false)
  const { active, progress } = useScrollSpy(SECTION_IDS)

  // Explorer badge: every chapter has been the active section at least once.
  const visited = useRef(new Set())
  useEffect(() => {
    if (!active) return
    visited.current.add(active)
    if (visited.current.size === SECTION_IDS.length) unlock('explorer')
  }, [active])

  const linkClass = (href) =>
    `relative transition after:absolute after:inset-x-0 after:-bottom-1.5 after:mx-auto after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-cyan-400 after:to-purple-500 after:transition-all ${
      active === href.slice(1)
        ? 'text-slate-900 after:w-full dark:text-white'
        : 'text-slate-600 after:w-0 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      {/* Reading progress through the whole page */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.7)]"
        style={{ transform: `scaleX(${progress})` }}
      />
      <nav className="glass-deep mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <a href="#top" aria-label="VJ — back to top" className="transition hover:scale-110">
          <LogoVJ className="h-9 w-9" />
        </a>

        <div className="hidden items-center gap-5 lg:flex xl:gap-6">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={active === l.href.slice(1) ? 'location' : undefined}
              className={`text-sm font-medium ${linkClass(l.href)}`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/play"
            className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-md shadow-purple-500/30 transition hover:scale-105"
          >
            ▶ Play
          </a>
        </div>

        <div className="flex items-center gap-2">
          {canInstall && (
            <button
              onClick={install}
              aria-label="Install app"
              className="glass rounded-xl px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:scale-105 dark:text-indigo-300"
            >
              <span aria-hidden="true">⬇</span>
              <span className="hidden sm:inline"> Install App</span>
            </button>
          )}
          <button
            onClick={openTerminal}
            aria-label="Open terminal"
            title="Open terminal"
            className="glass flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-semibold text-slate-700 transition hover:scale-105 dark:text-slate-200"
          >
            <span className="text-purple-600 dark:text-cyan-300">&gt;_</span>
            <span className="hidden opacity-70 sm:inline">{APPLE_PLATFORM ? '⌘K' : 'Ctrl K'}</span>
          </button>
          <button
            onClick={openBadges}
            aria-label={`Mission badges: ${badgeCount} of ${badgeTotal} unlocked`}
            title="Mission badges"
            className="glass flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:scale-105 dark:text-slate-200"
          >
            <span aria-hidden="true">🏆</span>
            <span className="hidden font-mono sm:inline">
              {badgeCount}/{badgeTotal}
            </span>
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="glass rounded-xl px-3 py-1.5 text-sm transition hover:scale-105"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="glass rounded-xl px-3 py-1.5 text-sm lg:hidden"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass-deep mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl p-3 lg:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white/30 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/play"
            className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-sm font-bold text-white"
          >
            ▶ Play Schema Storm — the data game
          </a>
        </div>
      )}
    </header>
  )
}
