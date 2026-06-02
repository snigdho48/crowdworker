import { MarketingImagePlaceholder } from '../components/MarketingImagePlaceholder'

const people = [
  { name: 'Liam Owen', role: 'Managing Director' },
  { name: 'Daniyel Karlos', role: 'Digital Marketing' },
  { name: 'William Levi', role: 'UI/UX Designer' },
  { name: 'Daniel Jack', role: 'Web Developer' },
]

export function Team() {
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
                Our Team
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Our team behind the studio
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-200 md:text-base">
                A small, cross-functional group focused on fast execution, reliable reporting, and a
                clean UI that never breaks on mobile.
              </p>
            </div>
            <MarketingImagePlaceholder className="h-[260px] md:h-[320px]" label="Team photo grid" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {people.map((p) => (
              <div key={p.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="rounded-2xl bg-slate-50 p-10 text-center text-xs text-slate-500">
                  Photo
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900">{p.name}</div>
                <div className="mt-1 text-xs text-slate-600">{p.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

