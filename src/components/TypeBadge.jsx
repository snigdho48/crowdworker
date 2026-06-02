const colors = {
  DSP: 'bg-blue-100 text-blue-800',
  YouTube: 'bg-red-100 text-red-800',
  Floating: 'bg-green-100 text-green-800',
  Takeover: 'bg-amber-100 text-amber-800',
  'Image Takeover': 'bg-amber-100 text-amber-800',
}

export function TypeBadge({ type }) {
  const cls = colors[type] ?? 'bg-gray-100 text-gray-800'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {type}
    </span>
  )
}

