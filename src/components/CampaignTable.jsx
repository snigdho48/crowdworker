import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

export function CampaignTable({
  data,
  columns,
  pageSize = 10,
  showPagination = true,
  getRowId,
  renderFooter,
  footerClassName,
  manualPagination = false,
  pageCount = 1,
  pageIndex = 0,
  totalCount,
  onPageChange,
  rowLabel = 'rows',
}) {
  // TanStack Table returns non-memoizable functions; safe for our use (no compiler memoization needed).
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount,
          onPaginationChange: (updater) => {
            const next =
              typeof updater === 'function'
                ? updater({ pageIndex, pageSize })
                : updater
            onPageChange?.(next.pageIndex)
          },
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageSize } },
        }),
    state: manualPagination ? { pagination: { pageIndex, pageSize } } : undefined,
  })

  const displayCount = manualPagination ? data.length : table.getRowModel().rows.length
  const total = manualPagination ? (totalCount ?? 0) : data.length

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-[#f7f6ee]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort()
                  const sort = h.column.getIsSorted()
                  return (
                    <th
                      key={h.id}
                      colSpan={h.colSpan}
                      className="whitespace-nowrap border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={canSort ? 'inline-flex items-center gap-1 hover:text-gray-700' : ''}
                          onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sort === 'asc' ? '↑' : sort === 'desc' ? '↓' : null}
                        </button>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap border-b border-gray-200 px-3 py-2 align-middle text-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {renderFooter ? (
            <tfoot className={footerClassName}>
              {renderFooter({ table, flexRender })}
            </tfoot>
          ) : null}
        </table>
      </div>

      {showPagination ? (
        <div className="flex items-center justify-between px-3 py-3 text-sm">
          <div className="text-gray-600">
            Showing{' '}
            <span className="font-semibold text-gray-900">{displayCount}</span> of{' '}
            <span className="font-semibold text-gray-900">{total}</span> {rowLabel}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-[#f7f6ee] px-3 py-1 text-gray-800 disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: table.getPageCount() }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`h-8 w-8 rounded-full border text-sm ${
                    table.getState().pagination.pageIndex === idx
                      ? 'border-[#378ADD] bg-blue-50 text-[#378ADD]'
                      : 'border-gray-200 bg-[#f7f6ee] text-gray-800 hover:bg-black/5'
                  }`}
                  onClick={() => table.setPageIndex(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-[#f7f6ee] px-3 py-1 text-gray-800 disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
