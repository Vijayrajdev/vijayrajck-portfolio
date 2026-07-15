// Futuristic section eyebrow + title: "// CHAPTER 02 — THE CRAFT"
export default function ChapterHeading({ chapter, label, title, subtitle }) {
  return (
    <div className="reveal mb-12 text-center">
      <p className="chapter-label">
        {'// CHAPTER '}
        {chapter} — {label}
      </p>
      <h2 className="font-display glow-title mt-3 text-3xl font-bold tracking-wide uppercase sm:text-4xl">
        <span className="text-aurora">{title}</span>
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}
