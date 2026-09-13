import { Link, Navigate } from 'react-router-dom'
import DashboardLayout from '../components/Dashboard/DashboardLayout'
import Seo from '../components/Seo'
import Avatar from '../components/ui/Avatar'
import { ButtonLink } from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { timeAgo } from '../lib/formatDate'
import { useAuthStore } from '../store/authStore'
import { useBoardsStore } from '../store/boardsStore'
import { useWorkspaceStore } from '../store/workspaceStore'

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const StatCard = ({ label, value, loading }: { label: string; value: string; loading: boolean }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    {loading ? (
      <Skeleton className="mt-3 h-7 w-12" />
    ) : (
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    )}
  </div>
)

const Dashboard = () => {
  const user = useAuthStore((state) => state.user)
  const workspace = useWorkspaceStore((state) => state.workspace)
  const members = useWorkspaceStore((state) => state.members)
  const boards = useBoardsStore((state) => state.boards)
  const isLoading = useBoardsStore((state) => state.isLoading)

  if (!workspace) {
    return <Navigate to="/onboarding" replace />
  }

  const pendingData = isLoading && boards.length === 0
  const count = (value: number) => (pendingData ? '…' : String(value))

  const firstName = user?.name.split(' ')[0] ?? 'there'
  const memberName = (id: number) => (id === user?.id ? 'You' : (members.find((m) => m.id === id)?.name ?? 'Someone'))

  const recentBoards = [...boards]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <DashboardLayout>
      <Seo title="Dashboard" description="An overview of what's happening in your workspace." />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {firstName}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here's what's happening in {workspace.name}.</p>
        </div>

        <ButtonLink to={`/boards/new?workspaceId=${workspace.id}`}>+ New Board</ButtonLink>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Boards" value={count(boards.length)} loading={pendingData} />
        <StatCard label="Members" value={count(members.length)} loading={pendingData} />
        <StatCard label="Cards" value={count(boards.reduce((total, b) => total + (b.card_count ?? 0), 0))} loading={pendingData} />
        <StatCard label="Lists" value={count(boards.reduce((total, b) => total + (b.list_count ?? 0), 0))} loading={pendingData} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <section>
          <h2 className="text-base font-semibold text-gray-900">Recently created boards</h2>

          <div className="mt-3 rounded-xl border border-gray-200 bg-white">
            {pendingData ? (
              <ul className="divide-y divide-gray-100">
                {Array.from({ length: 4 }).map((_, index) => (
                  <li key={index} className="flex items-center gap-3 px-5 py-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="mt-2 h-3 w-20" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : recentBoards.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">Nothing here yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentBoards.map((board) => (
                  <li key={board.id} className="flex items-center gap-3 px-5 py-4">
                    <Avatar name={memberName(board.created_by)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-gray-700">
                        <span className="font-medium">{memberName(board.created_by)}</span> created{' '}
                        <Link to={`/boards/${board.id}`} className="font-medium text-brand hover:text-brand-dark">
                          {board.name}
                        </Link>
                      </p>
                      <p className="text-xs text-gray-400">{timeAgo(board.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">My Boards</h2>

          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-2">
            {boards.slice(0, 5).map((board) => (
              <Link
                key={board.id}
                to={`/boards/${board.id}`}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-50"
              >
                <span className="h-9 w-9 shrink-0 rounded-lg" style={{ backgroundColor: board.background }} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{board.name}</p>
                  <p className="truncate text-xs text-gray-400">
                    {board.card_count ?? 0} {board.card_count === 1 ? 'card' : 'cards'}
                  </p>
                </div>
              </Link>
            ))}

            <Link
              to="/boards"
              className="block rounded-lg p-2.5 text-center text-sm font-semibold text-brand hover:text-brand-dark"
            >
              View all boards
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
