import { useEffect, useState } from 'react'
import { PORTFOLIO_DATA } from '../data/portfolio.js'

// Live public GitHub data for the telemetry panel and project-card badges.
// One shared request per page view, cached in sessionStorage for 10 minutes
// to stay well inside the anonymous API limit (60 requests / hour / IP).

export const GITHUB_USER = PORTFOLIO_DATA.profile.github.split('/').filter(Boolean).pop()
const KEY = `vj-github:${GITHUB_USER}`
const TTL_MS = 10 * 60 * 1000

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
  if (!res.ok)
    throw new Error(
      res.status === 403 || res.status === 429 ? 'rate-limited' : `HTTP ${res.status}`,
    )
  return res.json()
}

function simplifyEvent(e) {
  const repo = e.repo.name.split('/').pop()
  const p = e.payload ?? {}
  const base = { id: e.id, repo, at: e.created_at }
  switch (e.type) {
    case 'PushEvent':
      return {
        ...base,
        topic: 'push',
        detail: `${String(p.ref ?? '').replace('refs/heads/', '')} @ ${String(p.head ?? '').slice(0, 7)}`,
      }
    case 'PullRequestEvent':
      return { ...base, topic: `pr.${p.action}`, detail: `#${p.number}` }
    case 'CreateEvent':
      return { ...base, topic: `create.${p.ref_type}`, detail: p.ref ?? repo }
    case 'DeleteEvent':
      return { ...base, topic: `delete.${p.ref_type}`, detail: p.ref ?? '' }
    case 'ReleaseEvent':
      return { ...base, topic: 'release', detail: p.release?.tag_name ?? '' }
    case 'WatchEvent':
      return { ...base, topic: 'star', detail: '' }
    default:
      return { ...base, topic: e.type.replace(/Event$/, '').toLowerCase(), detail: '' }
  }
}

async function load() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(KEY))
    if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached
  } catch {
    /* no cache available */
  }
  const [repos, events] = await Promise.all([
    getJson(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`),
    getJson(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`),
  ])
  const data = {
    fetchedAt: Date.now(),
    repos: repos.map((r) => ({
      name: r.name,
      language: r.language,
      stars: r.stargazers_count,
      fork: r.fork,
      pushedAt: r.pushed_at,
    })),
    events: events.map(simplifyEvent),
  }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* storage full or blocked — fine, we just refetch next visit */
  }
  return data
}

let inflight = null

// Shared fetch: the boot screen starts it, the panels reuse the same promise.
export const loadGitHub = () => {
  inflight ??= load().catch((err) => {
    inflight = null
    throw err
  })
  return inflight
}

export function useGitHub() {
  const [state, setState] = useState({ status: 'loading' })
  useEffect(() => {
    let alive = true
    loadGitHub()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((err) => alive && setState({ status: 'error', reason: err.message }))
    return () => {
      alive = false
    }
  }, [])
  return state
}

export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  const units = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ]
  for (const [size, label] of units) if (s >= size) return `${Math.floor(s / size)}${label} ago`
  return 'just now'
}

// The repo a project card links to, if it's public.
export const repoFor = (data, project) => {
  const name = project.github?.split('/').filter(Boolean).pop()?.toLowerCase()
  return name ? data?.repos.find((r) => r.name.toLowerCase() === name) : undefined
}
