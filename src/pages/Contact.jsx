import { MarketingImagePlaceholder } from '../components/MarketingImagePlaceholder'

export function Contact() {
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
                Contact
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Let’s work together
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-200 md:text-base">
                For demos, onboarding, or support, reach out and our team will respond quickly.
              </p>
            </div>
            <MarketingImagePlaceholder className="h-[260px] md:h-[320px]" label="Office / map image" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Email</div>
            <div className="mt-2 text-sm text-slate-600">support@crowdwork.example</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Phone</div>
            <div className="mt-2 text-sm text-slate-600">+880 1XXX-XXXXXX</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Office</div>
            <div className="mt-2 text-sm text-slate-600">Dhaka, Bangladesh</div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Send a message</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm"
              placeholder="Name"
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm"
              placeholder="Email"
            />
            <input
              className="md:col-span-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm"
              placeholder="Subject"
            />
            <textarea
              rows={5}
              className="md:col-span-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm"
              placeholder="Message"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-full bg-[#1a73e8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1558b0]"
              onClick={() => {}}
            >
              Submit
            </button>
          </div>
        </div>
        </div>
      </section>
    </main>
  )
}

