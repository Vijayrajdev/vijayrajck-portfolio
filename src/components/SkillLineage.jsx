import { useLayoutEffect, useRef, useState } from 'react'
import SkillLogo from './SkillLogo.jsx'
import { SKILLS } from '../data/skills.js'
import { CONSUMERS, EDGES } from '../data/lineage.js'
import { unlock } from '../utils/achievements.js'

const SKILL_BY_NAME = Object.fromEntries(SKILLS.map((s) => [s.name, s]))
const CONSUMER_BY_ID = Object.fromEntries(CONSUMERS.map((c) => [c.id, c]))
const usageCount = (name) => EDGES.filter((e) => e.skill === name).length

const listOf = (names) =>
  names.length > 3 ? `${names.slice(0, 3).join(', ')} +${names.length - 3}` : names.join(', ')

// A dbt-docs-style lineage graph: skills on the left feed the projects and
// roles they shipped in on the right. Nodes are DOM; edges are an SVG layer
// measured from the nodes, so the layout stays responsive.
export default function SkillLineage() {
  const wrap = useRef(null)
  const nodes = useRef(new Map())
  const [paths, setPaths] = useState([])
  const [hovered, setHovered] = useState(null)
  const [pinned, setPinned] = useState(null)
  const focus = hovered ?? pinned

  useLayoutEffect(() => {
    const el = wrap.current
    const measure = () => {
      const base = el.getBoundingClientRect()
      const next = []
      for (const edge of EDGES) {
        const a = nodes.current.get(`skill:${edge.skill}`)?.getBoundingClientRect()
        const b = nodes.current.get(edge.consumer)?.getBoundingClientRect()
        if (!a || !b) continue
        const x1 = a.right - base.left
        const y1 = a.top + a.height / 2 - base.top
        const x2 = b.left - base.left
        const y2 = b.top + b.height / 2 - base.top
        const dx = (x2 - x1) / 2
        next.push({ ...edge, d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}` })
      }
      setPaths(next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [])

  const activeSkills = new Set()
  const activeConsumers = new Set()
  if (focus?.type === 'skill') {
    activeSkills.add(focus.id)
    EDGES.forEach((e) => e.skill === focus.id && activeConsumers.add(e.consumer))
  } else if (focus?.type === 'consumer') {
    activeConsumers.add(focus.id)
    CONSUMER_BY_ID[focus.id].skills.forEach((s) => activeSkills.add(s))
  }
  const edgeActive = (e) =>
    focus && (focus.type === 'skill' ? e.skill === focus.id : e.consumer === focus.id)
  const state = (active) => (!focus ? '' : active ? 'is-lit' : 'opacity-35')

  const handlers = (target) => ({
    onMouseEnter: () => {
      setHovered(target)
      unlock('lineage')
    },
    onMouseLeave: () => setHovered(null),
    onFocus: () => setHovered(target),
    onBlur: () => setHovered(null),
    onClick: () => {
      unlock('lineage')
      setPinned((p) => (p?.id === target.id ? null : target))
    },
    'aria-pressed': pinned?.id === target.id,
  })

  let caption = 'Hover or tap a skill — or a project — to trace its lineage.'
  if (focus?.type === 'skill') {
    const names = [...activeConsumers].map((id) => CONSUMER_BY_ID[id].name)
    caption = `${focus.id} → shipped in ${names.length}: ${listOf(names)}`
  } else if (focus?.type === 'consumer') {
    caption = `${CONSUMER_BY_ID[focus.id].name} ← built with ${activeSkills.size}: ${listOf([...activeSkills])}`
  }

  const projects = CONSUMERS.filter((c) => c.kind === 'Project')
  const roles = CONSUMERS.filter((c) => c.kind === 'Role')

  const consumerNode = (c) => (
    <button
      key={c.id}
      ref={(el) => nodes.current.set(c.id, el)}
      {...handlers({ type: 'consumer', id: c.id })}
      className={`lineage-node glass w-full rounded-xl px-3 py-2 text-left transition ${state(activeConsumers.has(c.id))}`}
      style={{ '--node-accent': c.accent }}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold sm:text-sm" style={{ color: c.accent }}>
          {c.name}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-slate-500 dark:text-slate-400">
          {c.skills.length}
        </span>
      </span>
      <span className="mt-0.5 block truncate text-[10px] text-slate-500 dark:text-slate-400">
        {c.detail}
      </span>
    </button>
  )

  return (
    <div className="glass-deep rounded-3xl p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p
          className="font-mono text-[11px] text-slate-600 sm:text-xs dark:text-slate-300"
          aria-live="polite"
        >
          {caption}
        </p>
        <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
          {SKILLS.length} skills · {CONSUMERS.length} consumers · {EDGES.length} edges
        </p>
      </div>

      <div
        ref={wrap}
        className="relative grid grid-cols-[minmax(0,1fr)_minmax(1.75rem,0.5fr)_minmax(0,1fr)]"
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          {[...paths]
            .sort((a, b) => Number(Boolean(edgeActive(a))) - Number(Boolean(edgeActive(b))))
            .map((p) => {
              const lit = edgeActive(p)
              return (
                <path
                  key={`${p.skill}->${p.consumer}`}
                  d={p.d}
                  fill="none"
                  stroke={lit ? SKILL_BY_NAME[p.skill].hex : 'currentColor'}
                  strokeWidth={lit ? 2 : 1.1}
                  className={
                    lit
                      ? 'lineage-flow'
                      : `text-slate-400/40 transition-opacity dark:text-white/15 ${focus ? 'opacity-30' : ''}`
                  }
                />
              )
            })}
        </svg>

        <div className="relative flex flex-col gap-1.5">
          <p className="chapter-label mb-1 !text-[9px]">Skills</p>
          {SKILLS.map((s) => (
            <button
              key={s.name}
              ref={(el) => nodes.current.set(`skill:${s.name}`, el)}
              {...handlers({ type: 'skill', id: s.name })}
              className={`lineage-node glass flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition sm:px-3 ${state(activeSkills.has(s.name))}`}
              style={{ '--node-accent': s.hex }}
            >
              <SkillLogo skill={s} className="h-4 w-4" glyphClass="text-[8px]" />
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold sm:text-xs">
                {s.name}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                {usageCount(s.name)}
              </span>
            </button>
          ))}
        </div>

        <div />

        <div className="relative flex flex-col justify-center gap-6">
          <div className="flex flex-col gap-2">
            <p className="chapter-label mb-1 !text-[9px]">Projects</p>
            {projects.map(consumerNode)}
          </div>
          <div className="flex flex-col gap-2">
            <p className="chapter-label mb-1 !text-[9px]">Roles</p>
            {roles.map(consumerNode)}
          </div>
        </div>
      </div>
    </div>
  )
}
