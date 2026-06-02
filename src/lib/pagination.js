/** DRF page-number shape: { count, next, previous, results } */
export function parsePaginatedResponse(data) {
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      next: null,
      previous: null,
      isPaginated: false,
    }
  }
  if (data && Array.isArray(data.results)) {
    return {
      results: data.results,
      count: Number(data.count ?? data.results.length),
      next: data.next ?? null,
      previous: data.previous ?? null,
      isPaginated: true,
    }
  }
  return {
    results: [],
    count: 0,
    next: null,
    previous: null,
    isPaginated: false,
  }
}

/** Metrics / dashboard table slice: { table_rows, table_count, table_next, table_previous } */
export function parseTablePagination(data) {
  const rows = Array.isArray(data?.table_rows) ? data.table_rows : []
  return {
    results: rows,
    count: Number(data?.table_count ?? rows.length),
    next: data?.table_next ?? null,
    previous: data?.table_previous ?? null,
  }
}

export function pageFromUrl(url) {
  if (!url) return null
  try {
    const p = new URL(url, window.location.origin).searchParams.get('page')
    return p ? Number(p) : null
  } catch {
    return null
  }
}

/** Fetch every page (for small option lists). */
export async function fetchAllPages(api, path, params = {}) {
  const merged = { page_size: 100, ...params }
  let page = 1
  const all = []
  let total = Infinity

  while (all.length < total) {
    const res = await api.get(path, { params: { ...merged, page } })
    const { results, count, next } = parsePaginatedResponse(res.data)
    all.push(...results)
    total = count
    if (!next || results.length === 0) break
    page += 1
  }

  return all
}
