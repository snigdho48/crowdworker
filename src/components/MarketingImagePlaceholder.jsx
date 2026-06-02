export function MarketingImagePlaceholder({ label = 'Image', className = '' }) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-3xl border border-white/10 bg-white/5',
        className,
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#1a73e8]/25 blur-3xl" />
        <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-[#34a853]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-[#fbbc04]/20 blur-3xl" />
      </div>
      <div className="relative grid h-full w-full place-items-center p-10 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
        {label}
      </div>
    </div>
  )
}

