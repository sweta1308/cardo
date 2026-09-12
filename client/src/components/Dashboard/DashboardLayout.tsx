import { useEffect, useState, type ReactNode } from 'react'
import logo from '../../assets/logo.webp'
import UserBadge from '../UserBadge'
import DashboardSidebar from './DashboardSidebar'
import { ApiError } from '../../lib/api'
import { useBoardsStore } from '../../store/boardsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const workspace = useWorkspaceStore((state) => state.workspace)
  const fetchMembers = useWorkspaceStore((state) => state.fetchMembers)
  const resolveWorkspace = useWorkspaceStore((state) => state.resolveWorkspace)
  const fetchBoards = useBoardsStore((state) => state.fetchBoards)

  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!workspace) return

    setError(null)
    Promise.all([fetchBoards(workspace.id), fetchMembers(workspace.id)]).catch((err: unknown) => {
      if (err instanceof ApiError && err.status === 404) {
        resolveWorkspace().catch(() => setError("Couldn't reach the server."))
        return
      }

      setError(err instanceof ApiError && err.status ? err.message : "Couldn't reach the server.")
    })
  }, [workspace, fetchBoards, fetchMembers, resolveWorkspace, retryCount])

  return (
    <div className="grid min-h-screen bg-gray-50 md:grid-cols-[16rem_1fr]">
      <DashboardSidebar />

      <div className="flex flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:px-10">
          <img src={logo} alt="cardo" className="h-8 w-auto md:hidden" />
          <div className="ml-auto">
            <UserBadge />
          </div>
        </header>

        {error && (
          <div className="flex flex-wrap items-center gap-3 border-b border-red-100 bg-red-50 px-4 py-3 sm:px-10">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="cursor-pointer rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <main className="flex-1 px-4 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
