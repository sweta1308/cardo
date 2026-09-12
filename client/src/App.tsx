import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateWorkspace from './pages/CreateWorkspace'
import CreateBoard from './pages/CreateBoard'
import Dashboard from './pages/Dashboard'
import WorkspaceSettings from './pages/WorkspaceSettings'
import Boards from './pages/Boards'
import BoardDetail from './pages/BoardDetail'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated'
import { useTrackLastPath } from './hooks/useTrackLastPath'
import { useAuthStore } from './store/authStore'
import { useWorkspaceStore } from './store/workspaceStore'

function App() {
  useTrackLastPath()
  const isLoggedIn = useAuthStore((state) => Boolean(state.token))
  const workspace = useWorkspaceStore((state) => state.workspace)
  const isResolved = useWorkspaceStore((state) => state.isResolved)
  const resolveWorkspace = useWorkspaceStore((state) => state.resolveWorkspace)

  // Always resolve once per session: it populates the workspace switcher and
  // re-checks that the persisted workspace still exists.
  useEffect(() => {
    if (isLoggedIn && !isResolved) resolveWorkspace()
  }, [isLoggedIn, isResolved, resolveWorkspace])

  // Routing depends on whether a workspace exists, so hold off until we know —
  // otherwise a returning user is sent to onboarding before the lookup lands.
  // A persisted workspace is enough to route on, so only block without one.
  if (isLoggedIn && !workspace && !isResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    )
  }

  const authenticatedHome = workspace ? '/dashboard' : '/onboarding'

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <RedirectIfAuthenticated to={authenticatedHome}>
              <Home />
            </RedirectIfAuthenticated>
          }
        />
      </Route>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <CreateWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <WorkspaceSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boards"
        element={
          <ProtectedRoute>
            <Boards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boards/new"
        element={
          <ProtectedRoute>
            <CreateBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boards/:boardId"
        element={
          <ProtectedRoute>
            <BoardDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
