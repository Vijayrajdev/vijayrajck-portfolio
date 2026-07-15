import ChapterHeading from './ChapterHeading.jsx'
import { PORTFOLIO_DATA } from '../data/portfolio.js'

export default function Experience() {
  return (
    <section id="flight-log" className="relative mx-auto max-w-4xl scroll-mt-28 px-6 py-20">
      <ChapterHeading
        chapter="04"
        label="Flight Log"
        title="Experience"
        subtitle="From full-stack origins to a Senior Data Engineer promotion — the mission record."
      />

      <div className="timeline-spine relative flex flex-col gap-8 pl-10">
        {PORTFOLIO_DATA.experience.map((job) => (
          <article key={job.period} className="reveal relative">
            <span className="absolute top-7 -left-10 h-4 w-4 rounded-full border-2 border-cyan-300 bg-indigo-500 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            <div className="glass-deep rounded-3xl p-7 card-lift">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="text-lg font-bold">{job.title}</h3>
                {job.badge && (
                  <span className="font-display rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-[9px] font-extrabold tracking-[0.2em] text-white uppercase">
                    {job.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-cyan-300">
                {job.company} · {job.location}
              </p>
              <p className="font-display mt-0.5 text-[11px] font-medium tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {job.period}
              </p>
              <ul className="mt-4 space-y-2">
                {job.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
