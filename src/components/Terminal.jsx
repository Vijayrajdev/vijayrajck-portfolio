import { useEffect, useRef, useState } from 'react'
import ResultTable from './ResultTable.jsx'
import { PORTFOLIO_DATA } from '../data/portfolio.js'
import { SKILLS } from '../data/skills.js'
import { CAREER_TABLES } from '../data/tables.js'
import { runQuery } from '../utils/miniSql.js'
import { textToSql } from '../utils/textToSql.js'
import { unlock } from '../utils/achievements.js'
import { playSparkle } from '../utils/sparkle.js'

// "goto" targets → section ids.
const PLACES = {
  top: 'top',
  origin: 'origin',
  craft: 'craft',
  skills: 'craft',
  missions: 'missions',
  projects: 'missions',
  console: 'console',
  experience: 'flight-log',
  awards: 'awards',
  contact: 'contact',
}

const SpeechRecognition =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

// Spoken phrases → terminal commands.
function voiceToCommand(said) {
  const s = said
    .toLowerCase()
    .replace(/[.?!,]/g, '')
    .trim()
  const nav =
    /^(?:go to|goto|take me to|jump to|show me|show|scroll to)\s+(?:the\s+)?(.+?)(?:\s+section)?$/.exec(
      s,
    )
  if (nav && PLACES[nav[1]]) return `goto ${nav[1]}`
  if (/\bhire\b/.test(s)) return 'sudo hire vijay'
  if (/^(play|play a game|start the game|launch the game)$/.test(s)) return 'play'
  if (/^(which|what|how|where|who|when|list|show me)\b/.test(s)) return `ask ${s}`
  return s
}

const HELP = [
  ['whoami', 'who is Vijay?'],
  ['about', 'the one-paragraph pitch'],
  ['projects', 'list missions · open <name> launches one'],
  ['skills', 'the toolkit, by category'],
  ['experience', 'the flight log'],
  ['awards', 'commendations'],
  ['sql <query>', 'query my career — try: sql SHOW TABLES'],
  ['ask <question>', 'plain English → SQL — try: ask which projects use dbt'],
  ['goto <place>', 'jump to a section (tab completes)'],
  ['resume', 'download my résumé'],
  ['contact', 'ways to reach me'],
  ['theme', 'toggle light / dark'],
  ['play', 'launch Schema Storm, the data game'],
  ...(SpeechRecognition
    ? [['🎙 voice mode', 'talk to it — it answers out loud and keeps listening']]
    : []),
  ['clear · history · exit', ''],
]

// Tap targets for touch users, who have no Tab key to discover commands.
const SUGGESTIONS = ['help', 'whoami', 'projects', 'ask which projects use dbt', 'sql SHOW TABLES']

const COMMANDS = [
  'help',
  'whoami',
  'about',
  'ls',
  'projects',
  'open',
  'skills',
  'experience',
  'awards',
  'sql',
  'ask',
  'play',
  'goto',
  'resume',
  'contact',
  'theme',
  'history',
  'clear',
  'exit',
]

const TONES = {
  out: 'text-slate-700 dark:text-slate-200',
  muted: 'text-slate-500 dark:text-slate-400',
  accent: 'text-purple-600 dark:text-cyan-300',
  ok: 'text-emerald-600 dark:text-emerald-400',
  err: 'text-rose-600 dark:text-rose-400',
}

const line = (text, tone = 'out') => ({ text, tone })

// ---- Voice out: what the terminal says back ----
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

function pickVoice() {
  const voices = synth?.getVoices() ?? []
  const english = voices.filter((v) => v.lang?.startsWith('en'))
  return (
    english.find((v) => v.lang === 'en-IN') ??
    english.find((v) => /google|samantha|natural/i.test(v.name)) ??
    english[0] ??
    null
  )
}

function speak(text, onDone) {
  if (!synth || !text) {
    onDone?.()
    return
  }
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voice = pickVoice()
  if (voice) u.voice = voice
  u.rate = 1.05
  u.onend = () => onDone?.()
  u.onerror = () => onDone?.()
  synth.speak(u)
}

