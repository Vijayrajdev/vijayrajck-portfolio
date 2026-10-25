import { useEffect, useState } from 'react'
import { GITHUB_USER } from './useGitHub.js'

// The last 12 months of GitHub contributions. GitHub's own calendar needs an
// authenticated GraphQL call, so this uses the public, CORS-enabled
// github-contributions-api (jogruber), cached for the browser session.

const URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`
const KEY = `vj-contributions:v2:${GITHUB_USER}`

// Colour levels by quartile of active days (as GitHub does), so a single
// outlier day doesn't flatten the rest of the year into one shade.
function withLevels(days) {
  const counts = days
    .map((d) => d.count)
    .filter(Boolean)
    .sort((a, b) => a - b)
  const q = (p) => counts[Math.min(counts.length - 1, Math.floor(p * counts.length))] ?? 0
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)]
  return days.map((d) => ({
    ...d,
    level: !d.count ? 0 : d.count <= q1 ? 1 : d.count <= q2 ? 2 : d.count <= q3 ? 3 : 4,
  }))
}

function summarise(days) {
  let longest = 0
  let run = 0
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0
    longest = Math.max(longest, run)
  }
  // Current streak counts back from today; an empty today doesn't break it yet.
  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++
    else if (i !== days.length - 1) break
  }
  const busiest = days.reduce((a, b) => (b.count > a.count ? b : a), days[0])
  return {
    total: days.reduce((n, d) => n + d.count, 0),
    activeDays: days.filter((d) => d.count > 0).length,
    longest,
    current,
    busiest,
  }
}

async function load() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(KEY))
    if (cached) return cached
  } catch {
    /* no cache */
  }
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  const days = withLevels(json.contributions.map((d) => ({ date: d.date, count: d.count })))
  const data = { days, stats: summarise(days) }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* fine — refetch next time */
  }
  return data
}

let inflight = null

// Shared fetch: the boot screen starts it, the map reuses the same promise.
export const loadContributions = () => {
  inflight ??= load().catch((err) => {
    inflight = null
    throw err
  })
  return inflight
}

export function useContributions() {
  const [state, setState] = useState({ status: 'loading' })
  useEffect(() => {
    let alive = true
    loadContributions()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch(() => alive && setState({ status: 'error' }))
    return () => {
      alive = false
    }
  }, [])
  return state
}
