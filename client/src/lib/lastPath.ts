const LAST_PATH_KEY = 'lastPath'

export function saveLastPath(path: string) {
  sessionStorage.setItem(LAST_PATH_KEY, path)
}

export function getLastPath(): string | null {
  return sessionStorage.getItem(LAST_PATH_KEY)
}