const cleanForSpeech = (t) =>
  t
    .replace(/https?:\/\/\S+/g, 'a link')
    .replace(/[❯✓✕📍🏅✨🎙`·→←⇢—|]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// A short spoken version of a command's output.
function spokenSummary(output) {
  if (output.speech) return output.speech
  // Muted lines are metadata (timings, hints) — read only the substance.
  const parts = output
    .map((l) => l.speech ?? (l.text && l.tone !== 'muted' ? cleanForSpeech(l.text) : ''))
    .filter(Boolean)
  const text = parts.slice(0, 4).join('. ') + (parts.length > 4 ? '. More is on screen.' : '')
  return text.slice(0, 320)
}

const withSpeech = (output, speech) => Object.assign(output, { speech })

const BANNER = [
  line('VJ-OS 3.0 · data-shell', 'accent'),
  line('Type `help` to see what I can do. Tab completes, ↑ ↓ recall history, Esc closes.', 'muted'),
]

const projects = PORTFOLIO_DATA.projects.filter((p) => !p.placeholder)

function isTyping(el) {
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
  )
}

export default function Terminal({ open, setOpen, theme, toggleTheme }) {
  const [lines, setLines] = useState(BANNER)
  const [input, setInput] = useState('')
  const history = useRef([])
  const historyIndex = useRef(-1)
  const inputRef = useRef(null)
  const outputRef = useRef(null)
  const returnFocus = useRef(null)

  // ⌘K / Ctrl+K toggles from anywhere; ` opens when not typing; Esc closes.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === '`' && !isTyping(e.target)) {
        e.preventDefault()
        setOpen(true)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (open) {
      unlock('terminal')
      returnFocus.current = document.activeElement
      inputRef.current?.focus()
    } else if (returnFocus.current instanceof HTMLElement) {
      returnFocus.current.focus()
    }
  }, [open])

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight })
  }, [lines])

  const close = () => setOpen(false)

  const goto = (id) => {
    close()
    // Let the dialog unmount first so focus restoration doesn't fight the scroll.
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  const runSql = (query) => {
    try {
      const result = runQuery(query, CAREER_TABLES)
      const n = result.rows.length
      const firsts = result.rows.slice(0, 5).map((r) => r[0])
      return [
        {
          node: <ResultTable result={result} compact />,
          speech: n
            ? `Found ${n}: ${
                firsts.length > 1
                  ? `${firsts.slice(0, -1).join(', ')} and ${firsts.at(-1)}`
                  : firsts[0]
              }${n > 5 ? ', and more on screen' : ''}.`
            : 'Nothing matched that.',
        },
        line(
          `${result.rows.length} row${result.rows.length === 1 ? '' : 's'} in ${result.ms.toFixed(2)} ms`,
          'muted',
        ),
      ]
    } catch (err) {
      return [line(err.message, 'err')]
    }
  }

  const execute = (raw) => {
    const [cmd = '', ...rest] = raw.trim().split(/\s+/)
    const arg = rest.join(' ')
    const name = cmd.toLowerCase()
    const { profile } = PORTFOLIO_DATA

    if (/^(select|show|describe)$/.test(name)) return runSql(raw)

    switch (name) {
      case '':
        return []
      case 'help':
        return withSpeech(
          HELP.map(([c, d]) => line(`  ${c.padEnd(24)}${d}`)),
          "I can tell you about Vijay's projects, skills, experience and awards, run SQL, answer questions in plain English, jump to any section, or start the data game. Try: which projects use dbt.",
        )
      case 'whoami':
        return withSpeech(
          [
            line(profile.name, 'accent'),
            line(`${profile.role} · ${profile.certification}`),
            line(`📍 ${profile.location}`, 'muted'),
          ],
          `${profile.name} is a ${profile.role} and ${profile.certification}, based in ${profile.location}.`,
        )
      case 'about':
        return [line(profile.summary)]
      case 'ls':
        return [
          line(
            Object.keys(PLACES)
              .filter((p) => p !== 'top')
              .map((p) => `${p}/`)
              .join('  '),
            'accent',
          ),
        ]
      case 'projects':
        return [
          ...projects.map((p) => line(`  ${p.id.padEnd(16)}${p.tagline}`)),
          line('open <name> to launch one', 'muted'),
        ]
      case 'open': {
        const match = projects.find(
          (p) =>
            p.id.startsWith(arg.toLowerCase()) ||
            p.name.toLowerCase().startsWith(arg.toLowerCase()),
        )
        if (!arg || !match)
          return [line(`open: no mission named "${arg}". Try \`projects\`.`, 'err')]
        const url = match.live ?? match.github
        window.open(url, '_blank', 'noopener,noreferrer')
        return [line(`Launching ${match.name} → ${url}`, 'ok')]
      }
      case 'skills': {
        const byCategory = Object.groupBy
          ? Object.groupBy(SKILLS, (s) => s.category)
          : SKILLS.reduce((acc, s) => ((acc[s.category] ??= []).push(s), acc), {})
        return Object.entries(byCategory).map(([cat, list]) =>
          line(`  ${cat.padEnd(16)}${list.map((s) => s.name).join(', ')}`),
        )
      }
      case 'experience':
        return PORTFOLIO_DATA.experience.map((e) =>
          line(
            `  ${e.period.padEnd(22)}${e.title} @ ${e.company}${e.badge ? `  [${e.badge}]` : ''}`,
          ),
        )
      case 'awards':
        return PORTFOLIO_DATA.awards.map((a) => line(`  🏅 ${a.year}  ${a.name} — ${a.issuer}`))
      case 'sql':
        return arg ? runSql(arg) : [line('usage: sql SELECT * FROM projects', 'muted')]
      case 'ask': {
        if (!arg) return [line('usage: ask which projects use terraform', 'muted')]
        try {
          const sql = textToSql(arg)
          unlock('ask')
          // Speak the answer, not the SQL.
          const result = runSql(sql)
          return withSpeech(
            [line(sql.replace(/\n\s*/g, ' '), 'accent'), ...result],
            spokenSummary(result),
          )
        } catch (err) {
          return [line(err.message, 'err')]
        }
      }
      case 'goto': {
        const id = PLACES[arg.toLowerCase()]
        if (!id) return [line(`goto: unknown place. Try: ${Object.keys(PLACES).join(', ')}`, 'err')]
        goto(id)
        return [line(`Warping to ${arg}…`, 'ok')]
      }
      case 'resume': {
        const a = document.createElement('a')
        a.href = profile.resume
        a.download = profile.resume.split('/').pop()
        a.click()
        return [line('Downloading résumé…', 'ok')]
      }
      case 'contact':
        return [
          line(`  email     ${profile.email}`),
          line(`  linkedin  ${profile.linkedin}`),
          line(`  github    ${profile.github}`),
        ]
      case 'theme': {
        const want = arg.toLowerCase()
        if (want && want !== 'dark' && want !== 'light')
          return [line('usage: theme [dark|light]', 'muted')]
        const next = want || (theme === 'dark' ? 'light' : 'dark')
        if (next !== theme) toggleTheme()
        return [line(`Theme set to ${next}.`, 'ok')]
      }
      case 'history':
        return history.current.map((h, i) => line(`  ${String(i + 1).padStart(3)}  ${h}`, 'muted'))
      case 'clear':
        setLines([])
        return null
      case 'exit':
        close()
        return []
      case 'play':
        window.location.href = '/play'
        return [line('Booting Schema Storm…', 'ok')]
      // A few things people always try.
      case 'sudo':
        if (/^hire\b/i.test(arg)) {
          unlock('hire')
          playSparkle()
          goto('contact')
          return [line('Permission granted. Opening a channel… ✨', 'ok')]
        }
        return [line('guest is not in the sudoers file. This incident will be reported.', 'err')]
      case 'hire':
        return [line('Did you mean `sudo hire vijay`?', 'muted')]
      case 'rm':
        return [
          line('Nice try. These pipelines are idempotent — and this one is read-only.', 'err'),
        ]
      case 'ping':
        return [line('pong · 0.4 ms from Chennai', 'ok')]
      case 'date':
        return [line(new Date().toString())]
      case 'echo':
        return [line(arg)]
      default:
        return [line(`command not found: ${cmd}. Type \`help\`.`, 'err')]
    }
  }

  // ---- Voice mode: listen → run → speak the reply → listen again ----
  // 'off' | 'listening' | 'speaking'. Recognition is stopped while the reply
  // plays so the terminal never transcribes its own voice.
  const [voice, setVoice] = useState('off')
  const [transcript, setTranscript] = useState('')
  const voiceOn = useRef(false)
  const recognizer = useRef(null)
  const silentRounds = useRef(0)

  const stopVoice = (message) => {
    voiceOn.current = false
    recognizer.current?.abort()
    recognizer.current = null
    setTranscript('')
    setVoice('off')
    if (message) setLines((prev) => [...prev, line(message, 'muted')])
  }

  const listenOnce = () => {
    if (!voiceOn.current) return
    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.maxAlternatives = 1
    let finalText = ''
    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalText += r[0].transcript
        else interim += r[0].transcript
      }
      setTranscript(`${finalText}${interim}`)
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      const reason = e.error === 'not-allowed' ? 'microphone permission was denied' : e.error
      stopVoice(`voice: ${reason}`)
    }
    rec.onend = () => {
      recognizer.current = null
      if (!voiceOn.current) return
      const said = finalText.trim()
      if (!said) {
        // Keep listening through short silences; give up after a while.
        silentRounds.current += 1
        if (silentRounds.current >= 3) stopVoice('voice paused — tap 🎙 to resume')
        else listenOnce()
        return
      }
      silentRounds.current = 0
      setTranscript('')
      unlock('voice')
      setLines((prev) => [...prev, line(`🎙 heard: “${said}”`, 'muted')])
      const output = run(voiceToCommand(said))
      setVoice('speaking')
      speak(output ? spokenSummary(output) : 'Done.', () => {
        if (!voiceOn.current) return
        setVoice('listening')
        listenOnce()
      })
    }
    recognizer.current = rec
    rec.start()
    setVoice('listening')
  }

  const toggleVoice = () => {
    if (voiceOn.current) {
      synth?.cancel()
      stopVoice()
      return
    }
    voiceOn.current = true
    silentRounds.current = 0
    listenOnce()
  }

  // Closing the terminal ends voice mode (a reply already playing finishes).
  useEffect(() => {
    if (!open && voiceOn.current) stopVoice()
  }, [open])

  const run = (raw) => {
    if (raw.trim()) history.current.push(raw.trim())
    historyIndex.current = -1
    setInput('')
    const output = execute(raw)
    if (output === null) return null
    setLines((prev) => [...prev, { prompt: raw }, ...output])
    return output
  }

  const submit = (e) => {
    e.preventDefault()
    run(input)
  }

  const complete = () => {
    const [cmd, ...rest] = input.split(' ')
    let pool
    let prefix
    let base
    if (rest.length === 0) {
      pool = COMMANDS
      prefix = cmd.toLowerCase()
      base = ''
    } else if (cmd === 'goto' || cmd === 'open') {
      pool = cmd === 'goto' ? Object.keys(PLACES) : projects.map((p) => p.id)
      prefix = rest.join(' ').toLowerCase()
      base = `${cmd} `
    } else {
      return
    }
    const matches = pool.filter((c) => c.startsWith(prefix))
    if (matches.length === 1) setInput(`${base}${matches[0]} `)
    else if (matches.length > 1) {
      setLines((prev) => [...prev, { prompt: input }, line(matches.join('  '), 'muted')])
    }
  }

  const onKeyDown = (e) => {
    const h = history.current
    if (e.key === 'Tab') {
      e.preventDefault()
      complete()
    } else if (e.key === 'ArrowUp' && h.length) {
      e.preventDefault()
      historyIndex.current =
        historyIndex.current === -1 ? h.length - 1 : Math.max(0, historyIndex.current - 1)
      setInput(h[historyIndex.current])
    } else if (e.key === 'ArrowDown' && historyIndex.current !== -1) {
      e.preventDefault()
      historyIndex.current += 1
      if (historyIndex.current >= h.length) {
        historyIndex.current = -1
        setInput('')
      } else setInput(h[historyIndex.current])
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm dark:bg-black/50"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        className="glass-deep relative w-full max-w-2xl overflow-hidden rounded-2xl"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center gap-2 border-b border-white/20 px-4 py-2.5 dark:border-white/10">
          <button
            aria-label="Close terminal"
            onClick={close}
            className="h-2.5 w-2.5 rounded-full bg-rose-400/80 hover:bg-rose-500"
          />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="font-display ml-3 text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase dark:text-slate-400">
            guest@vijay-os: ~
          </span>
        </div>

        <div
          ref={outputRef}
          className="h-[min(55vh,26rem)] overflow-y-auto overscroll-contain px-4 py-3 font-mono text-[12.5px] leading-relaxed"
        >
          {lines.map((l, i) =>
            l.node ? (
              <div
                key={i}
                className="my-1.5 overflow-x-auto rounded-lg border border-slate-300/50 dark:border-white/10"
              >
                {l.node}
              </div>
            ) : l.prompt !== undefined ? (
              <p
                key={i}
                className="mt-2 break-words whitespace-pre-wrap text-slate-800 dark:text-slate-100"
              >
                <span className="text-purple-600 dark:text-cyan-300">❯ </span>
                {l.prompt}
              </p>
            ) : (
              <p key={i} className={`break-words whitespace-pre-wrap ${TONES[l.tone]}`}>
                {l.text}
              </p>
            ),
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-white/20 px-4 py-2 dark:border-white/10">
          {SUGGESTIONS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => run(cmd)}
              className="glass shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] text-slate-600 transition hover:scale-105 dark:text-slate-300"
            >
              {cmd}
            </button>
          ))}
        </div>

        {voice !== 'off' && (
          <div
            className="flex items-center gap-3 border-t border-white/20 bg-rose-500/5 px-4 py-2 dark:border-white/10"
            aria-live="polite"
          >
            <span className="voice-bars flex h-4 items-end gap-0.5" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className={voice === 'speaking' ? 'is-speaking' : ''} />
              ))}
            </span>
            <span className="font-display shrink-0 text-[9px] font-bold tracking-[0.25em] text-rose-500 uppercase">
              {voice === 'speaking' ? 'Speaking' : 'Live'}
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-slate-700 dark:text-slate-200">
              {voice === 'speaking'
                ? 'replying… then listening again'
                : transcript || 'listening — try “go to projects” or “which projects use dbt”'}
            </span>
          </div>
        )}

        <form
          onSubmit={submit}
          className="flex items-center gap-2 border-t border-white/20 px-4 py-3 dark:border-white/10"
        >
          <span className="font-mono text-sm text-purple-600 dark:text-cyan-300">❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input"
            placeholder={voice === 'off' ? 'type help' : 'voice mode on — or type'}
            className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
          />
          {SpeechRecognition && (
            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={voice !== 'off'}
              aria-label={voice !== 'off' ? 'Turn voice mode off' : 'Talk to the terminal'}
              title="Voice mode — talk, and it talks back"
              className={`shrink-0 rounded-full px-2.5 py-1 text-sm transition ${
                voice !== 'off'
                  ? 'animate-pulse bg-rose-500/20 text-rose-500'
                  : 'glass hover:scale-105'
              }`}
            >
              🎙
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
