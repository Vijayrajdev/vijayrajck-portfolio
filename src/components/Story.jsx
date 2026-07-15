import ChapterHeading from './ChapterHeading.jsx'
import { PORTFOLIO_DATA } from '../data/portfolio.js'

const ACCENTS = ['#22d3ee', '#a78bfa', '#f472b6']

export default function Story() {
  return (
    <section id="origin" className="relative mx-auto max-w-6xl scroll-mt-28 px-6 py-20">
      <ChapterHeading
        chapter="01"
        label="Origin"
        title="Design → Develop → Automate"
        subtitle="Three years, one trajectory: from crafting interfaces to building data platforms that build themselves."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {PORTFOLIO_DATA.story.map((beat, i) => (
          <article
            key={beat.id}
            className="reveal glass-deep relative overflow-hidden rounded-3xl p-7 card-lift"
          >
            <span
              className="font-display absolute -top-3 -right-1 text-7xl font-black opacity-10"
              style={{ color: ACCENTS[i] }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p
              className="font-display text-xs font-bold tracking-[0.3em] uppercase"
              style={{ color: ACCENTS[i] }}
            >
              {beat.label}
            </p>
            <h3 className="mt-3 text-lg font-bold">{beat.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {beat.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
