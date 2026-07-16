import ChapterHeading from './ChapterHeading.jsx'
import { PORTFOLIO_DATA } from '../data/portfolio.js'

// One distinct mark per award: supernova burst, rockstar bolt, debut rocket,
// and a graduation cap.
const AWARD_ICON_PATHS = {
  supernova:
    'M12 0l1.9 7.1L21 4.5l-4.4 5.9 7.4 1.6-7.4 1.6L21 19.5l-7.1-2.6L12 24l-1.9-7.1L3 19.5l4.4-5.9L0 12l7.4-1.6L3 4.5l7.1 2.6L12 0z',
  bolt: 'M13.5 1.5L4 13.5h6L9.5 22.5 20 10.5h-6l-.5-9z',
  rocket:
    'M12 1.5c3.6 2.2 5.2 6.3 4.6 10.6l2.6 3.2-3.7.5c-.6 1.7-1.7 3.3-3.5 4.7-1.8-1.4-2.9-3-3.5-4.7l-3.7-.5 2.6-3.2C6.8 7.8 8.4 3.7 12 1.5zm0 6.6a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8z',
  gradcap:
    'M12 2.5L.8 8.5 12 14.5l8.2-4.4v6.1h2V8.5L12 2.5zM4.8 12.9v3.6c0 1.9 3.2 3.4 7.2 3.4s7.2-1.5 7.2-3.4v-3.6L12 16.8l-7.2-3.9z',
}

function AwardIcon({ icon, accent }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill={accent} aria-hidden="true">
      <path d={AWARD_ICON_PATHS[icon] ?? AWARD_ICON_PATHS.supernova} />
    </svg>
  )
}

function YearPill({ award, className = '' }) {
  return (
    <span
      className={`font-display rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] whitespace-nowrap ${className}`}
      style={{ color: award.accent, border: `1px solid ${award.accent}66` }}
    >
      {award.year}
    </span>
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
            className="reveal glass-deep card-lift flex items-start gap-4 rounded-3xl p-5 sm:items-center sm:gap-5 sm:p-6"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/40 sm:h-14 sm:w-14 dark:border-white/10 dark:bg-white/5"
              style={{ boxShadow: `0 0 22px ${award.accent}44` }}
            >
              <AwardIcon icon={award.icon} accent={award.accent} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm leading-snug font-bold tracking-wide">
                {award.name}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {award.issuer}
              </p>
              {/* On phones the year moves below the text so nothing gets squeezed. */}
              <YearPill award={award} className="mt-2.5 inline-block sm:hidden" />
            </div>
            <YearPill award={award} className="hidden shrink-0 sm:inline-block" />
          </article>
        ))}
      </div>
    </section>
  )
}
