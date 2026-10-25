// A tiny, dependency-free SQL engine for the Query Console and terminal.
// Supports the subset a visitor would reasonably try:
//   SELECT [DISTINCT] cols | * | COUNT(*) [AS alias] FROM table
//   [WHERE cond] [GROUP BY col] [ORDER BY col [ASC|DESC]] [LIMIT n]
//   SHOW TABLES · DESCRIBE table
// where cond combines =, !=, <>, <, >, <=, >=, [NOT] LIKE, [NOT] IN (...),
// IS [NOT] NULL with AND / OR / NOT and parentheses.

export class SqlError extends Error {}

const KEYWORDS = new Set([
  'SELECT',
  'DISTINCT',
  'FROM',
  'WHERE',
  'AND',
  'OR',
  'NOT',
  'LIKE',
  'IN',
  'IS',
  'NULL',
  'GROUP',
  'BY',
  'ORDER',
  'ASC',
  'DESC',
  'LIMIT',
  'AS',
  'COUNT',
  'SHOW',
  'TABLES',
  'DESCRIBE',
])

export const SQL_KEYWORDS = KEYWORDS

function tokenize(sql) {
  const tokens = []
  let i = 0
  while (i < sql.length) {
    const c = sql[i]
    if (/\s/.test(c)) {
      i++
      continue
    }
    if (c === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i++
      continue
    }
    if (c === "'") {
      let j = i + 1
      let s = ''
      for (;;) {
        if (j >= sql.length)
          throw new SqlError('Unterminated string — close it with a single quote.')
        if (sql[j] === "'") {
          if (sql[j + 1] === "'") {
            s += "'"
            j += 2
            continue
          }
          break
        }
        s += sql[j++]
      }
      tokens.push({ type: 'string', value: s })
      i = j + 1
      continue
    }
    if (/[0-9]/.test(c)) {
      const m = /^\d+(\.\d+)?/.exec(sql.slice(i))
      tokens.push({ type: 'number', value: Number(m[0]) })
      i += m[0].length
      continue
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(sql.slice(i))
      const upper = m[0].toUpperCase()
      tokens.push(
        KEYWORDS.has(upper)
          ? { type: 'kw', value: upper }
          : { type: 'ident', value: m[0].toLowerCase() },
      )
      i += m[0].length
      continue
    }
    const two = sql.slice(i, i + 2)
    if (['<=', '>=', '!=', '<>'].includes(two)) {
      tokens.push({ type: 'op', value: two === '<>' ? '!=' : two })
      i += 2
      continue
    }
    if ('=<>'.includes(c)) {
      tokens.push({ type: 'op', value: c })
      i++
      continue
    }
    if ('(),*;'.includes(c)) {
      tokens.push({ type: 'punct', value: c })
      i++
      continue
    }
    throw new SqlError(`Unexpected character "${c}".`)
  }
  return tokens
}

