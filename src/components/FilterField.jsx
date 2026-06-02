const labelClass = 'text-xs font-semibold uppercase tracking-wide text-gray-500'

export const filterInputClass =
  'w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-900 shadow-sm placeholder:text-gray-400 md:text-sm'

export function FilterField({ label, htmlFor, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
      {children}
    </div>
  )
}

export const formInputClass =
  'w-full rounded-xl border border-gray-200 bg-[#f7f6ee] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400'

const formLabelClass = 'text-xs font-semibold text-gray-600'

export function FormField({ label, htmlFor, children, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`flex flex-col gap-1 ${className}`}>
      <span className={formLabelClass}>{label}</span>
      {children}
    </label>
  )
}
