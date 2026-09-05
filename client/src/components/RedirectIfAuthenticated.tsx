import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'

interface RedirectIfAuthenticatedProps {
  to: string
  children: ReactNode
}

const RedirectIfAuthenticated = ({ to, children }: RedirectIfAuthenticatedProps) => {
  if (isAuthenticated()) {
    return <Navigate to={to} replace />
  }

  return children
}

export default RedirectIfAuthenticated
