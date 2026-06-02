export function About() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-[#070a14]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#1a73e8]/25 blur-3xl" />
          <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-[#34a853]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#fbbc04]/20 blur-3xl" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              About Us
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              We build fast reporting workflows for ad operations.
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-200 md:text-base">
              Crowd Work is designed to feel like a premium agency/product theme—strong typography,
              confident spacing, and a layout rhythm that stays stable on every screen.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { title: 'Performance', desc: 'Compact tables, quick filters, and snappy charts.' },
              { title: 'Reliability', desc: 'Clear aggregation so totals match exports.' },
              { title: 'Design', desc: 'Modern, lightweight UI that stays consistent.' },
            ].map((x) => (
              <div key={x.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">{x.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">What makes it feel “enterprise”</div>
            <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm text-slate-600 md:grid-cols-2">
              <li>Stable type scale and spacing across pages</li>
              <li>Mobile-first grids with clean desktop rhythm</li>
              <li>High-contrast hero sections (Frisk-like)</li>
              <li>Lightweight UI — no heavy animations required</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

