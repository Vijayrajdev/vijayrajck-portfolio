import { useState } from 'react'
import LogoVJ from './LogoVJ.jsx'

const LINKS = [
  { href: '#origin', label: 'Origin' },
  { href: '#craft', label: 'Craft' },
  { href: '#missions', label: 'Missions' },
  { href: '#flight-log', label: 'Flight Log' },
  { href: '#awards', label: 'Awards' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav({ theme, toggleTheme, canInstall, install }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="glass-deep mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <a href="#top" aria-label="VJ — back to top" className="transition hover:scale-110">
          <LogoVJ className="h-9 w-9" />
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {canInstall && (
            <button
              onClick={install}
              className="glass rounded-xl px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:scale-105 dark:text-indigo-300"
            >
              ⬇ Install App
            </button>
          )}
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
            className="glass rounded-xl px-3 py-1.5 text-sm md:hidden"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass-deep mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl p-3 md:hidden">
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
        </div>
      )}
    </header>
  )
}
