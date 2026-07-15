import ChapterHeading from './ChapterHeading.jsx'
import { PORTFOLIO_DATA } from '../data/portfolio.js'

function MedalIcon({ accent }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <path
        d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z"
        fill={accent}
        stroke={accent}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M9 15.5 7.5 22l4.5-2.4L16.5 22 15 15.5" stroke={accent} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default function Awards() {
  return (
    <section id="awards" className="relative mx-auto max-w-5xl scroll-mt-28 px-6 py-20">
      <ChapterHeading
        chapter="05"
        label="Commendations"
        title="Awards & Honors"
        subtitle="Medals collected along the flight path."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {PORTFOLIO_DATA.awards.map((award) => (
          <article
            key={award.name}
            className="reveal glass-deep card-lift flex items-center gap-5 rounded-3xl p-6"
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/40 dark:border-white/10 dark:bg-white/5"
              style={{ boxShadow: `0 0 22px ${award.accent}44` }}
            >
              <MedalIcon accent={award.accent} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm leading-snug font-bold tracking-wide">
                {award.name}
              </h3>
              <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {award.issuer}
              </p>
            </div>
            <span
              className="font-display shrink-0 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em]"
              style={{ color: award.accent, border: `1px solid ${award.accent}66` }}
            >
              {award.year}
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}
