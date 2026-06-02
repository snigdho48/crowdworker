import { Link } from 'react-router-dom'
import {
  IconBrandGoogleAnalytics,
  IconBolt,
  IconBrandChrome,
  IconBrandGoogle,
  IconDeviceDesktopAnalytics,
  IconDeviceMobile,
  IconHeartHandshake,
  IconShieldCheck,
  IconReportAnalytics,
  IconShieldLock,
} from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import { motion as Motion } from 'framer-motion'

function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 text-white">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
          {icon}
        </span>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <div className="mt-2 text-sm text-slate-200">{desc}</div>
    </div>
  )
}

export function Home() {
  const { isAuthed } = useAuth()

  return (
    <main>
      <section className="relative overflow-hidden bg-[#070a14]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#1a73e8]/25 blur-3xl" />
          <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-[#34a853]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#fbbc04]/20 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Next Generation
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
                Digital Agency
              </h1>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                <IconBrandGoogle size={14} />
                Crowd Work for modern ad operations
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 md:text-base">
                Launch campaigns, ingest Excel data, and get trustworthy reporting with
                dimension-level breakouts—fast, responsive, and easy to use.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/creative-gallery"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
                >
                  View our works
                </Link>
                <Link
                  to={isAuthed ? '/app' : '/login'}
                  className="rounded-full border border-white/15 bg-white/0 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/10"
                >
                  {isAuthed ? 'Open dashboard' : 'Sign in'}
                </Link>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {[
                  { k: 'Fast', v: 'Sub-second filters' },
                  { k: 'Secure', v: 'JWT + roles' },
                  { k: 'Responsive', v: 'Mobile → Desktop' },
                ].map((x) => (
                  <div key={x.k} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold text-white">{x.k}</div>
                    <div className="mt-1 text-[11px] leading-5 text-slate-200">{x.v}</div>
                  </div>
                ))}
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">What you get</div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200">
                  <IconBrandChrome size={14} />
                  Works everywhere
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Feature
                  icon={<IconBolt size={18} />}
                  title="Fast UI"
                  desc="Lightweight components, efficient tables, responsive charts."
                />
                <Feature
                  icon={<IconShieldLock size={18} />}
                  title="Secure"
                  desc="JWT auth, permission-aware access, and protected routes."
                />
                <Feature
                  icon={<IconBrandGoogleAnalytics size={18} />}
                  title="Dimensions"
                  desc="Device, creative, city, carrier and more — all queryable."
                />
                <Feature
                  icon={<IconReportAnalytics size={18} />}
                  title="Reporting"
                  desc="Export-ready breakdowns with totals and smart formatting."
                />
              </div>
            </Motion.div>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Trusted by modern teams
              </div>
              <div className="flex items-center gap-3 text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                  <IconDeviceMobile size={16} /> Mobile
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                  <IconDeviceDesktopAnalytics size={16} /> Desktop
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                  <IconShieldCheck size={16} /> Compliance-ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Data ingestion',
                desc: 'Upload Excel with dimensions (device, creative, city) and start reporting immediately.',
              },
              {
                title: 'Analytics',
                desc: 'Date-wise performance with table totals, plus device & creative breakdown charts.',
              },
              {
                title: 'Collaboration',
                desc: 'Role-aware access so teams and advertisers see exactly what they need.',
              },
            ].map((x) => (
              <div key={x.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                <div className="mt-2 text-sm text-slate-600">{x.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Ready to see the dashboard?
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Sign in and explore the campaign list, upload, and reporting.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={isAuthed ? '/app' : '/login'}
                  className="rounded-full bg-[#34a853] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#2a7f3f]"
                >
                  {isAuthed ? 'Open dashboard' : 'Sign in'}
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <IconHeartHandshake size={18} /> Built for ad ops teams
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                Everything is designed to reduce operational load: consistent filters, readable tables,
                and charts that align with your reporting outputs.
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Design principles</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                <li>Small, consistent typography (no layout breaks)</li>
                <li>Responsive grid system (mobile-first)</li>
                <li>Subtle motion, no heavy effects</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About / Growth (Frisk-like mid section) */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Next generation
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Unlock revenue growth with better campaign intelligence.
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
                If you ask teams what it’s like working with a modern reporting stack, they talk about
                clarity and speed. Crowd Work brings consistent dimensions, clean totals, and fast UI
                into one workflow.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Branding', 'Development', 'Marketing'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { k: 'Agency-ready UX', v: 'Modern rhythm + clean hierarchy' },
                  { k: 'Dimension reporting', v: 'Device, creative, city and more' },
                  { k: 'Ingestion workflow', v: 'Excel upload → instant reporting' },
                  { k: 'Accuracy', v: 'Totals match your exports' },
                ].map((x) => (
                  <div key={x.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-semibold text-slate-900">{x.k}</div>
                    <div className="mt-1 text-xs text-slate-600">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Services
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                What we can do for our clients
              </div>
            </div>
            <Link
              to="/contact"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Let’s talk
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              { n: '01', t: 'Brand strategy', d: 'Positioning, messaging, and launch planning.' },
              { n: '02', t: 'Reporting setup', d: 'Dimensions, rollups, and export-ready tables.' },
              { n: '03', t: 'Creative operations', d: 'Format library, gallery, and performance splits.' },
              { n: '04', t: 'Optimization', d: 'Device/creative insights to improve outcomes.' },
            ].map((x) => (
              <div key={x.n} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {x.n}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{x.t}</div>
                    <div className="mt-1 text-sm text-slate-600">{x.d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio / Works */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Portfolio
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                Selected works & case studies
              </div>
            </div>
            <Link
              to="/creative-gallery"
              className="rounded-full bg-[#1a73e8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1558b0]"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { t: 'Compliance scanner dashboard', tags: ['Development', 'Marketing'] },
              { t: 'Takeover creative launch kit', tags: ['Branding', 'Website'] },
              { t: 'Device split optimization', tags: ['Marketing'] },
              { t: 'Publisher mix insights', tags: ['Development'] },
              { t: 'Creative performance library', tags: ['Branding'] },
              { t: 'Automated reporting exports', tags: ['Business', 'Development'] },
            ].map((x) => (
              <div
                key={x.t}
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
                <div className="mt-3 text-sm font-semibold text-slate-900">{x.t}</div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-10 text-center text-xs text-slate-500">
                  Preview
                </div>
                <div className="mt-4 text-xs font-semibold text-[#1a73e8]">
                  View project →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Team</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
            Our team behind the studio
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: 'Liam Owen', r: 'Managing Director' },
              { n: 'Daniyel Karlos', r: 'Digital Marketing' },
              { n: 'William Levi', r: 'UI/UX Designer' },
              { n: 'Daniel Jack', r: 'Web Developer' },
            ].map((p) => (
              <div key={p.n} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="rounded-2xl bg-slate-50 p-10 text-center text-xs text-slate-500">
                  Photo
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-900">{p.n}</div>
                <div className="mt-1 text-xs text-slate-600">{p.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Testimonials
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
            What partners say
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { n: 'Daniyel Karlos', r: 'Senior Director of Marketing' },
              { n: 'Samuel Peters', r: 'Senior Director of Marketing' },
              { n: 'Robert Fox', r: 'Senior Director of Marketing' },
            ].map((t) => (
              <div key={t.n} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="text-sm leading-6 text-slate-700">
                  “It’s a pleasure working with the team. The platform is responsive, consistent,
                  and makes reporting fast and reliable.”
                </div>
                <div className="mt-4 text-sm font-semibold text-slate-900">{t.n}</div>
                <div className="text-xs text-slate-600">{t.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                News
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                Read our articles and updates
              </div>
            </div>
            <Link
              to="/contact"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Subscribe
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { d: 'Feb 8, 2026', c: 'Branding', t: 'Everything you should know about return' },
              { d: 'Feb 8, 2026', c: 'Branding', t: '6 commerce design tips for big results' },
              { d: 'Feb 8, 2026', c: 'Company', t: 'Four steps to conduct a successful usability test' },
            ].map((b) => (
              <div key={b.t} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs text-slate-500">
                  {b.d} · <span className="font-semibold">{b.c}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{b.t}</div>
                <div className="mt-4 text-xs font-semibold text-[#1a73e8]">Read more →</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

