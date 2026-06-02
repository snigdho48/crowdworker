const statusMap = {
  live: { label: 'Live', dot: 'bg-green-500' },
  ended: { label: 'Ended', dot: 'bg-gray-400' },
  paused: { label: 'Paused', dot: 'bg-amber-500' },
}

export function StatusDot({ status }) {
  const s = statusMap[status] ?? { label: status, dot: 'bg-gray-400' }
  return (
    <span className="inline-flex items-center gap-2 text-sm text-gray-700">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      <span>{s.label}</span>
    </span>
  )
}

