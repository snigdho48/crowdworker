export function Topbar({ title, right }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
      <div className="text-sm font-semibold text-slate-900 md:text-base">{title}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  )
}

