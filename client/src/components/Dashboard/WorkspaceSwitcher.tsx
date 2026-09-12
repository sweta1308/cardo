import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Workspace } from '../../lib/api'
import { useWorkspaceStore } from '../../store/workspaceStore'

const WorkspaceSwitcher = () => {
  const navigate = useNavigate()
  const workspace = useWorkspaceStore((state) => state.workspace)
  const workspaces = useWorkspaceStore((state) => state.workspaces)
  const members = useWorkspaceStore((state) => state.members)
  const switchWorkspace = useWorkspaceStore((state) => state.switchWorkspace)

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelect = (next: Workspace) => {
    setIsOpen(false)
    if (next.id === workspace?.id) return

    switchWorkspace(next)
    // The previous page may point at a board that isn't in the new workspace.
    navigate('/dashboard')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-left transition-colors hover:bg-white/15"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand text-xs font-bold text-white">
          {workspace?.name.charAt(0).toUpperCase() ?? 'W'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{workspace?.name ?? 'Workspace'}</p>
          {members.length > 0 && (
            <p className="text-xs text-white/50">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          )}
        </div>
        <span aria-hidden="true" className="shrink-0 text-xs text-white/50">
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {workspaces.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(item)}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand text-[10px] font-bold text-white">
                {item.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-gray-700">{item.name}</span>
              {item.id === workspace?.id && (
                <span aria-hidden="true" className="text-brand">
                  ✓
                </span>
              )}
            </button>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false)
              navigate('/onboarding')
            }}
            className="mt-1 flex w-full cursor-pointer items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm font-medium text-brand-dark hover:bg-gray-50"
          >
            <span aria-hidden="true">+</span>
            Create workspace
          </button>
        </div>
      )}
    </div>
  )
}

export default WorkspaceSwitcher
