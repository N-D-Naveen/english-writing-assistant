import { useState } from 'react'
import { signIn, confirmSignIn } from 'aws-amplify/auth'

export default function LoginPage({ onLogin }) {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [needsNewPassword, setNeedsNewPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn({ username: email, password })

      // Cognito forces a password change on the very first login
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setNeedsNewPassword(true)
        setLoading(false)
        return
      }

      onLogin(result)
    } catch (err) {
      setError(err.message || 'Login failed. Check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  async function handleNewPassword(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await confirmSignIn({ challengeResponse: newPassword })
      onLogin(result)
    } catch (err) {
      setError(err.message || 'Failed to set new password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">✍️ English Writing Assistant</h1>
        <p className="login-card__subtitle">
          {needsNewPassword ? 'Set a new password to continue' : 'Sign in to your account'}
        </p>

        {error && <div className="alert--error">{error}</div>}

        {!needsNewPassword ? (
          <form onSubmit={handleLogin}>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-field form-field--last">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn--primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNewPassword}>
            <div className="form-field form-field--last">
              <label className="form-label">New Password</label>
              <input
                className="form-input"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button className="btn btn--primary" type="submit" disabled={loading}>
              {loading ? 'Setting password...' : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
