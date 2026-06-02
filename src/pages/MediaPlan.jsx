import { MarketingImagePlaceholder } from '../components/MarketingImagePlaceholder'

export function MediaPlan() {
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
                Media Plan
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Plan channels, formats, and measurement
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                A structured plan for channels, formats, and measurement—built to scale with clear
                reporting and dimension breakdowns.
              </p>
            </div>
            <MarketingImagePlaceholder className="h-[260px] md:h-[320px]" label="Plan mockups" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Channels</div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
                <li>DSP (Display, Retargeting, Performance)</li>
                <li>YouTube (Video, Shorts)</li>
                <li>Floating / Takeover placements</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">KPIs</div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
                <li>Impressions, Clicks, CTR</li>
                <li>Spend, CPM, CPC</li>
                <li>Dimension breakdowns (device, creative, city)</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Recommended workflow</div>
              <div className="text-xs font-semibold text-slate-500">Simple, repeatable, scalable</div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                { t: '1. Define goals', d: 'KPIs, audience, flight dates' },
                { t: '2. Plan inventory', d: 'Formats, placements, pacing' },
                { t: '3. Launch & ingest', d: 'Upload data, validate dimensions' },
                { t: '4. Optimize', d: 'Device/creative splits + reporting' },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-semibold text-slate-900">{x.t}</div>
                  <div className="mt-2 text-xs text-slate-600">{x.d}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <MarketingImagePlaceholder className="h-[160px] border-slate-200/0 bg-slate-50" label="Channel mix chart" />
              <MarketingImagePlaceholder className="h-[160px] border-slate-200/0 bg-slate-50" label="Pacing chart" />
              <MarketingImagePlaceholder className="h-[160px] border-slate-200/0 bg-slate-50" label="KPI tracker" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

