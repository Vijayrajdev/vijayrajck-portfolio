import { PORTFOLIO_DATA } from './portfolio.js'
import { SKILLS } from './skills.js'

// Skill lineage: which projects and roles each skill actually shipped in.
// Derived by matching every skill's aliases (whole words) against the text of
// each project and role — so it updates itself when portfolio.js changes.

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const matcher = (aliases) =>
  new RegExp(`(^|[^a-z0-9])(${aliases.map(escape).join('|')})s?(?![a-z0-9])`, 'i')

export const SKILL_MATCHERS = SKILLS.map((s) => ({ skill: s, re: matcher(s.aliases) }))

// Skill names mentioned in a block of text, in SKILLS order.
export const skillsIn = (text) =>
  SKILL_MATCHERS.filter(({ re }) => re.test(text)).map(({ skill }) => skill.name)

export const CONSUMERS = [
  ...PORTFOLIO_DATA.projects
    .filter((p) => !p.placeholder)
    .map((p) => ({
      id: `project:${p.id}`,
      kind: 'Project',
      name: p.name,
      detail: p.tagline,
      accent: p.accent,
      skills: skillsIn([p.name, p.tagline, p.description, ...p.tech].join(' \n ')),
    })),
  ...PORTFOLIO_DATA.experience.map((e) => ({
    id: `role:${e.title}:${e.period}`,
    kind: 'Role',
    name: e.title,
    detail: `${e.company} · ${e.period}`,
    accent: '#22d3ee',
    skills: skillsIn([e.title, ...e.highlights].join(' \n ')),
  })),
]

// [{ skill, consumer }] — one edge per usage.
export const EDGES = CONSUMERS.flatMap((c) => c.skills.map((skill) => ({ skill, consumer: c.id })))
