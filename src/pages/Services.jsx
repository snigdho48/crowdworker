import { MarketingImagePlaceholder } from '../components/MarketingImagePlaceholder'

export function Services() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-[#070a14]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#1a73e8]/25 blur-3xl" />
          <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-[#34a853]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#fbbc04]/20 blur-3xl" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Services
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                What we can do for our clients
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-200 md:text-base">
                A structured service stack for ad ops teams: onboarding, ingestion, reporting, and
                optimization—built to ship quickly and stay reliable.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Branding', 'Development', 'Marketing'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/15 bg-white/0 px-3 py-1 text-xs font-semibold text-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <MarketingImagePlaceholder className="h-[260px] md:h-[320px]" label="Service hero image" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                n: '01',
                t: 'Branding design',
                d: 'Naming, positioning, and modern design systems for adtech products.',
              },
              {
                n: '02',
                t: 'Illustration & modelling',
                d: 'Creative system support: formats, previews, and library workflows.',
              },
              {
                n: '03',
                t: 'Website development',
                d: 'Fast, responsive marketing pages with clean structure and SEO-friendly patterns.',
              },
              {
                n: '04',
                t: 'Digital marketing',
                d: 'Measurement-ready reporting and dimension breakouts for better decisions.',
              },
            ].map((x) => (
              <div key={x.n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {x.n}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{x.t}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{x.d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">How we work</div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                { t: 'Discover', d: 'Define goals and reporting dimensions.' },
                { t: 'Design', d: 'Create lightweight UI structure and flows.' },
                { t: 'Deliver', d: 'Implement fast pages and stable components.' },
                { t: 'Optimize', d: 'Iterate based on real campaign performance.' },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-900">{x.t}</div>
                  <div className="mt-2 text-sm text-slate-600">{x.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

