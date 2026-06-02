import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { ready, isAuthed } = useAuth()
  if (!ready) return null
  if (!isAuthed) return <Navigate to="/login" replace />
  return <Outlet />
}

