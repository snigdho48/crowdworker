import { Link } from 'react-router-dom'
import { Topbar } from '../components/Topbar'

const FAQ = [
  {
    q: 'How do I create a campaign?',
    a: 'Sign in as an admin, open Campaign List, and click New Campaign. Save the form, then upload your Excel metrics file on the edit screen.',
  },
  {
    q: 'What columns should the Excel file include?',
    a: 'date, impressions, clicks, spend, and publisher. Optional columns include domain, app, creative, device type, city, age, and carrier.',
  },
  {
    q: 'Why does my report look empty?',
    a: 'Confirm the campaign has uploaded data and that your date range overlaps the campaign duration.',
  },
  {
    q: 'Who can delete campaigns?',
    a: 'Only admin users can create, edit, or delete campaigns. Advertisers can view assigned campaigns and reports.',
  },
]

export function Help() {
  return (
    <div className="flex min-h-full flex-col">
      <Topbar title="Help" />
      <div className="flex-1 overflow-auto bg-[#f5f4ea] p-5">
        <div className="mx-auto max-w-2xl space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Quick start</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700">
              <li>Sign in from the login page.</li>
              <li>Open Dashboard for a summary of live campaigns.</li>
              <li>Use Report to filter by campaign, date range, and dimension.</li>
              <li>Admins manage campaigns from Campaign List and New Campaign.</li>
            </ol>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">FAQ</h2>
            <dl className="mt-4 space-y-4">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="text-sm font-semibold text-gray-900">{item.q}</dt>
                  <dd className="mt-1 text-sm text-gray-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Contact</h2>
            <p className="mt-2 text-sm text-gray-600">
              Need more help? Reach out via the{' '}
              <Link to="/contact" className="font-semibold text-[#378ADD] hover:underline">
                contact page
              </Link>{' '}
              or email support@crowdwork.example.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
