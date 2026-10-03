import { useState } from 'react'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './contexts/AuthContext'
import { LoginForm } from './components/LoginForm'
import { AddWorkoutForm } from './components/AddWorkoutForm'
import { Dashboard } from './components/Dashboard'
import { supabase } from './lib/supabaseClient'

type Tab = 'dashboard' | 'add'

function AppContent() {
  const { user, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('dashboard')
  // Incrémenté pour forcer le Dashboard à se remonter (donc à refetch) après ajout d'une séance
  const [dashboardKey, setDashboardKey] = useState(0)

  if (loading) {
    return <p>Chargement...</p>
  }

  if (!user) {
    return <LoginForm />
  }

  function handleWorkoutAdded() {
    setDashboardKey((k) => k + 1)
    setTab('dashboard')
  }

  return (
    <div>
      <nav
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--color-bg)',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          className={tab === 'dashboard' ? '' : 'secondary'}
          style={{ borderRadius: 0, marginBottom: 0 }}
          onClick={() => setTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={tab === 'add' ? '' : 'secondary'}
          style={{ borderRadius: 0, marginBottom: 0 }}
          onClick={() => setTab('add')}
        >
          Ajouter une séance
        </button>
        <button
          type="button"
          className="secondary"
          style={{ borderRadius: 0, marginBottom: 0, width: 'auto' }}
          onClick={() => supabase.auth.signOut()}
        >
          Déconnexion
        </button>
      </nav>

      {tab === 'dashboard' && <Dashboard key={dashboardKey} />}
      {tab === 'add' && <AddWorkoutForm onWorkoutAdded={handleWorkoutAdded} />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App