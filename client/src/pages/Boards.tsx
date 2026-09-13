import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import DashboardLayout from '../components/Dashboard/DashboardLayout'
import Seo from '../components/Seo'
import { ButtonLink } from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { timeAgo } from '../lib/formatDate'
import { useBoardsStore } from '../store/boardsStore'
import { useWorkspaceStore } from '../store/workspaceStore'

type SortKey = 'updated' | 'created' | 'name'

const SORT_LABELS: Record<SortKey, string> = {
  updated: 'Recently updated',
  created: 'Recently created',
  name: 'Name (A–Z)',
}

const Boards = () => {
  const workspace = useWorkspaceStore((state) => state.workspace)
  const boards = useBoardsStore((state) => state.boards)
  const isLoading = useBoardsStore((state) => state.isLoading)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('updated')
  const [isGrid, setIsGrid] = useState(true)

  const visibleBoards = useMemo(() => {
    const term = search.trim().toLowerCase()
    const filtered = term ? boards.filter((board) => board.name.toLowerCase().includes(term)) : boards

    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      const field = sort === 'created' ? 'created_at' : 'updated_at'
      return new Date(b[field]).getTime() - new Date(a[field]).getTime()
    })
  }, [boards, search, sort])

  if (!workspace) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <DashboardLayout>
      <Seo title="Boards" description="View and manage the boards in your workspace." />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
          <p className="mt-1 text-sm text-gray-500">All boards in your workspace</p>
        </div>

        <ButtonLink to={`/boards/new?workspaceId=${workspace.id}`}>+ New Board</ButtonLink>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search boards..."
          aria-label="Search boards"
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-brand"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort boards"
          className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand"
        >
          {Object.entries(SORT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              Sort: {label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setIsGrid((value) => !value)}
          aria-label={isGrid ? 'Switch to list view' : 'Switch to grid view'}
          className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:border-brand hover:text-brand-dark"
        >
          {isGrid ? '☰' : '▦'}
        </button>
      </div>

      {isLoading && boards.length === 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <Skeleton className="h-20 rounded-none" />
              <div className="p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-3 h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleBoards.length === 0 && search ? (
        <p className="mt-8 text-sm text-gray-500">No boards match "{search}".</p>
      ) : isGrid ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleBoards.map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              <div className="h-20" style={{ backgroundColor: board.background }} />
              <div className="p-4">
                <p className="font-semibold text-gray-900">{board.name}</p>
                <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{board.description}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {board.card_count ?? 0} {board.card_count === 1 ? 'card' : 'cards'} · Updated{' '}
                  {timeAgo(board.updated_at)}
                </p>
              </div>
            </Link>
          ))}

          <Link
            to={`/boards/new?workspaceId=${workspace.id}`}
            className="flex min-h-40 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 transition-colors hover:border-brand hover:text-brand-dark"
          >
            <span className="text-xl" aria-hidden="true">
              +
            </span>
            Create new board
          </Link>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {visibleBoards.map((board) => (
            <Link key={board.id} to={`/boards/${board.id}`} className="flex items-center gap-3 p-4 hover:bg-gray-50">
              <span className="h-10 w-10 shrink-0 rounded-lg" style={{ backgroundColor: board.background }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{board.name}</p>
                <p className="truncate text-sm text-gray-500">{board.description}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">Updated {timeAgo(board.updated_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default Boards
