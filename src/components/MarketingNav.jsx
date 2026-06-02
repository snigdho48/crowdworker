import { Link, NavLink } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { IconBuildingSkyscraper, IconLogin2, IconMenu2, IconX } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const navLink = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm font-semibold ${
    isActive ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-white/10 hover:text-white'
  }`

export function MarketingNav() {
  const { isAuthed, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = useMemo(
    () => [
      { to: '/', label: 'Home', end: true },
      { to: '/about', label: 'About' },
      { to: '/services', label: 'Services' },
      { to: '/portfolio', label: 'Portfolio' },
      { to: '/team', label: 'Team' },
      { to: '/blog', label: 'Blog' },
      { to: '/contact', label: 'Contact' },
    ],
    [],
  )

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070a14]/80 backdrop-blur">
      {/* top contact strip (Frisk-like) */}
      <div className="hidden border-b border-white/10 bg-[#070a14] md:block">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 text-xs text-slate-200">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span>Dhaka, Bangladesh</span>
            <span>+880 1XXX-XXXXXX</span>
            <span>support@crowdwork.example</span>
          </div>
          <Link
            to="/contact"
            className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100"
          >
            Let’s talk with us
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-900">
            <IconBuildingSkyscraper size={18} />
          </span>
          <span className="text-sm md:text-base">Crowd Work</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={navLink}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* auth actions (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthed ? (
              <>
                <Link
                  to="/app"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="rounded-full border border-white/15 bg-white/0 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  onClick={() => {
                    logout()
                    navigate('/', { replace: true })
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/0 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <IconLogin2 size={18} />
                  Sign in
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  Let’s talk
                </Link>
              </>
            )}
          </div>

          {/* mobile menu */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/0 p-2 text-white shadow-sm hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu2 size={18} />
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      {mobileOpen ? (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed right-0 top-0 z-50 h-full w-[86%] max-w-sm border-l border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Menu</div>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm font-semibold ${
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-800 hover:bg-slate-50'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
              {isAuthed ? (
                <>
                  <Link
                    to="/app"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl bg-[#1a73e8] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#1558b0]"
                  >
                    Open dashboard
                  </Link>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                      navigate('/', { replace: true })
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Let’s talk
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

