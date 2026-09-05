import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { saveLastPath } from '../lib/lastPath'

const EXCLUDED_PATHS = ['/login', '/register']

export function useTrackLastPath() {
  const location = useLocation()

  useEffect(() => {
    if (EXCLUDED_PATHS.includes(location.pathname)) return
    saveLastPath(location.pathname + location.search)
  }, [location.pathname, location.search])
}
