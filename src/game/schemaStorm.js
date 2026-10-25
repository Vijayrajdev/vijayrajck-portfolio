// Schema Storm — game rules, kept free of React so they can be tested alone.
// Rows ride a conveyor toward the warehouse; the player LOADs rows that pass
// every active data contract and QUARANTINEs the rest to the dead-letter
// queue. Each level adds a contract (and sometimes a column): schema drift.

export const WATERMARK = '2060-06-01 12:00'
export const COUNTRIES = ['IN', 'US', 'UK', 'JP']
export const MAX_LEVEL = 7
export const ROWS_PER_LEVEL = 8
// Duplicates copy one of the last DUP_WINDOW loaded ids; the ledger shows
// LEDGER_SIZE, enough headroom for rows loaded while the duplicate rides
// the belt (it never holds more than ~4), so a duplicate is always visible.
export const DUP_WINDOW = 3
export const LEDGER_SIZE = 8

const NAMES = [
  'ada',
  'linus',
  'grace',
  'alan',
  'radia',
  'ken',
  'margaret',
  'vint',
  'barbara',
  'dennis',
]
const DOMAINS = ['orbit.io', 'luna.dev', 'mail.com', 'data.co', 'neo.net']

const pick = (list, rand) => list[Math.floor(rand() * list.length)]
const money = (rand) => Math.round((1 + rand() * 998) * 100) / 100
const pad = (n) => String(n).padStart(2, '0')

function timestamp(rand, future) {
  // Valid rows land in the 30 days before the watermark; late ones after it.
  const base = Date.UTC(2060, 5, 1, 12, 0)
  const offsetMin = Math.floor(rand() * 30 * 24 * 60) + 1
  const d = new Date(base + (future ? offsetMin : -offsetMin) * 60000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

// Each contract: the level it arrives at, the SQL-ish label shown to the
// player, a check, a way to break a valid row, and why a row failed.
export const RULES = [
  {
    id: 'id',
    level: 1,
    label: 'id IS NOT NULL',
    check: (r) => r.id !== null,
    corrupt: (r) => ({ ...r, id: null }),
    why: () => 'id is NULL',
  },
  {
    id: 'email',
    level: 1,
    label: "email LIKE '%@%'",
    check: (r) => r.email.includes('@'),
    corrupt: (r, ctx, rand) => ({
      ...r,
      email: r.email.replace('@', pick(['#', '.at.', '_'], rand)),
    }),
    why: (r) => `email '${r.email}' has no @`,
  },
  {
    id: 'amount',
    level: 2,
    label: 'amount >= 0',
    check: (r) => r.amount >= 0,
    corrupt: (r) => ({ ...r, amount: -r.amount }),
    why: (r) => `amount ${r.amount} is negative`,
  },
  {
    id: 'country',
    level: 3,
    column: 'country',
    label: `country IN (${COUNTRIES.map((c) => `'${c}'`).join(', ')})`,
    check: (r) => COUNTRIES.includes(r.country),
    corrupt: (r, ctx, rand) => ({ ...r, country: pick(['MARS', 'LUNA', 'XX', 'EU'], rand) }),
    why: (r) => `country '${r.country}' isn't allowed`,
  },
  {
    id: 'unique',
    level: 4,
    label: 'id is UNIQUE — check the ledger',
    check: (r, ctx) => r.id === null || !ctx.loaded.includes(r.id),
    corrupt: (r, ctx, rand) =>
      ctx.loaded.length ? { ...r, id: pick(ctx.loaded.slice(-DUP_WINDOW), rand) } : null,
    why: (r) => `id ${r.id} was already loaded`,
  },
  {
    id: 'late',
    level: 5,
    column: 'event_ts',
    label: `event_ts <= watermark`,
    check: (r) => r.event_ts <= WATERMARK,
    corrupt: (r, ctx, rand) => ({ ...r, event_ts: timestamp(rand, true) }),
    why: (r) => `event_ts ${r.event_ts} is past the watermark`,
  },
]

export const rulesFor = (level) => RULES.filter((r) => r.level <= level)
export const columnsFor = (level) => [
  'id',
  'email',
  'amount',
  ...RULES.filter((r) => r.column && r.level <= level).map((r) => r.column),
]

// Seconds a row takes to cross the belt, and between spawns.
export const beltSeconds = (level) => Math.max(3.2, 8.2 - level * 0.75)
// `spacing` is the share of the belt's travel one card occupies (measured by
// the page), so cards never overlap whatever the screen size.
export const spawnSeconds = (level, spacing = 1 / 2.8) => beltSeconds(level) * spacing

export const levelFor = (correct) => Math.min(MAX_LEVEL, 1 + Math.floor(correct / ROWS_PER_LEVEL))

// A new row for this level. ctx: { seq, loaded }. ~45% of rows are broken,
// each by exactly one active contract so the reason is always clear.
export function makeRow(level, ctx, rand = Math.random) {
  const seq = ctx.seq
  let row = {
    id: 1000 + seq,
    email: `${pick(NAMES, rand)}${Math.floor(rand() * 90) + 10}@${pick(DOMAINS, rand)}`,
    amount: money(rand),
  }
  if (level >= 3) row.country = pick(COUNTRIES, rand)
  if (level >= 5) row.event_ts = timestamp(rand, false)

  let broken = null
  if (rand() < 0.45) {
    const candidates = rulesFor(level).filter((r) => r.id !== 'unique' || ctx.loaded.length)
    const rule = pick(candidates, rand)
    const corrupted = rule.corrupt(row, ctx, rand)
    if (corrupted) {
      row = corrupted
      broken = rule.id
    }
  }
  return { key: seq, level, row, broken }
}

// Which active contracts a row violates right now (empty = clean).
export function violations(item, ctx) {
  return rulesFor(item.level).filter((r) => !r.check(item.row, ctx))
}

const SCORE_KEY = 'vj-schema-storm-best'

export function readBest() {
  try {
    return Number(localStorage.getItem(SCORE_KEY)) || 0
  } catch {
    return 0
  }
}

export function saveBest(score) {
  try {
    if (score > readBest()) localStorage.setItem(SCORE_KEY, String(score))
  } catch {
    /* best score lives for this visit only */
  }
}
