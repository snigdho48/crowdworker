import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconHelpCircle,
  IconLayoutDashboard,
  IconListDetails,
  IconPlus,
  IconReportAnalytics,
  IconSettings,
  IconBuildingSkyscraper,
  IconLogout,
} from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

const linkBase =
  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-black/5'

const linkClass = ({ isActive }) =>
  `${linkBase} ${isActive ? 'border-l-[3px] border-[#378ADD] bg-black/5 pl-[9px] text-gray-900' : ''}`

export function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const initials = useMemo(() => {
    const u = user?.username || 'Admin'
    const parts = u.split(/[\s._-]+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return u.slice(0, 2).toUpperCase()
  }, [user])

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#1a73e8] text-white">
            <IconBuildingSkyscraper size={18} />
          </span>
          <span className="text-sm">Crowd Work</span>
        </div>
      </div>

      <div className="px-3">
        <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Main
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/app" end className={linkClass}>
            <IconLayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/app/campaigns" className={linkClass}>
            <IconListDetails size={18} />
            Campaign List
          </NavLink>
          {isAdmin ? (
            <NavLink to="/app/campaigns/new" className={linkClass}>
              <IconPlus size={18} />
              New Campaign
            </NavLink>
          ) : null}
          <NavLink to="/app/report" className={linkClass}>
            <IconReportAnalytics size={18} />
            Report
          </NavLink>
        </nav>
      </div>

      <div className="mt-4 px-3">
        <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Account
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/app/settings" className={linkClass}>
            <IconSettings size={18} />
            Settings
          </NavLink>
          <NavLink to="/app/help" className={linkClass}>
            <IconHelpCircle size={18} />
            Help
          </NavLink>
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {user?.username || 'Admin'}
            </div>
            <div className="text-xs text-gray-600">
              {(user?.role || 'admin').toUpperCase()}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
          onClick={logout}
        >
          <IconLogout size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

