import { useState } from 'react'
import ChapterHeading from './ChapterHeading.jsx'
import SkillLogo from './SkillLogo.jsx'
import SkillLineage from './SkillLineage.jsx'
import { SKILLS } from '../data/skills.js'
import { EDGES } from '../data/lineage.js'
import { PORTFOLIO_DATA } from '../data/portfolio.js'

const CATEGORIES = ['All', ...new Set(SKILLS.map((s) => s.category))]
const VIEWS = [
  { id: 'grid', label: '▦ Grid' },
  { id: 'lineage', label: '⇢ Lineage' },
]

const pill = (active) =>
  `rounded-full px-4 py-1.5 text-xs font-semibold transition hover:scale-105 ${
    active
      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30'
      : 'glass text-slate-600 dark:text-slate-300'
  }`

export default function Skills() {
  const [view, setView] = useState('grid')
  const [category, setCategory] = useState('All')
  // Tiles only animate in once the visitor has used the filter, so the first
  // scroll-reveal isn't doubled up.
  const [filtered, setFiltered] = useState(false)

  return (
    <section id="craft" className="relative mx-auto max-w-6xl scroll-mt-28 px-6 py-20">
      <ChapterHeading
        chapter="02"
        label="The Craft"
        title="Skills & Tools"
        subtitle="The instruments on the flight deck — and exactly where each one shipped."
      />

      <div className="reveal mb-8 flex flex-col items-center gap-4">
        <div role="tablist" aria-label="Skills view" className="glass flex rounded-full p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              onClick={() => setView(v.id)}
              className={`rounded-full px-4 py-1.5 font-mono text-xs font-semibold transition ${
                view === v.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view === 'grid' && (
          <div
            role="group"
            aria-label="Filter skills"
            className="flex flex-wrap justify-center gap-2"
          >
            {CATEGORIES.map((c) => {
              const count =
                c === 'All' ? SKILLS.length : SKILLS.filter((s) => s.category === c).length
              return (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c)
                    setFiltered(true)
                  }}
                  aria-pressed={category === c}
                  className={pill(category === c)}
                >
                  {c} <span className="opacity-60">{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* The grid stays mounted (hidden) in lineage view, so tiles keep their
          scroll-reveal state; filtered-out tiles are removed from layout so
          the matching ones close ranks instead of leaving holes.
          useReveal adds .is-visible to the tile imperatively, so the tile's
          own className must never change between renders — React would
          rewrite the attribute and drop it. Show/hide lives on a wrapper. */}
      <div
        className={`flex-wrap justify-center gap-4 ${view === 'grid' ? 'flex' : 'hidden'}`}
        data-filtered={filtered || undefined}
      >
        {SKILLS.map((skill) => {
          const shown = category === 'All' || skill.category === category
          const uses = EDGES.filter((e) => e.skill === skill.name).length
          return (
            <div
              key={skill.name}
              className={`w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(20%-0.8rem)] ${
                shown ? 'block' : 'hidden'
              }`}
            >
              <div className="reveal glass spotlight skill-tile group flex h-full flex-col items-center gap-3 rounded-3xl px-4 py-6 text-center card-lift">
                <div
                  className="skill-icon flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/40 transition group-hover:scale-110 dark:border-white/10 dark:bg-white/5"
                  style={{ '--glow': `${skill.hex}55` }}
                >
                  <SkillLogo skill={skill} />
                </div>
                <div>
                  <p className="text-sm leading-tight font-bold">{skill.name}</p>
                  <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
                    {skill.category}
                  </p>
                </div>
                <button
                  onClick={() => setView('lineage')}
                  className="font-mono text-[10px] text-slate-400 transition hover:text-purple-600 dark:text-slate-500 dark:hover:text-cyan-300"
                >
                  ⇢ shipped in {uses}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {view === 'lineage' && <SkillLineage />}

      <div className="reveal glass mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-3xl px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="chapter-label !text-[10px]">Also in the toolkit:</span>
        {['ETL/ELT Architecture', 'Data Modeling', 'Data Warehousing', 'Agentic AI Systems'].map(
          (t) => (
            <span key={t}>{t}</span>
          ),
        )}
        <span className="text-emerald-500 dark:text-emerald-400">
          ✓ {PORTFOLIO_DATA.profile.certification}
        </span>
      </div>
    </section>
  )
}
