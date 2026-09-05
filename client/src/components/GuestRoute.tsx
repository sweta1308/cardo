import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'
import { getLastPath } from '../lib/lastPath'

const GuestRoute = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) return
    const lastPath = getLastPath()
    // '/' redirects authenticated users to '/onboarding' anyway, so go there directly.
    navigate(lastPath && lastPath !== '/' ? lastPath : '/onboarding', { replace: true })
  }, [authenticated, navigate])

  if (authenticated) {
    return null
  }

  return children
}

export default GuestRoute
