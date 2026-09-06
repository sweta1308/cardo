import { Link, Navigate } from 'react-router-dom'
import DashboardLayout from '../components/Dashboard/DashboardLayout'
import Seo from '../components/Seo'
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

interface StatCardProps {
  label: string
  value: string
  hint?: string
  pending?: boolean
}

const StatCard = ({ label, value, hint, pending }: StatCardProps) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <p className="flex items-center gap-2 text-xs font-medium text-gray-500">
      {label}
      {pending && (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-400">
          Soon
        </span>
      )}
    </p>
    <p className={`mt-2 text-2xl font-bold ${pending ? 'text-gray-300' : 'text-gray-900'}`}>{value}</p>
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
)

const Dashboard = () => {
  const user = useAuthStore((state) => state.user)
  const workspace = useWorkspaceStore((state) => state.workspace)
  const members = useWorkspaceStore((state) => state.members)
  const boards = useBoardsStore((state) => state.boards)

  if (!workspace) {
    return <Navigate to="/onboarding" replace />
  }

  const firstName = user?.name.split(' ')[0] ?? 'there'
  const memberName = (id: number) => (id === user?.id ? 'You' : (members.find((m) => m.id === id)?.name ?? 'Someone'))

  const activity = [...boards]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <DashboardLayout>
      <Seo title="Dashboard" description="An overview of what's happening in your workspace." />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {greeting()}, {firstName}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here's what's happening in {workspace.name}.</p>
        </div>

        <Link
          to={`/boards/new?workspaceId=${workspace.id}`}
          className="rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand"
        >
          + New Board
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Boards" value={String(boards.length)} />
        <StatCard label="Members" value={String(members.length)} />
        <StatCard label="Tasks" value="—" hint="Needs lists & cards" pending />
        <StatCard label="Completed" value="—" hint="Needs lists & cards" pending />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <section>
          <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>

          <div className="mt-3 rounded-xl border border-gray-200 bg-white">
            {activity.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">Nothing here yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {activity.map((board) => (
                  <li key={board.id} className="flex items-center gap-3 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand-dark">
                      {memberName(board.created_by).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-gray-700">
                        <span className="font-medium">{memberName(board.created_by)}</span> created "{board.name}"
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
          <h2 className="text-sm font-semibold text-gray-900">My Boards</h2>

          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-2">
            {boards.slice(0, 4).map((board) => (
              <Link
                key={board.id}
                to={`/boards/${board.id}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
              >
                <span className="h-9 w-9 shrink-0 rounded-lg" style={{ backgroundColor: board.background }} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{board.name}</p>
                  <p className="truncate text-xs text-gray-400">Updated {timeAgo(board.updated_at)}</p>
                </div>
              </Link>
            ))}

            <Link
              to="/boards"
              className="block rounded-lg p-2 text-center text-sm font-semibold text-brand hover:text-brand-dark"
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
