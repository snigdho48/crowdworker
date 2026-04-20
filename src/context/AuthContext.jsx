import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, logout as apiLogout, refreshMe } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await refreshMe()
      setUser(me)
    } catch {
      apiLogout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(
    async (username, password) => {
      await apiLogin(username, password)
      const me = await refreshMe()
      setUser(me)
    },
    [],
  )

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      refreshUser: loadUser,
    }),
    [user, loading, login, logout, loadUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
