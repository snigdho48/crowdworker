import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { IconSpeakerphone } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { isAuthed, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isAuthed) return <Navigate to="/app" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username, password)
      navigate('/app', { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'Login failed'
      setError(String(msg))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto mt-20 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <IconSpeakerphone size={20} className="text-[#1a73e8]" />
          Crowd Work
        </div>
        <div className="mt-1 text-sm text-gray-600">Sign in to continue</div>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-xl border border-gray-200 bg-[#f7f6ee] px-4 py-3 text-sm text-gray-900"
            autoComplete="username"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-xl border border-gray-200 bg-[#f7f6ee] px-4 py-3 text-sm text-gray-900"
            autoComplete="current-password"
            required
          />
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[#378ADD] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

