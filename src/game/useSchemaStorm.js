import { useCallback, useEffect, useRef, useState } from 'react'
import {
  RULES,
  beltSeconds,
  levelFor,
  makeRow,
  readBoard,
  saveRun,
  spawnSeconds,
  violations,
} from './schemaStorm.js'
import { setPulseLevel, sfx, startPulse, stopPulse } from './sfx.js'
import { unlock } from '../utils/achievements.js'

const LIVES = 3
const EXIT_MS = 450
const EFFECT_MS = 900
const VIP_CHANCE = 0.08
const VIP_BONUS = 3
const FREEZE_EVERY = 10 // streak needed to earn a freeze charge
const FREEZE_MAX = 2
const FREEZE_MS = 5000
const FREEZE_SPEED = 0.35
const PERFECT_BONUS = 100

const fresh = () => ({
  items: [],
  effects: [],
  ctx: { seq: 0, loaded: [] },
  score: 0,
  lives: LIVES,
  correct: 0,
  processed: 0,
  streak: 0,
  bestStreak: 0,
  level: 1,
  levelMistakes: 0,
  charges: 0,
  freezeUntil: 0,
  shakeAt: 0,
  spawnIn: 0.4,
  feedback: null,
  banner: null,
})

export const multiplierFor = (streak) => Math.min(5, 1 + Math.floor(streak / 5))

// ---- Pure helpers over the mutable game state `g` ----

const say = (g, tone, text) => {
  g.feedback = { tone, text, at: performance.now() }
}

const effect = (g, kind, item, text = '') => {
  g.effects.push({
    id: `${kind}-${item.key}-${performance.now()}`,
    kind,
    text,
    p: item.progress,
    tone: item.state,
    at: performance.now(),
  })
}

// Returns true when that was the last life.
const loseLife = (g) => {
  if (g.lives <= 0) return false
  g.lives -= 1
  g.streak = 0
  g.levelMistakes += 1
  g.shakeAt = performance.now()
  navigator.vibrate?.(120)
  return g.lives <= 0
}

const levelCheck = (g) => {
  const next = levelFor(g.correct)
  if (next === g.level) return
  const perfect = g.levelMistakes === 0
  if (perfect) g.score += PERFECT_BONUS * g.level
  const finished = g.level
  g.level = next
  g.levelMistakes = 0
  setPulseLevel(next)
  const added = RULES.filter((r) => r.level === next)
  g.banner = {
    level: next,
    at: performance.now(),
    perfect: perfect ? `perfect level ${finished} · +${PERFECT_BONUS * finished}` : null,
    text: added.length
      ? added
          .map((r) =>
            r.column ? `schema drift · new column ${r.column}` : `new contract · ${r.label}`,
          )
          .join(' · ')
      : 'belt speed increased',
  }
  sfx.levelUp()
  if (perfect) sfx.perfect()
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
  const [countdown, setCountdown] = useState(0)
  const [board, setBoard] = useState(readBoard)
  const [rank, setRank] = useState(-1)
  const [, setFrame] = useState(0)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  // Read live each spawn, so a new function per render needn't restart the loop.
  const spacingRef = useRef(measureSpacing)
  spacingRef.current = measureSpacing

  const finish = useCallback(() => {
    const g = game.current
    stopPulse()
    sfx.gameOver()
    const run = { score: g.score, level: g.level, date: new Date().toISOString().slice(0, 10) }
    setRank(saveRun(run))
    setBoard(readBoard())
    setPhase('over')
  }, [])

  // The animation loop.
  useEffect(() => {
    if (phase !== 'playing') return
    startPulse(game.current.level)
    let raf
    let last = performance.now()
    const tick = (now) => {
      const g = game.current
      const frozen = now < g.freezeUntil
      // Cap the step at 0.1s: real-time down to 10 fps (slow devices), but no
      // huge jump after a stall.
      const dt = Math.min(0.1, (now - last) / 1000) * (frozen ? FREEZE_SPEED : 1)
      last = now

      for (const item of g.items) {
        if (item.state !== 'moving') continue
        item.progress += dt / beltSeconds(g.level)
        if (item.progress >= 1) {
          item.state = 'missed'
          item.doneAt = now
          g.processed += 1
          say(g, 'err', `✕ SLA miss — row ${item.row.id ?? 'NULL'} hit the gate unprocessed`)
          sfx.miss()
          if (loseLife(g)) finish()
        }
      }
      g.items = g.items.filter((i) => i.state === 'moving' || now - i.doneAt < EXIT_MS)
      g.effects = g.effects.filter((e) => now - e.at < EFFECT_MS)

      g.spawnIn -= dt
      if (g.spawnIn <= 0) {
        g.ctx.seq += 1
        g.items.push({
          ...makeRow(g.level, g.ctx),
          vip: Math.random() < VIP_CHANCE,
          progress: 0,
          state: 'moving',
        })
        g.spawnIn = spawnSeconds(g.level, spacingRef.current?.())
      }

      setFrame((n) => n + 1)
      if (phaseRef.current === 'playing') raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      stopPulse()
    }
  }, [phase, finish])

  // 3 · 2 · 1 · GO
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) {
      sfx.go()
      setPhase('playing')
      return
    }
    sfx.tick()
    const t = setTimeout(() => setCountdown((n) => n - 1), 650)
    return () => clearTimeout(t)
  }, [phase, countdown])

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
        const points = 10 * multiplierFor(g.streak) * g.level * (item.vip ? VIP_BONUS : 1)
        g.score += points
        effect(g, 'pop', item, `+${points}${item.vip ? ' VIP' : ''}`)
        effect(g, 'burst', item)
        say(
          g,
          'ok',
          clean
            ? `✓ +${points} · loaded clean row ${item.row.id}`
            : `✓ +${points} · quarantined: ${failed[0].why(item.row)}`,
        )
        if (item.vip) sfx.vip()
        else if (choice === 'load') sfx.load()
        else sfx.quarantine()
        if (g.streak % 5 === 0) sfx.combo()
        if (g.streak % FREEZE_EVERY === 0 && g.charges < FREEZE_MAX) {
          g.charges += 1
          say(g, 'ok', `❄ freeze charged — press F or Space to slow the belt`)
        }
        if (g.score >= 500) unlock('steward')
        levelCheck(g)
      } else {
        effect(g, 'pop', item, '✕')
        say(
          g,
          'err',
          clean
            ? `✕ Row ${item.row.id} was clean — every contract passed`
            : `✕ Loaded a bad row — ${failed[0].why(item.row)}`,
        )
        sfx.error()
        if (loseLife(g)) finish()
      }
      setFrame((n) => n + 1)
    },
    [finish],
  )

  const freeze = useCallback(() => {
    const g = game.current
    if (phaseRef.current !== 'playing' || g.charges === 0 || performance.now() < g.freezeUntil)
      return
    g.charges -= 1
    g.freezeUntil = performance.now() + FREEZE_MS
    say(g, 'ok', '❄ backfill freeze — belt at 35% for 5s')
    sfx.freeze()
    setFrame((n) => n + 1)
  }, [])

  const start = useCallback(() => {
    sfx.unlock()
    game.current = fresh()
    setRank(-1)
    unlock('play')
    setCountdown(3)
    setPhase('countdown')
  }, [])

  const togglePause = useCallback(() => {
    setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p))
  }, [])

  return {
    game: game.current,
    phase,
    countdown,
    board,
    rank,
    act,
    freeze,
    start,
    togglePause,
    front: frontOf(game.current),
    frozen: performance.now() < game.current.freezeUntil,
  }
}
