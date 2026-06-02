import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, login as apiLogin, logout as apiLogout, refreshMe } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(() => !localStorage.getItem('access'))

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('access')
    if (!token) {
      return
    }
    refreshMe()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        apiLogout()
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function login(username, password) {
    await apiLogin(username, password)
    const me = await refreshMe()
    setUser(me)
  }

  function logout() {
    apiLogout()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      api,
      user,
      ready,
      login,
      logout,
      isAuthed: Boolean(user),
      isAdmin: user?.role === 'admin',
    }),
    [user, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}

