// Exploration badges. Any component calls unlock(id); the Achievements UI
// listens for the event and shows a toast. Progress is a per-visitor
// convenience kept in localStorage, with an in-memory fallback.

export const ACHIEVEMENTS = [
  {
    id: 'terminal',
    icon: '>_',
    title: 'Shell Access',
    hint: 'Open the terminal — ⌘K, Ctrl K or `',
  },
  { id: 'sql', icon: '⌘', title: 'Query Runner', hint: 'Run your own SQL in the Query Console' },
  {
    id: 'ask',
    icon: '✦',
    title: 'Plain English',
    hint: 'Ask the Query Console a question in English',
  },
  {
    id: 'lineage',
    icon: '⇢',
    title: 'Lineage Tracer',
    hint: 'Trace a skill through the lineage graph',
  },
  {
    id: 'telemetry',
    icon: '◉',
    title: 'Signal Acquired',
    hint: 'Catch the live GitHub telemetry stream',
  },
  { id: 'theme', icon: '◐', title: 'Day & Night', hint: 'Switch between light and dark' },
  { id: 'explorer', icon: '✧', title: 'Explorer', hint: 'Visit every chapter of the page' },
  { id: 'hire', icon: '🚀', title: 'Mission Accepted', hint: 'Find the secret terminal command' },
  { id: 'voice', icon: '🎙', title: 'Voice Link', hint: 'Command the terminal by voice' },
  { id: 'play', icon: '▶', title: 'Player One', hint: 'Start a round of Schema Storm' },
  { id: 'steward', icon: '◆', title: 'Data Steward', hint: 'Score 500+ in Schema Storm' },
]

const KEY = 'vj-achievements'
export const ACHIEVEMENT_EVENT = 'vj:achievement'

let unlocked = (() => {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'))
  } catch {
    return new Set()
  }
})()

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify([...unlocked]))
  } catch {
    /* storage unavailable — progress lives for this visit only */
  }
}

export const getUnlocked = () => new Set(unlocked)

export function unlock(id) {
  if (unlocked.has(id) || !ACHIEVEMENTS.some((a) => a.id === id)) return
  unlocked.add(id)
  persist()
  window.dispatchEvent(new CustomEvent(ACHIEVEMENT_EVENT, { detail: id }))
}

export function resetAchievements() {
  unlocked = new Set()
  persist()
  window.dispatchEvent(new CustomEvent(ACHIEVEMENT_EVENT, { detail: null }))
}
