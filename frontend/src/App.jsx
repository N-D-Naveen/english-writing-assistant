import { useState, useEffect } from 'react'
import { getCurrentUser, signOut } from 'aws-amplify/auth'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import TeacherPage from './pages/TeacherPage'

export default function App() {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage]     = useState('main')

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleSignOut() {
    await signOut()
    setUser(null)
  }

  if (loading) {
    return <div className="page-loading"><p>Loading...</p></div>
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  return (
    <div>
      <nav className="navbar">
        <div className="navbar__links">
          <button
            className={`navbar__btn ${page === 'main' ? 'navbar__btn--active' : ''}`}
            onClick={() => setPage('main')}
          >
            ✏️ Rephrase
          </button>
          <button
            className={`navbar__btn ${page === 'teacher' ? 'navbar__btn--active' : ''}`}
            onClick={() => setPage('teacher')}
          >
            📊 My Progress
          </button>
        </div>
        <button className="navbar__signout" onClick={handleSignOut}>
          Sign out
        </button>
      </nav>

      {page === 'main' ? <MainPage /> : <TeacherPage />}
    </div>
  )
}
