import { useRef, useState } from 'react'
import ChapterHeading from './ChapterHeading.jsx'
import ResultTable from './ResultTable.jsx'
import { CAREER_TABLES, PRESET_QUERIES } from '../data/tables.js'
import { highlightSql, runQuery } from '../utils/miniSql.js'
import { ASK_EXAMPLES, textToSql } from '../utils/textToSql.js'
import { unlock } from '../utils/achievements.js'
import { APPLE_PLATFORM } from '../utils/capabilities.js'

const HIGHLIGHT = {
  keyword: 'text-purple-600 dark:text-fuchsia-300',
  string: 'text-emerald-600 dark:text-emerald-300',
  number: 'text-amber-600 dark:text-amber-300',
  comment: 'text-slate-400 dark:text-slate-500',
  ident: 'text-slate-800 dark:text-slate-100',
  plain: 'text-slate-500 dark:text-slate-400',
}

// The textarea and its highlight layer must share every metric that affects
// layout, or the coloured text drifts away from the caret.
const EDITOR_TEXT =
  'm-0 px-4 pt-4 pb-14 font-mono text-[13px] leading-6 whitespace-pre-wrap break-words [tab-size:2]'

function execute(sql) {
  try {
    return { ok: true, ...runQuery(sql, CAREER_TABLES) }
  } catch (err) {
    return { ok: false, message: err.message }
  }
}

