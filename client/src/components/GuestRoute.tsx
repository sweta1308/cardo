import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useWorkspaceStore } from '../store/workspaceStore'
import { getLastPath } from '../lib/lastPath'

const GuestRoute = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const authenticated = useAuthStore((state) => Boolean(state.token))
  const hasWorkspace = useWorkspaceStore((state) => Boolean(state.workspace))

  useEffect(() => {
    if (!authenticated) return
    const lastPath = getLastPath()
    // '/' just redirects authenticated users onward anyway, so skip straight to the destination.
    const fallback = hasWorkspace ? '/dashboard' : '/onboarding'
    navigate(lastPath && lastPath !== '/' ? lastPath : fallback, { replace: true })
  }, [authenticated, hasWorkspace, navigate])

  if (authenticated) {
    return null
  }

  return children
}

export default GuestRoute
