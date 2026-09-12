import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout as logoutRequest } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useBoardStore } from '../store/boardStore'
import { useBoardsStore } from '../store/boardsStore'
import { useWorkspaceStore } from '../store/workspaceStore'

const UserBadge = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.logout)

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const firstName = user?.name.split(' ')[0] ?? 'there'
  const initial = firstName.charAt(0).toUpperCase()

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleLogout = async () => {
    setIsOpen(false)

    // Best-effort: the token is discarded locally either way.
    await logoutRequest().catch(() => {})

    clearAuth()
    useWorkspaceStore.getState().clear()
    useBoardsStore.getState().reset()
    useBoardStore.getState().reset()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="text-sm font-medium text-gray-700">{firstName}</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full cursor-pointer px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserBadge
