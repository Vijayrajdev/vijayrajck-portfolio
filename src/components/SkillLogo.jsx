// A skill's brand mark, or its glyph tile when simple-icons has no entry.
export default function SkillLogo({ skill, className = 'h-9 w-9', glyphClass = 'text-sm' }) {
  if (skill.glyph) {
    return (
      <span
        className={`font-display flex shrink-0 items-center justify-center font-black tracking-tight ${className} ${glyphClass}`}
        style={{ color: skill.hex }}
      >
        {skill.glyph}
      </span>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill={skill.hex}
      aria-hidden="true"
    >
      <path d={skill.path} />
    </svg>
  )
}
