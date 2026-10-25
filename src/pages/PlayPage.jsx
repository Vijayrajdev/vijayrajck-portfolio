import { useEffect, useRef } from 'react'
import LogoVJ from '../components/LogoVJ.jsx'
import { useSchemaStorm, multiplierFor } from '../game/useSchemaStorm.js'
import { LEDGER_SIZE, RULES, WATERMARK, columnsFor, rulesFor } from '../game/schemaStorm.js'

const LESSONS = [
  {
    title: 'Data contracts',
    text: 'Every rule on the left is a contract a pipeline enforces before data lands — the same checks dbt tests and Great Expectations suites run in production.',
  },
  {
    title: 'Dead-letter queues',
    text: 'Quarantining instead of dropping keeps bad rows inspectable and replayable. Pub/Sub and Kafka both ship DLQs for exactly this.',
  },
  {
    title: 'Deduplication',
    text: 'At-least-once delivery means duplicates are normal. Warehouses dedupe on keys with MERGE or QUALIFY ROW_NUMBER() = 1.',
  },
  {
    title: 'Watermarks',
    text: 'Streaming systems close a window at a watermark; events that arrive later than it are late data and need their own path.',
  },
]

function Stat({ label, children, wide = false }) {
  return (
    <div className={`glass rounded-2xl px-4 py-2.5 ${wide ? 'col-span-2 sm:col-span-1' : ''}`}>
      <p className="text-[9px] font-semibold tracking-[0.25em] text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <div className="font-display mt-0.5 text-lg font-black tabular-nums">{children}</div>
    </div>
  )
}

// Long values (email, timestamps) get a full line on phones and wrap rather
// than truncate everywhere, so a corrupted character is never hidden.
const FULL_WIDTH = new Set(['email', 'event_ts'])

