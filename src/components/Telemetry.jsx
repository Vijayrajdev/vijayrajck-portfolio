import { useEffect, useRef, useState } from 'react'
import { GITHUB_USER, timeAgo, useGitHub } from '../hooks/useGitHub.js'
import { PORTFOLIO_DATA } from '../data/portfolio.js'
import { unlock } from '../utils/achievements.js'

// GitHub linguist colours for the languages that show up in the repos.
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#8b5cf6',
  'Jupyter Notebook': '#DA5B0B',
  Other: '#94a3b8',
}

const TOPIC_COLORS = {
  push: 'text-emerald-600 dark:text-emerald-400',
  pr: 'text-purple-600 dark:text-fuchsia-300',
  create: 'text-sky-600 dark:text-cyan-300',
  delete: 'text-rose-600 dark:text-rose-400',
}

function languageMix(repos) {
  const counts = {}
  repos
    .filter((r) => !r.fork && r.language)
    .forEach((r) => (counts[r.language] = (counts[r.language] ?? 0) + 1))
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, 5)
  const rest = sorted.slice(5).reduce((n, [, c]) => n + c, 0)
  if (rest) top.push(['Other', rest])
  const total = top.reduce((n, [, c]) => n + c, 0)
  return top.map(([name, count]) => ({ name, count, pct: (count / total) * 100 }))
}

function Tile({ label, value }) {
  return (
    <div className="glass spotlight rounded-2xl px-4 py-3">
      <p className="font-display text-aurora truncate text-lg font-black">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
    </div>
  )
}

// Replays recent public GitHub activity as a Pub/Sub-style message stream,
// one message at a time, once the panel scrolls into view.
export default function Telemetry() {
  const github = useGitHub()
  const panel = useRef(null)
  const [inView, setInView] = useState(false)
  const [delivered, setDelivered] = useState(0)

  useEffect(() => {
    const el = panel.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const events = github.status === 'ready' ? github.data.events.slice(0, 8) : []

  useEffect(() => {
    if (!inView || github.status !== 'ready') return
    unlock('telemetry')
    if (delivered >= events.length) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(
      () => setDelivered((n) => (reduce ? events.length : n + 1)),
      delivered ? 650 : 250,
    )
    return () => clearTimeout(t)
  }, [inView, github.status, delivered, events.length])

  let body
  if (github.status === 'loading') {
    body = (
      <p className="px-5 py-8 font-mono text-xs text-slate-500 dark:text-slate-400">
        ◌ subscribing to github.events…
      </p>
    )
  } else if (github.status === 'error') {
    body = (
      <p className="px-5 py-8 font-mono text-xs text-slate-500 dark:text-slate-400">
        ✕ Telemetry offline
        {github.reason === 'rate-limited' ? ' — GitHub’s public API rate limit was hit' : ''}. See
        the{' '}
        <a
          href={PORTFOLIO_DATA.profile.github}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 underline dark:text-cyan-300"
        >
          live profile
        </a>{' '}
        instead.
      </p>
    )
  } else {
    const { repos } = github.data
    const own = repos.filter((r) => !r.fork)
    const stars = own.reduce((n, r) => n + r.stars, 0)
    const mix = languageMix(repos)
    const lastPush = own
      .map((r) => r.pushedAt)
      .sort()
      .at(-1)

    body = (
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Tile label="Public repos" value={own.length} />
            <Tile label="Stars earned" value={`★ ${stars}`} />
            <Tile label="Top language" value={mix[0]?.name ?? '—'} />
            <Tile label="Last push" value={lastPush ? timeAgo(lastPush) : '—'} />
          </div>

          <div>
            <p className="chapter-label mb-2 !text-[9px]">Language mix · {mix.reduce((n, l) => n + l.count, 0)} repos</p>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-200/60 dark:bg-white/10">
              {mix.map((l) => (
                <span
                  key={l.name}
                  title={`${l.name} · ${l.count} repos`}
                  className="h-full transition-all duration-700"
                  style={{
                    width: inView ? `${l.pct}%` : '0%',
                    background: LANGUAGE_COLORS[l.name] ?? LANGUAGE_COLORS.Other,
                  }}
                />
              ))}
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
              {mix.map((l) => (
                <li
                  key={l.name}
                  className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: LANGUAGE_COLORS[l.name] ?? LANGUAGE_COLORS.Other }}
                  />
                  {l.name} <span className="font-mono text-slate-400">{Math.round(l.pct)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0">
          <p className="chapter-label mb-2 !text-[9px]">
            Event stream · {delivered}/{events.length} acked
          </p>
          <ol className="flex flex-col gap-1.5 font-mono text-[11px]" aria-live="polite">
            {events.slice(0, delivered).map((e) => (
              <li
                key={e.id}
                className="telemetry-msg flex items-baseline gap-2 rounded-lg border border-slate-300/40 bg-white/30 px-3 py-1.5 dark:border-white/10 dark:bg-white/5"
              >
                <span
                  className={`shrink-0 font-semibold ${TOPIC_COLORS[e.topic.split('.')[0]] ?? 'text-slate-500'}`}
                >
                  {e.topic}
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">
                  {e.repo}
                  {e.detail && (
                    <span className="text-slate-400 dark:text-slate-500"> · {e.detail}</span>
                  )}
                </span>
                <span className="shrink-0 text-slate-400 dark:text-slate-500">{timeAgo(e.at)}</span>
                <span className="shrink-0 text-emerald-500" aria-label="acknowledged">
                  ✓
                </span>
              </li>
            ))}
            {delivered < events.length && (
              <li className="px-3 py-1 text-slate-400 dark:text-slate-500">
                <span className="animate-pulse">▍</span> pulling next message…
              </li>
            )}
            {events.length === 0 && (
              <li className="px-3 py-1 text-slate-400 dark:text-slate-500">
                No public events in the last 90 days.
              </li>
            )}
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div ref={panel} className="reveal glass-deep mt-8 overflow-hidden rounded-3xl">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/20 px-5 py-3 dark:border-white/10">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="font-display text-[10px] font-semibold tracking-[0.25em] text-slate-600 uppercase dark:text-slate-300">
          Live telemetry
        </span>
        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
          subscription: github.events.{GITHUB_USER.toLowerCase()}
        </span>
        {github.status === 'ready' && (
          <span className="ml-auto font-mono text-[10px] text-slate-400 dark:text-slate-500">
            synced {timeAgo(new Date(github.data.fetchedAt).toISOString())}
          </span>
        )}
      </div>
      {body}
    </div>
  )
}
