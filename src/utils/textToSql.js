// Rule-based text-to-SQL for the career tables. No model, no network: it reads
// the question for a table, filters and shape, then writes SQL that the
// mini engine runs — the SQL is shown, so visitors see the translation.
import { PORTFOLIO_DATA } from '../data/portfolio.js'
import { SKILL_MATCHERS } from '../data/lineage.js'
import { SqlError } from './miniSql.js'

// Nouns decide the table first ("which projects did he work on…" is about
// projects); verbs are the fallback.
const NOUNS = [
  ['awards', /\b(awards?|honou?rs?|medals?|commendations?)\b/],
  [
    'experience',
    /\b(roles?|jobs?|experience|positions?|compan(y|ies)|career|titles?|internships?)\b/,
  ],
  ['projects', /\b(projects?|missions?|repos?|apps?|demos?|products?)\b/],
  ['skills', /\b(skills?|tools?|stack|languages?|technolog\w*|tech)\b/],
]
const VERBS = [
  ['awards', /\b(won|wins?|recogni[sz]\w*)\b/],
  ['experience', /\b(worked|work|employ\w*|promot\w*|intern)\b/],
  ['projects', /\b(built|build|shipped|ships?)\b/],
  ['skills', /\b(knows?|good at|use[sd]?)\b/],
]

const COLUMNS = {
  projects: ['name', 'tagline', 'skills'],
  skills: ['name', 'category'],
  experience: ['title', 'company', 'period'],
  awards: ['name', 'issuer', 'year'],
}

const YEAR_COLUMN = { awards: 'year', experience: 'start_year' }

const quote = (s) => `'${String(s).replace(/'/g, "''")}'`

export const ASK_EXAMPLES = [
  'Which projects use Terraform?',
  'How many skills per category?',
  'Awards since 2025',
  'What is Pipewright built with?',
  'Where did he use BigQuery?',
  'What was his first role?',
]

export function textToSql(question) {
  const q = ` ${question.toLowerCase().replace(/[?!.]/g, ' ')} `
  const skills = SKILL_MATCHERS.filter(({ re }) => re.test(q)).map(({ skill }) => skill)
  const project = PORTFOLIO_DATA.projects.find(
    (p) => !p.placeholder && q.includes(p.name.toLowerCase().split(/[\s-]/)[0]),
  )

  let table = (NOUNS.find(([, re]) => re.test(q)) ?? VERBS.find(([, re]) => re.test(q)))?.[0]
  // "What is Pipewright built with?" → the project's own row.
  if (project && (!table || table === 'skills')) table = 'projects'
  // A bare skill ("bigquery?") → where it shipped.
  if (!table && skills.length) table = 'projects'
  // "Where did he use BigQuery" spans projects and roles; projects lead.
  if (
    table === 'skills' &&
    skills.length &&
    /\b(where|which|what) .*\b(use[ds]?|using|with)\b/.test(q)
  ) {
    table = /\b(role|job|work)/.test(q) ? 'experience' : 'projects'
  }
  if (!table) {
    throw new SqlError(
      `I couldn't map that to a table. Try: “${ASK_EXAMPLES[0]}” or “${ASK_EXAMPLES[2]}”.`,
    )
  }

  const where = []
  let columns = [...COLUMNS[table]]
  let orderBy = null
  let limit = null
  let groupBy = null

  // Skill filters (projects + roles carry a normalised `skills` column).
  if (skills.length && table !== 'awards') {
    const col = table === 'skills' ? 'name' : 'skills'
    const joiner = /\bor\b/.test(q) ? ' OR ' : ' AND '
    const parts = skills.map((s) => `${col} LIKE ${quote(`%${s.name}%`)}`)
    where.push(parts.length > 1 ? `(${parts.join(joiner)})` : parts[0])
  }

  if (table === 'projects') {
    if (project && !skills.length) {
      where.push(`name = ${quote(project.name)}`)
      columns = ['name', 'skills', 'tech']
    }
    if (/\b(live|demos?|deployed|try)\b/.test(q)) {
      where.push('live IS NOT NULL')
      columns = ['name', 'live']
    }
  }

  if (table === 'skills') {
    if (/\blanguages?\b/.test(q)) where.push(`category = 'Languages'`)
    else if (/\b(cloud|infra\w*)\b/.test(q)) where.push(`category = 'Cloud & Infra'`)
    else if (/\bdata (skills|tools)\b/.test(q)) where.push(`category = 'Data'`)
    if (/\b(by|per|each|every) categor/.test(q)) groupBy = 'category'
  }

  if (table === 'experience') {
    if (/\b(promot\w*)\b/.test(q)) where.push(`badge = 'Promoted'`)
    if (/\bintern\w*\b/.test(q)) where.push(`title LIKE '%Intern%'`)
    if (/\b(current|now|today|present)\b/.test(q)) where.push(`period LIKE '%Present%'`)
    if (skills.length) columns = ['title', 'company', 'skills']
  }

  // Company / issuer.
  const ORGS = {
    ingram: 'Ingram Micro',
    devtown: 'DevTown',
    jerusalem: 'College',
    college: 'College',
  }
  const org = /\b(ingram|devtown|jerusalem|college)\b/.exec(q)?.[1]
  if (org && (table === 'experience' || table === 'awards')) {
    const col = table === 'experience' ? 'company' : 'issuer'
    where.push(`${col} LIKE ${quote(`%${ORGS[org]}%`)}`)
  }

  // Years — the word right before the year sets the comparison.
  const yearMatch = /(?:\b(since|from|after|before|until|in)\s+)?\b((?:19|20)\d{2})\b/.exec(q)
  if (yearMatch && YEAR_COLUMN[table]) {
    const [, word, year] = yearMatch
    const op = { since: '>=', from: '>=', after: '>', before: '<', until: '<' }[word] ?? '='
    where.push(`${YEAR_COLUMN[table]} ${op} ${year}`)
  }

  // Ordering: latest / first.
  const yearCol = YEAR_COLUMN[table]
  if (yearCol && /\b(latest|newest|recent|last|most recent)\b/.test(q)) {
    orderBy = `${yearCol} DESC`
    if (/\b(latest|newest|most recent|last) (award|role|job|position)\b/.test(q)) limit = 1
  } else if (yearCol && /\b(first|earliest|oldest)\b/.test(q)) {
    orderBy = `${yearCol} ASC`
    limit = 1
  } else if (yearCol) {
    orderBy = `${yearCol} DESC`
  }

  // Shape: counting.
  if (/\b(how many|count|number of|total)\b/.test(q) || groupBy) {
    columns = groupBy ? [groupBy, `COUNT(*) AS ${table}`] : ['COUNT(*) AS total']
    orderBy = groupBy ? `${table} DESC` : null
    limit = null
  }

  const lines = [`SELECT ${columns.join(', ')}`, `FROM ${table}`]
  if (where.length) lines.push(`WHERE ${where.join('\n  AND ')}`)
  if (groupBy) lines.push(`GROUP BY ${groupBy}`)
  if (orderBy) lines.push(`ORDER BY ${orderBy}`)
  if (limit) lines.push(`LIMIT ${limit}`)
  return `${lines.join('\n')};`
}
