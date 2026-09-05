import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface RedirectIfAuthenticatedProps {
  to: string
  children: ReactNode
}

const RedirectIfAuthenticated = ({ to, children }: RedirectIfAuthenticatedProps) => {
  const token = useAuthStore((state) => state.token)

  if (token) {
    return <Navigate to={to} replace />
  }

  return children
}

export default RedirectIfAuthenticated
