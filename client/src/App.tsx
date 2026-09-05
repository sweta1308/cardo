import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateWorkspace from './pages/CreateWorkspace'
import CreateBoard from './pages/CreateBoard'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated'
import { useTrackLastPath } from './hooks/useTrackLastPath'

function App() {
  useTrackLastPath()

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <RedirectIfAuthenticated to="/onboarding">
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
        path="/onboarding/board"
        element={
          <ProtectedRoute>
            <CreateBoard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
