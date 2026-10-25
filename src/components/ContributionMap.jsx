import { useEffect, useMemo, useRef, useState } from 'react'
import ContributionSkyline from './three/ContributionSkyline.jsx'
import { useContributions } from '../hooks/useContributions.js'
import { PORTFOLIO_DATA } from '../data/portfolio.js'
import { WEBGL_AVAILABLE } from '../utils/capabilities.js'

const LEVEL_CLASSES = [
  'bg-slate-400/15 dark:bg-white/[0.06]',
  'bg-cyan-700/70',
  'bg-cyan-400',
  'bg-purple-500',
  'bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.8)]',
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const fmt = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

// Days → week columns (Sunday-first), padded so the first column is aligned.
function toWeeks(days) {
  const weeks = []
  const lead = new Date(`${days[0].date}T00:00:00`).getDay()
  let week = Array(lead).fill(null)
  for (const d of days) {
    week.push(d)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)])
  return weeks
}

export default function ContributionMap() {
  const contributions = useContributions()
  const [view, setView] = useState('heatmap')
  const [hover, setHover] = useState(null)
  const scroller = useRef(null)

  const data = contributions.status === 'ready' ? contributions.data : null
  const weeks = useMemo(() => (data ? toWeeks(data.days) : []), [data])
  const max = data ? Math.max(1, data.stats.busiest.count) : 1

  // On narrow screens start at the most recent weeks.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth
  }, [weeks, view])

  if (contributions.status === 'error') return null

  return (
    <div className="reveal glass-deep mt-8 overflow-hidden rounded-3xl">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/20 px-5 py-3 dark:border-white/10">
        <span className="font-display text-[10px] font-semibold tracking-[0.25em] text-slate-600 uppercase dark:text-slate-300">
          Contribution map
        </span>
        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
          last 12 months
        </span>
        {WEBGL_AVAILABLE && (
          <div
            role="tablist"
            aria-label="Contribution view"
            className="glass ml-auto flex rounded-full p-0.5"
          >
            {[
              ['heatmap', '▦ Heatmap'],
              ['skyline', '⬢ 3D skyline'],
            ].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition ${
                  view === id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!data ? (
        <p className="px-5 py-8 font-mono text-xs text-slate-500 dark:text-slate-400">
          ◌ rendering a year of commits…
        </p>
      ) : (
        <div className="p-5">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Contributions', data.stats.total.toLocaleString()],
              ['Active days', `${data.stats.activeDays}/${data.days.length}`],
              ['Longest streak', `${data.stats.longest}d`],
              ['Current streak', `${data.stats.current}d`],
            ].map(([label, value]) => (
              <div key={label} className="glass spotlight rounded-2xl px-4 py-3">
                <p className="font-display text-aurora text-lg font-black">{value}</p>
                <p className="mt-0.5 text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase dark:text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {view === 'heatmap' ? (
            <div ref={scroller} className="overflow-x-auto pb-2">
              {/* Stretches to the panel; below ~44rem it scrolls sideways instead. */}
              <div
                role="img"
                aria-label={`${data.stats.total} contributions in the last year; busiest day ${fmt(data.stats.busiest.date)} with ${data.stats.busiest.count}`}
                className="min-w-[44rem]"
              >
                <div className="flex gap-[3px] font-mono text-[9px] text-slate-400 dark:text-slate-500">
                  {weeks.map((w, i) => {
                    const first = w.find(Boolean)
                    const date = first && new Date(`${first.date}T00:00:00`)
                    return (
                      <span key={i} className="flex-1 overflow-visible whitespace-nowrap">
                        {date && date.getDate() <= 7 ? MONTHS[date.getMonth()] : ''}
                      </span>
                    )
                  })}
                </div>
                <div className="mt-1 flex gap-[3px]">
                  {weeks.map((w, i) => (
                    <div key={i} className="flex flex-1 flex-col gap-[3px]">
                      {w.map((d, j) =>
                        d ? (
                          <span
                            key={j}
                            title={`${fmt(d.date)} · ${d.count} contributions`}
                            onMouseEnter={() => setHover(d)}
                            onMouseLeave={() => setHover(null)}
                            className={`heat-cell aspect-square w-full rounded-[3px] ${LEVEL_CLASSES[d.level] ?? LEVEL_CLASSES[0]}`}
                            style={{ '--d': `${i * 12}ms` }}
                          />
                        ) : (
                          <span key={j} className="aspect-square w-full" />
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-72 w-full sm:h-80">
              <ContributionSkyline weeks={weeks} max={max} />
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {hover
                ? `${fmt(hover.date)} · ${hover.count} contributions`
                : `busiest day: ${fmt(data.stats.busiest.date)} · ${data.stats.busiest.count} contributions`}
            </span>
            <span className="flex items-center gap-1">
              less
              {LEVEL_CLASSES.map((c, i) => (
                <span key={i} className={`h-[10px] w-[10px] rounded-[3px] ${c}`} />
              ))}
              more ·{' '}
              <a
                href={PORTFOLIO_DATA.profile.github}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline-offset-4 hover:underline dark:text-cyan-300"
              >
                github ↗
              </a>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
