import PipelineScene from './three/PipelineScene.jsx'
import { PORTFOLIO_DATA } from '../data/portfolio.js'
import { useTypewriter } from '../hooks/useTypewriter.js'
import { useCountUp } from '../hooks/useCountUp.js'
import { WEBGL_AVAILABLE } from '../utils/capabilities.js'

const STATS = [
  ...PORTFOLIO_DATA.profile.stats,
  {
    value: PORTFOLIO_DATA.projects.filter((p) => !p.placeholder).length,
    suffix: '',
    label: 'Projects',
  },
  { value: PORTFOLIO_DATA.awards.length, suffix: '', label: 'Awards' },
]

function Stat({ value, suffix, label }) {
  const [ref, current] = useCountUp(value)
  return (
    <div ref={ref} className="spotlight glass rounded-2xl px-4 py-3">
      <p className="font-display text-aurora text-2xl font-black tabular-nums">
        {current}
        {suffix}
      </p>
      <p className="mt-0.5 text-[10px] leading-tight font-semibold tracking-[0.15em] text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
    </div>
  )
}

export default function Hero({ theme }) {
  const { profile } = PORTFOLIO_DATA
  const typed = useTypewriter(profile.roles)

  return (
    <section
      id="top"
      className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 pt-28 pb-16 lg:grid-cols-2"
    >
      <div className="reveal">
        <p className="chapter-label mb-6">// INCOMING TRANSMISSION — {profile.location}</p>

        {/* Identity row: the photo stays quiet — a small avatar, not a centerpiece. */}
        <div className="mb-8 flex items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-20 w-20 rounded-3xl object-cover opacity-95 saturate-[0.9] ring-1 ring-white/40 dark:ring-white/20"
          />
          <div>
            {/* The name is the most important SEO signal on the page, so it
                lives in the real <h1> — visually identical to before, just
                semantically correct for search engines. */}
            <h1 className="font-display text-sm font-bold tracking-[0.15em] uppercase">
              {profile.name}
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {profile.role} · {profile.certification}
            </p>
          </div>
        </div>

        <h2 className="font-display glow-title text-3xl leading-snug font-black tracking-wider uppercase sm:text-4xl xl:text-[2.6rem]">
          <span className="text-aurora">Data platforms</span>
          <br />
          <span className="text-slate-800 dark:text-slate-100">that build themselves.</span>
        </h2>

        <p className="caret font-display mt-5 min-h-6 text-sm font-medium tracking-[0.2em] text-slate-600 uppercase dark:text-slate-300">
          {typed}
        </p>

        <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Event-driven ETL/ELT on GCP — BigQuery, Terraform, dbt, Airflow, and Python — with
          autonomous AI architectures that detect, decide, and deploy.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={profile.resume}
            download="Vijay_Raj_CK_Senior_Data_Engineer_3YOE.pdf"
            className="font-display rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-xs font-bold tracking-[0.15em] text-white uppercase shadow-lg shadow-purple-500/30 transition hover:scale-105 hover:shadow-purple-500/50"
          >
            Download Resume
          </a>
          <a
            href="#contact"
            className="font-display glass rounded-2xl px-6 py-3 text-xs font-bold tracking-[0.15em] text-slate-700 uppercase transition hover:scale-105 dark:text-slate-200"
          >
            Open Channel
          </a>
        </div>

        <div className="mt-8 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* The visual anchor: a live 3D render of the pipelines I build. */}
      <div className="reveal">
        <div className="glass-deep overflow-hidden rounded-3xl">
          <div className="flex items-center gap-2 border-b border-white/20 px-5 py-3 dark:border-white/10">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="font-display ml-3 text-[10px] font-semibold tracking-[0.25em] text-slate-500 uppercase dark:text-slate-400">
              pipeline.render — gcp · live
            </span>
          </div>
          <div className="h-80 w-full sm:h-96">
            <PipelineScene theme={theme} />
          </div>
          <div className="border-t border-white/20 px-5 py-2.5 dark:border-white/10">
            <p className="font-display text-[9px] tracking-[0.3em] text-slate-500 uppercase dark:text-slate-400">
              {WEBGL_AVAILABLE ? '// event-driven etl · drag to orbit' : '// event-driven etl'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
