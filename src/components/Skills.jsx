import ChapterHeading from './ChapterHeading.jsx'
import { SKILLS } from '../data/skills.js'
import { PORTFOLIO_DATA } from '../data/portfolio.js'

function SkillLogo({ skill }) {
  if (skill.glyph) {
    return (
      <span
        className="font-display flex h-9 w-9 items-center justify-center text-sm font-black tracking-tight"
        style={{ color: skill.hex }}
      >
        {skill.glyph}
      </span>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill={skill.hex} aria-hidden="true">
      <path d={skill.path} />
    </svg>
  )
}

export default function Skills() {
  return (
    <section id="craft" className="relative mx-auto max-w-6xl scroll-mt-28 px-6 py-20">
      <ChapterHeading
        chapter="02"
        label="The Craft"
        title="Skills & Tools"
        subtitle="The instruments on the flight deck — cloud, data, and code."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {SKILLS.map((skill) => (
          <div
            key={skill.name}
            className="reveal glass group flex flex-col items-center gap-3 rounded-3xl px-4 py-6 text-center card-lift"
            style={{ '--tw-shadow-color': skill.hex }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/40 transition group-hover:scale-110 dark:border-white/10 dark:bg-white/5"
              style={{ boxShadow: `0 0 0px transparent` }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 24px ${skill.hex}55`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 0px transparent')}
            >
              <SkillLogo skill={skill} />
            </div>
            <div>
              <p className="text-sm leading-tight font-bold">{skill.name}</p>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
                {skill.category}
              </p>
            </div>
          </div>
        ))}
      </div>

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
