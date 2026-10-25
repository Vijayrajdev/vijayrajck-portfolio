import ChapterHeading from './ChapterHeading.jsx'
import BrandIcon from './BrandIcon.jsx'
import { PORTFOLIO_DATA } from '../data/portfolio.js'
import { SOCIAL_ICONS } from '../data/socials.js'
import ProjectStage from './three/ProjectStage.jsx'
import { WEBGL_AVAILABLE } from '../utils/capabilities.js'

export default function Projects({ theme }) {
  return (
    <section id="missions" className="relative mx-auto max-w-6xl scroll-mt-28 px-6 py-20">
      <ChapterHeading
        chapter="03"
        label="Missions"
        title="Projects"
        subtitle={
          WEBGL_AVAILABLE
            ? 'Drag the 3D displays to rotate them — every mission ships with its own artifact.'
            : 'Every mission ships with its own artifact.'
        }
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {PORTFOLIO_DATA.projects.map((project) => (
          <article
            key={project.id}
            className={`reveal glass-deep flex flex-col overflow-hidden rounded-3xl card-lift ${
              project.placeholder ? 'border-dashed opacity-90' : ''
            }`}
          >
            <div className="h-52 w-full">
              <ProjectStage project={project} theme={theme} />
            </div>
            <div className="flex flex-1 flex-col p-6 pt-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold tracking-wide" style={{ color: project.accent }}>
                  {project.name}
                </h3>
                {project.placeholder ? (
                  <span className="font-display animate-pulse rounded-full border border-cyan-400/50 px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] text-cyan-500 uppercase dark:text-cyan-300">
                    Standby
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${project.name} live`}
                        className="glass flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-700 uppercase transition hover:scale-105 dark:text-slate-200"
                      >
                        Live <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${project.name} on GitHub`}
                        className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-700 uppercase transition hover:scale-105 dark:text-slate-200"
                      >
                        <BrandIcon icon={SOCIAL_ICONS.github} className="h-3.5 w-3.5" />
                        Source
                      </a>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {project.tagline}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {project.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="glass rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
