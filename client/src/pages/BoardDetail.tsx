import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/Dashboard/DashboardLayout'
import Seo from '../components/Seo'
import { ApiError, getBoard, type BoardWithRole } from '../lib/api'

const BoardDetail = () => {
  const { boardId } = useParams()
  const [board, setBoard] = useState<BoardWithRole | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getBoard(Number(boardId))
      .then(setBoard)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
          return
        }
        toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
      })
  }, [boardId])

  if (notFound) {
    return <Navigate to="/boards" replace />
  }

  return (
    <DashboardLayout>
      <Seo title={board?.name ?? 'Board'} description="View your board's lists and cards." />

      <div
        className="flex h-24 flex-col justify-center rounded-xl px-6 text-white"
        style={{ backgroundColor: board?.background ?? '#05373e' }}
      >
        <h1 className="text-lg font-bold sm:text-xl">{board?.name ?? 'Loading…'}</h1>
        {board && <p className="text-sm text-white/80">{board.description}</p>}
      </div>

      <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-center">
        <span className="text-2xl" aria-hidden="true">
          🗒️
        </span>
        <p className="mt-2 text-sm font-medium text-gray-500">No lists yet</p>
        <p className="mt-1 text-sm text-gray-400">Lists and cards are coming soon.</p>
      </div>
    </DashboardLayout>
  )
}

export default BoardDetail
