import { MarketingImagePlaceholder } from '../components/MarketingImagePlaceholder'

const ITEMS = [
  { title: 'Banner A', type: 'Display', size: '300×250' },
  { title: 'Banner B', type: 'Display', size: '728×90' },
  { title: 'Takeover', type: 'Rich media', size: 'Fullscreen' },
  { title: 'Video 15s', type: 'YouTube', size: '16:9' },
  { title: 'Floating', type: 'Rich media', size: 'Responsive' },
  { title: 'Video 6s', type: 'YouTube', size: 'Shorts' },
]

export function CreativeGallery() {
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
                Creative
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Creative Gallery
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-200 md:text-base">
                A curated gallery of supported formats. We’ll connect this to your creative repository
                later.
              </p>
            </div>
            <MarketingImagePlaceholder className="h-[260px] md:h-[320px]" label="Creative mockups" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((i) => (
              <div
                key={i.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{i.title}</div>
                    <div className="mt-1 text-xs text-slate-600">{i.type}</div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                    {i.size}
                  </div>
                </div>
                <div className="mt-4">
                  <MarketingImagePlaceholder className="h-[180px] border-slate-200/0 bg-slate-50" label="Preview" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