export default function QueryConsole() {
  const [sql, setSql] = useState(PRESET_QUERIES[0].sql)
  const [result, setResult] = useState(() => execute(PRESET_QUERIES[0].sql))
  const [mode, setMode] = useState('sql')
  const [question, setQuestion] = useState('')
  const [translated, setTranslated] = useState(null)
  const editor = useRef(null)
  const overlay = useRef(null)

  const run = (text = sql) => setResult(execute(text))

  const runOwn = () => {
    run()
    setTranslated(null)
    unlock('sql')
  }

  const ask = (text) => {
    setQuestion(text)
    try {
      const generated = textToSql(text)
      setSql(generated)
      run(generated)
      setTranslated(text)
      unlock('ask')
    } catch (err) {
      setTranslated(null)
      setResult({ ok: false, message: err.message })
    }
  }

  const load = (text) => {
    setSql(text)
    run(text)
  }

  const insertAtCursor = (text) => {
    const el = editor.current
    const start = el.selectionStart
    const next = sql.slice(0, start) + text + sql.slice(el.selectionEnd)
    setSql(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + text.length
    })
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      runOwn()
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      insertAtCursor('  ')
    }
  }

  return (
    <section id="console" className="relative mx-auto max-w-6xl scroll-mt-28 px-6 py-20">
      <ChapterHeading
        chapter="04"
        label="Query Console"
        title="Query My Career"
        subtitle="My résumé is a dataset. Write SQL against it — or start from one of the queries below."
      />

      <div className="reveal glass-deep overflow-hidden rounded-3xl">
        <div className="flex items-center gap-2 border-b border-white/20 px-5 py-3 dark:border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="font-display ml-3 truncate text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase dark:text-slate-400">
            bigquery://vijay.career — sandbox
          </span>
        </div>

        <div className="grid lg:grid-cols-[13rem_1fr]">
          {/* Schema explorer */}
          <aside className="border-b border-white/20 p-4 lg:border-r lg:border-b-0 dark:border-white/10">
            <p className="chapter-label mb-3 !text-[9px]">Schema</p>
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-3">
              {Object.entries(CAREER_TABLES).map(([name, t]) => (
                <li key={name}>
                  <button
                    onClick={() => load(`SELECT *\nFROM ${name}\nLIMIT 10;`)}
                    className="rounded-xl border border-slate-300/60 px-3 py-1.5 font-mono text-xs font-semibold text-slate-700 transition hover:text-purple-600 lg:border-0 lg:p-0 dark:border-white/15 dark:text-slate-200 dark:hover:text-cyan-300"
                  >
                    ▸ {name}
                  </button>
                  <div className="mt-1.5 hidden flex-wrap gap-1 pl-3 lg:flex">
                    {t.columns.map((c) => (
                      <button
                        key={c}
                        onClick={() => insertAtCursor(c)}
                        title={`Insert "${c}"`}
                        className="rounded-md px-1.5 py-0.5 font-mono text-[10px] text-slate-500 transition hover:bg-purple-500/10 hover:text-purple-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-cyan-300"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-w-0">
            {/* Mode: hand-written SQL, or plain English translated to SQL */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/20 px-4 py-3 dark:border-white/10">
              <div
                role="tablist"
                aria-label="Query mode"
                className="glass flex shrink-0 rounded-full p-0.5"
              >
                {[
                  ['sql', 'SQL'],
                  ['ask', '✦ Ask in English'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={mode === id}
                    onClick={() => setMode(id)}
                    className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition ${
                      mode === id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === 'sql' ? (
                PRESET_QUERIES.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => {
                      load(q.sql)
                      setTranslated(null)
                    }}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition hover:scale-105 ${
                      sql === q.sql
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30'
                        : 'glass text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {q.label}
                  </button>
                ))
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (question.trim()) ask(question)
                  }}
                  className="flex min-w-[min(100%,16rem)] flex-1 items-center gap-2"
                >
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. Which projects use Terraform?"
                    aria-label="Ask a question in English"
                    className="glass min-w-0 flex-1 rounded-full bg-transparent px-4 py-1.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-400/60 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-purple-500/30 transition hover:scale-105"
                  >
                    Translate ⇢
                  </button>
                </form>
              )}
            </div>

            {mode === 'ask' && (
              <div className="flex flex-wrap items-center gap-2 border-b border-white/20 px-4 py-2.5 dark:border-white/10">
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  try:
                </span>
                {ASK_EXAMPLES.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="rounded-full border border-dashed border-slate-300 px-2.5 py-0.5 text-[11px] text-slate-600 transition hover:border-purple-400 hover:text-purple-600 dark:border-white/20 dark:text-slate-300 dark:hover:text-cyan-300"
                  >
                    {q}
                  </button>
                ))}
                <span className="w-full font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  Rule-based text-to-SQL — runs entirely in your browser, no AI calls. Edit the SQL
                  it writes below.
                </span>
              </div>
            )}

            {translated && (
              <p className="border-b border-white/20 px-4 py-2 font-mono text-[11px] text-purple-600 dark:border-white/10 dark:text-fuchsia-300">
                “{translated}” ⇢ translated to SQL:
              </p>
            )}

            {/* Editor: a transparent textarea over a syntax-highlighted mirror */}
            <div className="relative border-b border-white/20 dark:border-white/10">
              <pre
                ref={overlay}
                aria-hidden="true"
                className={`${EDITOR_TEXT} pointer-events-none absolute inset-0 overflow-hidden`}
              >
                {highlightSql(sql).map((part, i) => (
                  <span key={i} className={HIGHLIGHT[part.kind]}>
                    {part.text}
                  </span>
                ))}
                {/* Keeps a trailing newline from collapsing the mirror. */}
                {'\n'}
              </pre>
              <textarea
                ref={editor}
                value={sql}
                rows={6}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                aria-label="SQL query editor"
                onChange={(e) => {
                  setSql(e.target.value)
                  setTranslated(null)
                }}
                onKeyDown={onKeyDown}
                onScroll={(e) => (overlay.current.scrollTop = e.currentTarget.scrollTop)}
                className={`${EDITOR_TEXT} relative block w-full resize-none bg-transparent text-transparent caret-purple-500 outline-none selection:bg-purple-400/30 dark:caret-cyan-300`}
              />
              <button
                onClick={runOwn}
                className="font-display absolute right-3 bottom-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-white uppercase shadow-lg shadow-purple-500/30 transition hover:scale-105"
              >
                ▶ Run{' '}
                <span className="hidden opacity-70 sm:inline">
                  {APPLE_PLATFORM ? '⌘↵' : 'Ctrl↵'}
                </span>
              </button>
            </div>

            {/* Status + results */}
            <div aria-live="polite">
              {result.ok ? (
                <>
                  <p className="px-4 py-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    ✓ {result.rows.length} row{result.rows.length === 1 ? '' : 's'} ·{' '}
                    {result.ms.toFixed(2)} ms · 0 B billed
                  </p>
                  <div className="max-h-80 overflow-auto">
                    <ResultTable result={result} />
                  </div>
                </>
              ) : (
                <p className="px-4 py-4 font-mono text-xs text-rose-600 dark:text-rose-400">
                  ✕ {result.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