function RowCard({ item, isFront }) {
  const columns = columnsFor(item.level)
  return (
    <div
      className={`belt-card glass-deep absolute grid grid-cols-2 gap-x-3 rounded-xl px-3 py-1.5 font-mono text-[11px] leading-[1.15rem] sm:block sm:py-2 sm:leading-[1.35rem] ${
        item.state !== 'moving' ? `is-${item.state}` : ''
      } ${isFront ? 'is-front' : ''}`}
      style={{ '--p': item.progress }}
    >
      {isFront && (
        <span className="font-display absolute -top-2.5 left-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-2 text-[8px] font-bold tracking-[0.2em] text-white">
          NEXT
        </span>
      )}
      {columns.map((c) => (
        <div
          key={c}
          className={`flex justify-between gap-3 ${FULL_WIDTH.has(c) ? 'col-span-2' : ''}`}
        >
          <span className="text-slate-400 dark:text-slate-500">{c}</span>
          <span className="min-w-0 text-right break-all text-slate-800 dark:text-slate-100">
            {item.row[c] === null ? 'NULL' : String(item.row[c])}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function PlayPage({ theme, toggleTheme }) {
  const beltRef = useRef(null)
  const { game, phase, best, act, start, togglePause, front } = useSchemaStorm(() => {
    // Card extent (+ a 12px gap) over the distance a card travels.
    const belt = beltRef.current
    if (!belt) return undefined
    const styles = getComputedStyle(belt)
    const vertical = window.innerWidth < 640
    const card = parseFloat(styles.getPropertyValue(vertical ? '--ch' : '--cw')) * 16
    const extent = vertical ? belt.clientHeight : belt.clientWidth
    return Math.max(1 / 3.2, (card + 12) / Math.max(1, extent - card))
  })

  // On short screens, bring the belt and its buttons fully into view on start.
  useEffect(() => {
    if (phase === 'playing' && window.innerHeight < 900) {
      beltRef.current?.closest('.glass-deep')?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [phase])

  useEffect(() => {
    document.title = 'Schema Storm — a data game · Vijay Raj C K'
  }, [])

  // Keyboard: ← / A quarantine, → / D load, P or Esc pause, Enter / Space start.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return
      const k = e.key.toLowerCase()
      if (phase === 'playing' && (k === 'arrowleft' || k === 'a')) {
        e.preventDefault()
        act('quarantine')
      } else if (phase === 'playing' && (k === 'arrowright' || k === 'd')) {
        e.preventDefault()
        act('load')
      } else if (k === 'p' || (k === 'escape' && phase === 'playing')) {
        togglePause()
      } else if ((k === 'enter' || k === ' ') && phase !== 'playing') {
        e.preventDefault()
        if (phase === 'paused') togglePause()
        else start()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, act, start, togglePause])

  const accuracy = game.processed ? Math.round((game.correct / game.processed) * 100) : 100
  const active = rulesFor(game.level)
  const now = performance.now()
  const banner = game.banner && now - game.banner.at < 2600 ? game.banner : null

  return (
    <div className="relative min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav className="glass-deep mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <LogoVJ className="h-8 w-8" />
            <span className="hidden sm:inline">← Back to portfolio</span>
          </a>
          <p className="font-display text-aurora text-sm font-black tracking-[0.25em] uppercase">
            Schema Storm
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-[11px] text-slate-500 sm:inline dark:text-slate-400">
              best {best}
            </span>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="glass rounded-xl px-3 py-1.5 text-sm transition hover:scale-105"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6">
        <div className="mb-6 text-center">
          <p className="chapter-label">// SIDE MISSION — DATA TRIAGE</p>
          <h1 className="font-display glow-title mt-2 text-3xl font-black tracking-wider uppercase sm:text-4xl">
            <span className="text-aurora">Schema Storm</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Rows are streaming toward the warehouse. Load the clean ones, quarantine the rest —
            before the contracts change under you.
          </p>
        </div>

        {/* HUD */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Score" wide>
            <span className="text-aurora">{game.score}</span>
          </Stat>
          <Stat label="Level">{game.level}</Stat>
          <Stat label="Integrity">
            <span className="tracking-widest text-pink-500" aria-label={`${game.lives} lives`}>
              {'◆'.repeat(Math.max(0, game.lives))}
              <span className="opacity-20">{'◆'.repeat(Math.max(0, 3 - game.lives))}</span>
            </span>
          </Stat>
          <Stat label="Multiplier">×{multiplierFor(game.streak)}</Stat>
          <Stat label="Quality">{accuracy}%</Stat>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
          {/* The belt */}
          <div className="glass-deep relative overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/20 px-4 py-2 font-mono text-[10px] text-slate-500 dark:border-white/10 dark:text-slate-400">
              <span className="hidden sm:inline">▸ source: pubsub://orders</span>
              <span className="text-amber-500">
                <span className="sm:hidden">⇠ DLQ</span>
                <span className="hidden sm:inline">⇡ dead-letter queue</span>
              </span>
              {/* Phones: the HUD may be scrolled away, so mirror it here. */}
              <span className="font-semibold text-slate-700 sm:hidden dark:text-slate-200">
                {game.score} ·{' '}
                <span className="text-pink-500">{'◆'.repeat(Math.max(0, game.lives))}</span> · L
                {game.level}
              </span>
              <span className="text-emerald-500">
                <span className="sm:hidden">warehouse ⇣</span>
                <span className="hidden sm:inline">warehouse ⇢</span>
              </span>
            </div>

            <div ref={beltRef} className="belt relative h-[24rem] sm:h-64">
              <div className="belt-track" aria-hidden="true" />
              <div className="belt-gate" aria-hidden="true" />
              {game.items.map((item) => (
                <RowCard key={item.key} item={item} isFront={item === front} />
              ))}

              {banner && (
                <div className="level-banner pointer-events-none absolute inset-x-4 top-4 z-10 rounded-2xl bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 px-4 py-2 text-center text-white shadow-lg">
                  <p className="font-display text-xs font-black tracking-[0.3em]">
                    LEVEL {banner.level}
                  </p>
                  <p className="font-mono text-[11px]">{banner.text}</p>
                </div>
              )}

              {phase !== 'playing' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 p-4 backdrop-blur-sm dark:bg-[#05020f]/60">
                  <div className="glass-deep w-full max-w-sm rounded-2xl p-5 text-center">
                    {phase === 'intro' && (
                      <>
                        <p className="font-display text-sm font-black tracking-[0.25em] uppercase">
                          Ready, operator?
                        </p>
                        <ul className="mt-3 space-y-1 text-left text-xs text-slate-600 dark:text-slate-300">
                          <li>
                            <b>→ / D / LOAD</b> — the row passes every contract
                          </li>
                          <li>
                            <b>← / A / QUARANTINE</b> — it breaks one
                          </li>
                          <li>Act on the row marked NEXT before it hits the gate.</li>
                          <li>3 mistakes or misses and the pipeline halts.</li>
                        </ul>
                      </>
                    )}
                    {phase === 'paused' && (
                      <p className="font-display text-sm font-black tracking-[0.25em] uppercase">
                        Pipeline paused
                      </p>
                    )}
                    {phase === 'over' && (
                      <>
                        <p className="font-display text-sm font-black tracking-[0.25em] text-rose-500 uppercase">
                          Pipeline halted
                        </p>
                        <p className="font-display text-aurora mt-2 text-4xl font-black">
                          {game.score}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {game.processed} rows · {accuracy}% quality · best streak{' '}
                          {game.bestStreak} · level {game.level}
                        </p>
                        {game.score >= best && game.score > 0 && (
                          <p className="mt-1 text-xs font-bold text-emerald-500">
                            New personal best!
                          </p>
                        )}
                      </>
                    )}
                    <button
                      onClick={phase === 'paused' ? togglePause : start}
                      className="font-display mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-lg shadow-purple-500/30 transition hover:scale-[1.02]"
                    >
                      {phase === 'paused'
                        ? 'Resume'
                        : phase === 'over'
                          ? 'Run it again'
                          : 'Start pipeline'}
                    </button>
                    {phase === 'over' && (
                      <a
                        href="/#contact"
                        className="mt-2 block text-xs font-semibold text-indigo-600 underline-offset-4 hover:underline dark:text-cyan-300"
                      >
                        Need someone who does this for real? Open a channel →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p
              className={`min-h-9 border-t border-white/20 px-4 py-2 font-mono text-[11px] dark:border-white/10 ${
                game.feedback?.tone === 'err'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
              aria-live="polite"
            >
              {game.feedback?.text ?? '// waiting for the first row…'}
            </p>

            <div className="grid grid-cols-2 gap-3 border-t border-white/20 p-3 dark:border-white/10">
              <button
                onClick={() => act('quarantine')}
                disabled={phase !== 'playing'}
                className="rounded-2xl border border-amber-400/60 bg-amber-400/10 py-4 font-mono text-xs font-bold tracking-wider text-amber-600 transition active:scale-95 disabled:opacity-40 dark:text-amber-300"
              >
                ◀ QUARANTINE <span className="hidden opacity-60 sm:inline">(A)</span>
              </button>
              <button
                onClick={() => act('load')}
                disabled={phase !== 'playing'}
                className="rounded-2xl border border-emerald-400/60 bg-emerald-400/10 py-4 font-mono text-xs font-bold tracking-wider text-emerald-600 transition active:scale-95 disabled:opacity-40 dark:text-emerald-300"
              >
                LOAD ▶ <span className="hidden opacity-60 sm:inline">(D)</span>
              </button>
            </div>
          </div>

          {/* Contracts, ledger, watermark */}
          <aside className="flex flex-col gap-4">
            <div className="glass-deep rounded-3xl p-4">
              <p className="chapter-label mb-3 !text-[9px]">Active contracts</p>
              <ul className="space-y-1.5 font-mono text-[11px]">
                {RULES.map((r) => {
                  const on = active.includes(r)
                  return (
                    <li
                      key={r.id}
                      className={`flex gap-2 ${on ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 opacity-50 dark:text-slate-600'}`}
                    >
                      <span className={on ? 'text-emerald-500' : ''}>
                        {on ? '✓' : `L${r.level}`}
                      </span>
                      <span>{r.label}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="glass-deep rounded-3xl p-4">
              <p className="chapter-label mb-2 !text-[9px]">
                Dedupe ledger · last {LEDGER_SIZE} loaded ids
              </p>
              {game.level >= 4 ? (
                <p className="font-mono text-sm text-slate-700 dark:text-slate-200">
                  {game.ctx.loaded.slice(-LEDGER_SIZE).join(' · ') || '—'}
                </p>
              ) : (
                <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  unlocks at level 4
                </p>
              )}
            </div>

            <div className="glass-deep rounded-3xl p-4">
              <p className="chapter-label mb-2 !text-[9px]">Watermark</p>
              <p
                className={`font-mono text-sm ${game.level >= 5 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}
              >
                {game.level >= 5 ? WATERMARK : 'unlocks at level 5'}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <p className="chapter-label mb-4 text-center">// WHY THIS IS REAL ENGINEERING</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LESSONS.map((l) => (
              <article key={l.title} className="glass-deep spotlight rounded-3xl p-5">
                <h2 className="font-display text-xs font-bold tracking-[0.2em] uppercase">
                  {l.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {l.text}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
