import { Topbar } from '../components/Topbar'
import { useAuth } from '../context/AuthContext'

export function Settings() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-full flex-col">
      <Topbar title="Settings" />
      <div className="flex-1 overflow-auto bg-[#f5f4ea] p-5">
        <div className="mx-auto max-w-2xl space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                <dt className="text-gray-600">Username</dt>
                <dd className="font-medium text-gray-900">{user?.username || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                <dt className="text-gray-600">Role</dt>
                <dd className="font-medium uppercase text-gray-900">{user?.role || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">Email</dt>
                <dd className="font-medium text-gray-900">{user?.email || '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Preferences</h2>
            <p className="mt-2 text-sm text-gray-600">
              Display and notification preferences will be available in a future update.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
