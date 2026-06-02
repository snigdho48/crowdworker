import { Outlet, useNavigate } from 'react-router-dom'
import { IconMenu2 } from '@tabler/icons-react'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="flex">
          <div className="md:sticky md:top-0 md:h-screen">
            <Sidebar />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                onClick={() => navigate('/app')}
              >
                <IconMenu2 size={18} />
                Menu
              </button>
              <div className="text-sm font-semibold text-slate-900">Crowd Work</div>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

