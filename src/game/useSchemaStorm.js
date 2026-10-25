import { useCallback, useEffect, useRef, useState } from 'react'
import {
  RULES,
  beltSeconds,
  levelFor,
  makeRow,
  readBest,
  saveBest,
  spawnSeconds,
  violations,
} from './schemaStorm.js'
import { unlock } from '../utils/achievements.js'

const LIVES = 3
const EXIT_MS = 450

const fresh = () => ({
  items: [],
  ctx: { seq: 0, loaded: [] },
  score: 0,
  lives: LIVES,
  correct: 0,
  processed: 0,
  streak: 0,
  bestStreak: 0,
  level: 1,
  spawnIn: 0.4,
  feedback: null,
  banner: null,
})

export const multiplierFor = (streak) => Math.min(5, 1 + Math.floor(streak / 5))

// Pure helpers over the mutable game state `g`.
const say = (g, tone, text) => {
  g.feedback = { tone, text, at: performance.now() }
}

// Returns true when that was the last life.
const loseLife = (g) => {
  if (g.lives <= 0) return false
  g.lives -= 1
  g.streak = 0
  return g.lives <= 0
}

const levelCheck = (g) => {
  const next = levelFor(g.correct)
  if (next === g.level) return
  g.level = next
  const added = RULES.filter((r) => r.level === next)
  g.banner = {
    level: next,
    at: performance.now(),
    text: added.length
      ? added
          .map((r) =>
            r.column ? `schema drift · new column ${r.column}` : `new contract · ${r.label}`,
          )
          .join(' · ')
      : 'belt speed increased',
  }
}

const frontOf = (g) =>
  g.items
    .filter((i) => i.state === 'moving')
    .reduce((a, b) => (!a || b.progress > a.progress ? b : a), null)

// Game state lives in a ref and is mutated by a requestAnimationFrame loop;
// a frame counter re-renders React. Returns a snapshot plus controls.
// `measureSpacing()` returns the fraction of belt travel one card needs.
export function useSchemaStorm(measureSpacing) {
  const game = useRef(fresh())
  const [phase, setPhase] = useState('intro')
  const [best, setBest] = useState(readBest)
  const [, setFrame] = useState(0)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  // Read live each spawn, so a new function per render needn't restart the loop.
  const spacingRef = useRef(measureSpacing)
  spacingRef.current = measureSpacing

  const finish = useCallback(() => {
    saveBest(game.current.score)
    setBest(readBest())
    setPhase('over')
  }, [])

  // The animation loop.
  useEffect(() => {
    if (phase !== 'playing') return
    let raf
    let last = performance.now()
    const tick = (now) => {
      const g = game.current
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      for (const item of g.items) {
        if (item.state !== 'moving') continue
        item.progress += dt / beltSeconds(g.level)
        if (item.progress >= 1) {
          item.state = 'missed'
          item.doneAt = now
          g.processed += 1
          say(g, 'err', `✕ SLA miss — row ${item.row.id ?? 'NULL'} hit the gate unprocessed`)
          if (loseLife(g)) finish()
        }
      }
      g.items = g.items.filter((i) => i.state === 'moving' || now - i.doneAt < EXIT_MS)

      g.spawnIn -= dt
      if (g.spawnIn <= 0) {
        g.ctx.seq += 1
        g.items.push({ ...makeRow(g.level, g.ctx), progress: 0, state: 'moving' })
        g.spawnIn = spawnSeconds(g.level, spacingRef.current?.())
      }

      setFrame((n) => n + 1)
      if (phaseRef.current === 'playing') raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, finish])

  // Pause when the tab is hidden.
  useEffect(() => {
    const onHide = () => document.hidden && phaseRef.current === 'playing' && setPhase('paused')
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [])

  const act = useCallback(
    (choice) => {
      if (phaseRef.current !== 'playing') return
      const g = game.current
      const item = frontOf(g)
      if (!item) return
      const failed = violations(item, g.ctx)
      const clean = failed.length === 0
      const right = (choice === 'load') === clean

      item.state = choice === 'load' ? 'loaded' : 'quarantined'
      item.doneAt = performance.now()
      g.processed += 1
      if (choice === 'load' && item.row.id !== null && !g.ctx.loaded.includes(item.row.id)) {
        g.ctx.loaded.push(item.row.id)
      }

      if (right) {
        g.streak += 1
        g.bestStreak = Math.max(g.bestStreak, g.streak)
        g.correct += 1
        const points = 10 * multiplierFor(g.streak) * g.level
        g.score += points
        say(
          g,
          'ok',
          clean
            ? `✓ +${points} · loaded clean row ${item.row.id}`
            : `✓ +${points} · quarantined: ${failed[0].why(item.row)}`,
        )
        if (g.score >= 500) unlock('steward')
        levelCheck(g)
      } else {
        say(
          g,
          'err',
          clean
            ? `✕ Row ${item.row.id} was clean — every contract passed`
            : `✕ Loaded a bad row — ${failed[0].why(item.row)}`,
        )
        if (loseLife(g)) finish()
      }
      setFrame((n) => n + 1)
    },
    [finish],
  )

  const start = useCallback(() => {
    game.current = fresh()
    unlock('play')
    setPhase('playing')
  }, [])

  const togglePause = useCallback(() => {
    setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p))
  }, [])

  return {
    game: game.current,
    phase,
    best,
    act,
    start,
    togglePause,
    front: frontOf(game.current),
  }
}
