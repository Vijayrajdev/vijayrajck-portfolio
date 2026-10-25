import { useEffect, useState } from 'react'
import {
  ACHIEVEMENT_EVENT,
  ACHIEVEMENTS,
  getUnlocked,
  resetAchievements,
} from '../utils/achievements.js'

const BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]))

function Toasts() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const onUnlock = (e) => {
      const badge = BY_ID[e.detail]
      if (!badge) return
      const complete = getUnlocked().size === ACHIEVEMENTS.length
      const key = `${badge.id}-${Date.now()}`
      setToasts((t) => [...t, { key, badge, complete }])
      setTimeout(() => setToasts((t) => t.filter((x) => x.key !== key)), complete ? 6000 : 3800)
    }
    window.addEventListener(ACHIEVEMENT_EVENT, onUnlock)
    return () => window.removeEventListener(ACHIEVEMENT_EVENT, onUnlock)
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      aria-live="polite"
    >
      {toasts.map(({ key, badge, complete }) => (
        <div
          key={key}
          className="badge-toast glass-deep pointer-events-auto flex w-full max-w-xs items-center gap-3 rounded-2xl px-4 py-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 font-mono text-sm font-bold text-white shadow-lg shadow-purple-500/40">
            {badge.icon}
          </span>
          <div className="min-w-0">
            <p className="font-display text-[9px] font-bold tracking-[0.25em] text-purple-600 uppercase dark:text-cyan-300">
              Badge unlocked
            </p>
            <p className="truncate text-sm font-bold">{badge.title}</p>
            {complete && (
              <a
                href="#contact"
                className="text-[11px] font-semibold text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
              >
                All {ACHIEVEMENTS.length} found — you’ve seen everything. Say hi →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Panel({ unlocked, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pct = (unlocked.size / ACHIEVEMENTS.length) * 100

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mission badges"
        onClick={(e) => e.stopPropagation()}
        className="glass-deep absolute top-24 right-4 left-4 mx-auto max-w-sm rounded-2xl p-5 sm:left-auto"
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-xs font-bold tracking-[0.2em] uppercase">
            Mission badges
          </p>
          <button
            onClick={onClose}
            aria-label="Close badges"
            className="rounded-lg px-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {unlocked.size}/{ACHIEVEMENTS.length}
          </span>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.has(a.id)
            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${got ? '' : 'opacity-55'}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                    got
                      ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white'
                      : 'border border-dashed border-slate-400 text-slate-400 dark:border-white/25'
                  }`}
                >
                  {got ? a.icon : '?'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm leading-tight font-semibold">{a.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{a.hint}</p>
                </div>
              </li>
            )
          })}
        </ul>

        {unlocked.size > 0 && (
          <button
            onClick={resetAchievements}
            className="mt-3 font-mono text-[10px] text-slate-400 underline-offset-4 hover:underline dark:text-slate-500"
          >
            reset progress
          </button>
        )}
      </div>
    </div>
  )
}

export default function Achievements({ unlocked, open, onClose }) {
  return (
    <>
      <Toasts />
      {open && <Panel unlocked={unlocked} onClose={onClose} />}
    </>
  )
}
