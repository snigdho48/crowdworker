import { Link } from 'react-router-dom'
import { MarketingImagePlaceholder } from '../components/MarketingImagePlaceholder'

const items = [
  { title: 'Money Laundering Compliance Scanner', tags: ['Development', 'Marketing'] },
  { title: 'Decentralized Lending Platform for Students', tags: ['Development', 'Marketing'] },
  { title: 'Anti Money Laundering Compliance Scanner', tags: ['Branding', 'Marketing', 'Website'] },
  { title: 'Shopify Redesign for a Nova Scotia Winery', tags: ['Branding', 'Website'] },
  { title: 'Publisher Mix Insights', tags: ['Business', 'Development'] },
  { title: 'Creative Performance Library', tags: ['Branding'] },
]

export function Portfolio() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-[#070a14]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#1a73e8]/25 blur-3xl" />
          <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-[#34a853]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#fbbc04]/20 blur-3xl" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Portfolio
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                View our works
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-200 md:text-base">
                A curated set of workflows and reporting deliverables—built with a lightweight UI
                structure and export-ready tables.
              </p>
            </div>
            <Link
              to="/contact"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
            >
              Let’s talk
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <MarketingImagePlaceholder className="h-[220px]" label="Project cover" />
            <MarketingImagePlaceholder className="h-[220px]" label="Project cover" />
            <MarketingImagePlaceholder className="h-[220px]" label="Project cover" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((x) => (
              <div
                key={x.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap gap-2">
                  {x.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900">{x.title}</div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-10 text-center text-xs text-slate-500">
                  Preview
                </div>
                <div className="mt-4 text-xs font-semibold text-[#1a73e8]">View project →</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

