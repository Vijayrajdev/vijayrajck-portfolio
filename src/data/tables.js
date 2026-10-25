import { PORTFOLIO_DATA } from './portfolio.js'
import { SKILLS } from './skills.js'
import { CONSUMERS } from './lineage.js'

// The portfolio exposed as queryable tables for the Query Console and the
// terminal's `sql` command. Derived from PORTFOLIO_DATA — never edit by hand.
const table = (rows) => ({ columns: Object.keys(rows[0]), rows })

// Normalised skill names per project / role, from the lineage matcher.
const skillsOf = (id) => CONSUMERS.find((c) => c.id === id).skills.join(', ')

export const CAREER_TABLES = {
  projects: table(
    PORTFOLIO_DATA.projects
      .filter((p) => !p.placeholder)
      .map((p) => ({
        name: p.name,
        tagline: p.tagline,
        tech: p.tech.join(', '),
        skills: skillsOf(`project:${p.id}`),
        github: p.github ?? null,
        live: p.live ?? null,
      })),
  ),
  skills: table(SKILLS.map((s) => ({ name: s.name, category: s.category }))),
  experience: table(
    PORTFOLIO_DATA.experience.map((e) => ({
      title: e.title,
      company: e.company,
      period: e.period,
      start_year: Number(/\d{4}/.exec(e.period)?.[0]),
      badge: e.badge,
      skills: skillsOf(`role:${e.title}:${e.period}`),
    })),
  ),
  awards: table(
    PORTFOLIO_DATA.awards.map((a) => ({ name: a.name, issuer: a.issuer, year: Number(a.year) })),
  ),
}

export const PRESET_QUERIES = [
  {
    label: 'Projects using dbt',
    sql: "SELECT name, tagline\nFROM projects\nWHERE tech LIKE '%dbt%';",
  },
  {
    label: 'Skills by category',
    sql: 'SELECT category, COUNT(*) AS skills\nFROM skills\nGROUP BY category\nORDER BY skills DESC;',
  },
  {
    label: 'Career timeline',
    sql: 'SELECT title, company, period\nFROM experience\nORDER BY start_year;',
  },
  {
    label: 'Recent awards',
    sql: 'SELECT name, issuer, year\nFROM awards\nWHERE year >= 2025\nORDER BY name;',
  },
  {
    label: 'Live demos',
    sql: 'SELECT name, live\nFROM projects\nWHERE live IS NOT NULL;',
  },
  { label: 'Show tables', sql: 'SHOW TABLES;' },
]
