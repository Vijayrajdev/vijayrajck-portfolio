// Query results as a compact data grid — shared by the Query Console and the
// terminal's `sql` command.
function Cell({ value }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-400 italic dark:text-slate-500">NULL</span>
  }
  if (typeof value === 'number') {
    return <span className="text-amber-600 tabular-nums dark:text-amber-300">{value}</span>
  }
  if (typeof value === 'string' && value.startsWith('https://')) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-indigo-600 underline-offset-4 hover:underline dark:text-cyan-300"
      >
        {value.replace(/^https:\/\/(www\.)?/, '')}
      </a>
    )
  }
  return value
}

export default function ResultTable({ result, compact = false }) {
  const pad = compact ? 'px-2.5 py-1.5' : 'px-4 py-2.5'
  if (result.rows.length === 0) {
    return (
      <p className={`${pad} text-xs text-slate-500 dark:text-slate-400`}>Query returned no rows.</p>
    )
  }
  return (
    <table
      className={`w-full border-collapse text-left font-mono ${compact ? 'text-[11px]' : 'text-xs'}`}
    >
      <thead>
        <tr>
          {result.columns.map((c, i) => (
            <th
              key={`${c}-${i}`}
              className={`${pad} sticky top-0 border-b border-slate-300/60 bg-white/70 font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase backdrop-blur dark:border-white/10 dark:bg-[#120d2b]/80 dark:text-slate-400`}
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {result.rows.map((row, r) => (
          <tr key={r} className="transition hover:bg-purple-500/5 dark:hover:bg-white/5">
            {row.map((value, i) => (
              <td
                key={i}
                className={`${pad} border-b border-slate-200/50 align-top text-slate-700 dark:border-white/5 dark:text-slate-200`}
              >
                <Cell value={value} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
