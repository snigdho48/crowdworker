export function formatInt(n) {
  const v = Number(n || 0)
  return v.toLocaleString()
}

export function formatCompact(n) {
  const v = Number(n || 0)
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(v)
}

export function formatBDT(n) {
  const v = Number(n || 0)
  return `৳${v.toLocaleString()}`
}

export function formatPercent(n) {
  const v = Number(n || 0)
  return `${v.toFixed(2)}%`
}

export function formatRange(startDate, endDate) {
  return `${startDate} – ${endDate}`
}

export function clampDateRange({ start, end }) {
  if (!start || !end) return { start, end }
  if (start <= end) return { start, end }
  return { start: end, end: start }
}

