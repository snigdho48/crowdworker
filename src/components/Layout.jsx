import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCampaigns() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M4 12h10M4 18h7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M16 12v8l4-4-4-4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const linkClass = ({ isActive }) =>
  `sidebar-link${isActive ? ' sidebar-link--active' : ''}`

export function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (sidebarOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [sidebarOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const initial = (user?.username || '?').slice(0, 1).toUpperCase()

  return (
    <div className="shell">
      <div className="app-frame">
        {sidebarOpen && (
          <button
            type="button"
            className="sidebar-scrim"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          id="app-sidebar"
          className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}
          aria-label="Main navigation"
        >
          <div className="sidebar__top">
            <NavLink to="/" className="sidebar__brand" end onClick={() => setSidebarOpen(false)}>
              <span className="brand-mark" aria-hidden>
                CE
              </span>
              <span className="sidebar__brand-text">
                <span className="sidebar__product">Campaign Edge</span>
                <span className="sidebar__product-sub">Reporting</span>
              </span>
            </NavLink>
          </div>

          <p className="sidebar__section-label">Workspace</p>
          <nav className="sidebar__nav">
            <NavLink to="/" end className={linkClass} onClick={() => setSidebarOpen(false)}>
              <span className="sidebar-link__icon">
                <IconDashboard />
              </span>
              <span className="sidebar-link__text">Dashboard</span>
            </NavLink>
            <NavLink
              to="/campaigns"
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link__icon">
                <IconCampaigns />
              </span>
              <span className="sidebar-link__text">Campaigns</span>
            </NavLink>
          </nav>

          <div className="sidebar__footer">
            <div className="sidebar-user">
              <div className="sidebar-user__avatar" aria-hidden>
                {initial}
              </div>
              <div className="sidebar-user__meta">
                <span className="sidebar-user__name">{user?.username}</span>
                <span className="sidebar-user__role-row">
                  <span className="sidebar-user__role">
                    {isAdmin ? 'Administrator' : 'Advertiser'}
                  </span>
                  {isAdmin && (
                    <span className="sidebar-user__pill">Admin</span>
                  )}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="sidebar-logout"
              onClick={() => {
                setSidebarOpen(false)
                logout()
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4M15 12h8m0 0-3-3m3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Log out
            </button>
          </div>
        </aside>

        <div className="main-column">
          <header className="mobile-bar">
            <button
              type="button"
              className="mobile-bar__menu"
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h10"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              <span className="sr-only">Open menu</span>
            </button>
            <span className="mobile-bar__title">Campaign Edge</span>
          </header>

          <main className="main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
