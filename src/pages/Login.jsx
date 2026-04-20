import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(username, password)
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Could not sign in.'
      setError(typeof msg === 'string' ? msg : 'Could not sign in.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={onSubmit}>
        <header className="auth-card__header">
          <h1 className="auth-card__title">Sign in</h1>
          <p className="auth-card__subtitle">
            Use an admin or advertiser account to continue.
          </p>
          <p className="auth-dev-credentials">
            Dev defaults: <code>admin / admin123</code> and{' '}
            <code>advertiser1 / ad123</code>
          </p>
        </header>

        <div className="auth-form">
          <label className="field">
            <span>Username</span>
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>

        <button
          className="btn btn-primary auth-submit"
          type="submit"
          disabled={pending}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
