import type { AuthUser } from './api'

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem('token'))
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}
