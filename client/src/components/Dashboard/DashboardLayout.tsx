import { useEffect, type ReactNode } from 'react'
import logo from '../../assets/logo.webp'
import UserBadge from '../UserBadge'
import DashboardSidebar from './DashboardSidebar'
import { useBoardsStore } from '../../store/boardsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const workspace = useWorkspaceStore((state) => state.workspace)
  const fetchMembers = useWorkspaceStore((state) => state.fetchMembers)
  const fetchBoards = useBoardsStore((state) => state.fetchBoards)

  useEffect(() => {
    if (!workspace) return
    fetchBoards(workspace.id).catch(() => {})
    fetchMembers(workspace.id).catch(() => {})
  }, [workspace, fetchBoards, fetchMembers])

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

        <main className="flex-1 px-4 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