function parse(tokens) {
  let pos = 0
  const peek = () => tokens[pos]
  const near = () => {
    const t = peek()
    if (!t) return ' at the end of the query'
    return ` near "${t.type === 'string' ? `'${t.value}'` : t.value}"`
  }
  const isKw = (kw) => peek()?.type === 'kw' && peek().value === kw
  const acceptKw = (kw) => (isKw(kw) ? (pos++, true) : false)
  const expectKw = (kw) => {
    if (!acceptKw(kw)) throw new SqlError(`Expected ${kw}${near()}.`)
  }
  const acceptPunct = (p) =>
    peek()?.type === 'punct' && peek().value === p ? (pos++, true) : false
  const expectPunct = (p) => {
    if (!acceptPunct(p)) throw new SqlError(`Expected "${p}"${near()}.`)
  }
  const ident = (what = 'a column name') => {
    const t = peek()
    if (t?.type !== 'ident') throw new SqlError(`Expected ${what}${near()}.`)
    pos++
    return t.value
  }
  const literal = () => {
    const t = peek()
    if (t?.type === 'string' || t?.type === 'number') {
      pos++
      return t.value
    }
    if (t?.type === 'ident') {
      throw new SqlError(
        `Expected a value${near()} — wrap text in single quotes, e.g. '${t.value}'.`,
      )
    }
    throw new SqlError(`Expected a value${near()}.`)
  }
  const end = () => {
    acceptPunct(';')
    if (peek()) throw new SqlError(`Unexpected input${near()}.`)
  }
  // COUNT is a keyword, so "ORDER BY count" needs its own path.
  const columnRef = () => {
    if (acceptKw('COUNT')) {
      if (acceptPunct('(')) {
        expectPunct('*')
        expectPunct(')')
      }
      return 'count'
    }
    return ident()
  }

  if (/^(drop|delete|insert|update|alter|truncate|create|merge)$/.test(peek()?.value)) {
    throw new SqlError('This warehouse is read-only — try SELECT, SHOW TABLES or DESCRIBE <table>.')
  }
  if (acceptKw('SHOW')) {
    expectKw('TABLES')
    end()
    return { type: 'show' }
  }
  if (acceptKw('DESCRIBE')) {
    const table = ident('a table name')
    end()
    return { type: 'describe', table }
  }

  expectKw('SELECT')
  const distinct = acceptKw('DISTINCT')
  const alias = () => (acceptKw('AS') ? ident('an alias') : null)
  const columns = []
  do {
    if (acceptPunct('*')) columns.push({ type: 'star' })
    else if (acceptKw('COUNT')) {
      expectPunct('(')
      expectPunct('*')
      expectPunct(')')
      columns.push({ type: 'count', alias: alias() ?? 'count' })
    } else {
      const name = ident()
      columns.push({ type: 'col', name, alias: alias() ?? name })
    }
  } while (acceptPunct(','))

  expectKw('FROM')
  const table = ident('a table name')

  const parseCmp = () => {
    const col = ident()
    if (acceptKw('IS')) {
      const neg = acceptKw('NOT')
      expectKw('NULL')
      return { op: 'isnull', col, neg }
    }
    const neg = acceptKw('NOT')
    if (acceptKw('LIKE')) return { op: 'like', col, value: literal(), neg }
    if (acceptKw('IN')) {
      expectPunct('(')
      const values = [literal()]
      while (acceptPunct(',')) values.push(literal())
      expectPunct(')')
      return { op: 'in', col, values, neg }
    }
    if (neg) throw new SqlError(`Expected LIKE or IN after NOT${near()}.`)
    const t = peek()
    if (t?.type !== 'op') throw new SqlError(`Expected a comparison (=, <, LIKE, IN…)${near()}.`)
    pos++
    return { op: 'cmp', cmp: t.value, col, value: literal() }
  }
  const parseNot = () => {
    if (acceptKw('NOT')) return { op: 'not', expr: parseNot() }
    if (acceptPunct('(')) {
      const e = parseOr()
      expectPunct(')')
      return e
    }
    return parseCmp()
  }
  const parseAnd = () => {
    let left = parseNot()
    while (acceptKw('AND')) left = { op: 'and', left, right: parseNot() }
    return left
  }
  const parseOr = () => {
    let left = parseAnd()
    while (acceptKw('OR')) left = { op: 'or', left, right: parseAnd() }
    return left
  }

  const where = acceptKw('WHERE') ? parseOr() : null
  let groupBy = null
  if (acceptKw('GROUP')) {
    expectKw('BY')
    groupBy = ident()
  }
  let orderBy = null
  if (acceptKw('ORDER')) {
    expectKw('BY')
    const col = columnRef()
    const dir = acceptKw('DESC') ? 'desc' : (acceptKw('ASC'), 'asc')
    orderBy = { col, dir }
  }
  let limit = null
  if (acceptKw('LIMIT')) {
    const t = peek()
    if (t?.type !== 'number') throw new SqlError(`LIMIT needs a number${near()}.`)
    pos++
    limit = t.value
  }
  end()
  return { type: 'select', distinct, columns, table, where, groupBy, orderBy, limit }
}

const isBlank = (v) => v === null || v === undefined || v === ''

