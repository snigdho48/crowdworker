import { Link } from 'react-router-dom'
import { MarketingImagePlaceholder } from '../components/MarketingImagePlaceholder'

const posts = [
  { date: 'February 8, 2026', category: 'Branding', title: 'Everything you should know about return' },
  { date: 'February 8, 2026', category: 'Branding', title: '6 commerce design tips for big results' },
  { date: 'February 8, 2026', category: 'Company', title: 'Four steps to conduct a successful usability test' },
  { date: 'February 8, 2026', category: 'Analytics', title: 'How to keep reporting totals consistent' },
  { date: 'February 8, 2026', category: 'Product', title: 'Building lightweight filters that scale' },
  { date: 'February 8, 2026', category: 'Ops', title: 'Excel ingestion patterns for ad operations' },
]

export function Blog() {
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
                Blog
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Read our articles and news
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-200 md:text-base">
                Product notes, reporting patterns, and UI choices for fast, stable adtech dashboards.
              </p>
            </div>
            <Link
              to="/contact"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
            >
              Subscribe
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <MarketingImagePlaceholder className="h-[180px]" label="Blog cover" />
            <MarketingImagePlaceholder className="h-[180px]" label="Blog cover" />
            <MarketingImagePlaceholder className="h-[180px]" label="Blog cover" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-3 md:grid-cols-3">
            {posts.map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs text-slate-500">
                  {p.date} · <span className="font-semibold">{p.category}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{p.title}</div>
                <div className="mt-4 text-xs font-semibold text-[#1a73e8]">Read more →</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