function compare(a, b) {
  if (isBlank(a) && isBlank(b)) return 0
  if (isBlank(a)) return 1
  if (isBlank(b)) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

function likeToRegex(pattern) {
  const escaped = String(pattern).replace(/[.+?^${}()|[\]\\*]/g, '\\$&')
  return new RegExp(`^${escaped.replace(/%/g, '.*').replace(/_/g, '.')}$`, 'is')
}

function evaluate(cond, row) {
  switch (cond.op) {
    case 'and':
      return evaluate(cond.left, row) && evaluate(cond.right, row)
    case 'or':
      return evaluate(cond.left, row) || evaluate(cond.right, row)
    case 'not':
      return !evaluate(cond.expr, row)
    case 'isnull':
      return isBlank(row[cond.col]) !== cond.neg
    case 'like':
      return (
        !isBlank(row[cond.col]) && likeToRegex(cond.value).test(String(row[cond.col])) !== cond.neg
      )
    case 'in':
      return cond.values.some((v) => compare(row[cond.col], v) === 0) !== cond.neg
    case 'cmp': {
      const v = row[cond.col]
      if (isBlank(v)) return false
      const c = compare(v, cond.value)
      return { '=': c === 0, '!=': c !== 0, '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0 }[
        cond.cmp
      ]
    }
    default:
      return false
  }
}

function condColumns(cond, out = []) {
  if (!cond) return out
  if (cond.col) out.push(cond.col)
  if (cond.left) condColumns(cond.left, out)
  if (cond.right) condColumns(cond.right, out)
  if (cond.expr) condColumns(cond.expr, out)
  return out
}

const sqlType = (value) => (typeof value === 'number' ? 'INT64' : 'STRING')

export function runQuery(sql, tables) {
  const started = performance.now()
  const ast = parse(tokenize(sql))
  const done = (columns, rows) => ({ columns, rows, ms: performance.now() - started })

  if (ast.type === 'show') {
    return done(
      ['table_name', 'columns', 'rows'],
      Object.entries(tables).map(([name, t]) => [name, t.columns.length, t.rows.length]),
    )
  }

  const table = tables[ast.table]
  if (!table) {
    throw new SqlError(
      `Table "${ast.table}" not found. Available: ${Object.keys(tables).join(', ')}.`,
    )
  }

  if (ast.type === 'describe') {
    return done(
      ['column_name', 'data_type'],
      table.columns.map((c) => [c, sqlType(table.rows.find((r) => !isBlank(r[c]))?.[c])]),
    )
  }

  const checkCol = (col) => {
    if (!table.columns.includes(col)) {
      throw new SqlError(
        `Unknown column "${col}" in ${ast.table}. Available: ${table.columns.join(', ')}.`,
      )
    }
  }
  condColumns(ast.where).forEach(checkCol)
  ast.columns.forEach((c) => c.type === 'col' && checkCol(c.name))
  if (ast.groupBy) checkCol(ast.groupBy)

  let source = ast.where ? table.rows.filter((r) => evaluate(ast.where, r)) : [...table.rows]
  const grouped = ast.groupBy !== null || ast.columns.some((c) => c.type === 'count')

  const outNames = ast.columns.flatMap((c) => (c.type === 'star' ? table.columns : [c.alias]))
  const sortIndex = ast.orderBy ? outNames.indexOf(ast.orderBy.col) : -1
  const direction = ast.orderBy?.dir === 'desc' ? -1 : 1

  // ORDER BY a column that isn't selected: sort the source rows first.
  if (ast.orderBy && sortIndex === -1) {
    if (grouped)
      throw new SqlError(`ORDER BY "${ast.orderBy.col}" must be a selected column when grouping.`)
    checkCol(ast.orderBy.col)
    source.sort((a, b) => direction * compare(a[ast.orderBy.col], b[ast.orderBy.col]))
  }

  let rows
  if (grouped) {
    if (ast.columns.some((c) => c.type === 'star')) {
      throw new SqlError('SELECT * cannot be combined with COUNT(*) or GROUP BY.')
    }
    ast.columns.forEach((c) => {
      if (c.type === 'col' && c.name !== ast.groupBy) {
        throw new SqlError(`Column "${c.name}" must appear in GROUP BY.`)
      }
    })
    const groups = new Map()
    if (ast.groupBy) {
      source.forEach((r) => {
        const key = String(r[ast.groupBy] ?? '').toLowerCase()
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key).push(r)
      })
    } else {
      groups.set('', source)
    }
    rows = [...groups.values()].map((members) =>
      ast.columns.map((c) => (c.type === 'count' ? members.length : members[0]?.[c.name])),
    )
  } else {
    rows = source.map((r) =>
      ast.columns.flatMap((c) =>
        c.type === 'star' ? table.columns.map((k) => r[k]) : [r[c.name]],
      ),
    )
  }

  if (ast.distinct) {
    const seen = new Set()
    rows = rows.filter((r) => {
      const key = JSON.stringify(r)
      return seen.has(key) ? false : (seen.add(key), true)
    })
  }
  if (sortIndex !== -1) rows.sort((a, b) => direction * compare(a[sortIndex], b[sortIndex]))
  if (ast.limit !== null) rows = rows.slice(0, ast.limit)

  return done(outNames, rows)
}

// Splits a query into coloured spans for the editor overlay.
export function highlightSql(sql) {
  const parts = []
  const re =
    /(--[^\n]*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_']+|.)/gs
  let m
  while ((m = re.exec(sql))) {
    if (m[1]) parts.push({ kind: 'comment', text: m[1] })
    else if (m[2]) parts.push({ kind: 'string', text: m[2] })
    else if (m[3]) parts.push({ kind: 'number', text: m[3] })
    else if (m[4])
      parts.push({ kind: KEYWORDS.has(m[4].toUpperCase()) ? 'keyword' : 'ident', text: m[4] })
    else parts.push({ kind: 'plain', text: m[0] })
  }
  return parts
}
