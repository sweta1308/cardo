import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import BoardMembersModal from '../components/Board/BoardMembersModal'
import BoardSkeleton from '../components/Board/BoardSkeleton'
import CardModal from '../components/Board/CardModal'
import ListColumn from '../components/Board/ListColumn'
import DashboardLayout from '../components/Dashboard/DashboardLayout'
import Seo from '../components/Seo'
import { AvatarGroup } from '../components/ui/Avatar'
import { buttonClass } from '../components/ui/Button'
import { useConfirm } from '../components/ui/ConfirmDialog'
import { ApiError, deleteBoard, updateBoard, type Card } from '../lib/api'
import { BOARD_BACKGROUNDS } from '../lib/boardColors'
import { useBoardStore } from '../store/boardStore'
import { useBoardsStore } from '../store/boardsStore'
import { useWorkspaceStore } from '../store/workspaceStore'

const fail = (err: unknown) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong')

const BoardDetail = () => {
  const navigate = useNavigate()
  const { boardId } = useParams()
  const numericId = Number(boardId)

  const board = useBoardStore((state) => state.board)
  const lists = useBoardStore((state) => state.lists)
  const members = useBoardStore((state) => state.members)
  const isLoading = useBoardStore((state) => state.isLoading)
  const load = useBoardStore((state) => state.load)
  const reset = useBoardStore((state) => state.reset)
  const refreshMembers = useBoardStore((state) => state.refreshMembers)
  const { addList, renameList, removeList, moveList, addCard, editCard, moveCard, removeCard } =
    useBoardStore.getState()

  const workspace = useWorkspaceStore((state) => state.workspace)
  const refreshBoards = useBoardsStore((state) => state.fetchBoards)

  const { confirm, dialog } = useConfirm()
  const [notFound, setNotFound] = useState(false)
  const [openCard, setOpenCard] = useState<Card | null>(null)
  const [addingToList, setAddingToList] = useState<number | null>(null)
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null)
  const [draggingListId, setDraggingListId] = useState<number | null>(null)
  const [showColors, setShowColors] = useState(false)
  const [isAddingList, setIsAddingList] = useState(false)
  const [listName, setListName] = useState('')
  const [isRenamingBoard, setIsRenamingBoard] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [showMembers, setShowMembers] = useState(false)

  useEffect(() => {
    reset()
    setNotFound(false)
    load(numericId).catch((err) => {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true)
        return
      }
      fail(err)
    })
  }, [numericId, load, reset])

  useEffect(() => {
    if (board) setBoardName(board.name)
  }, [board])

  useEffect(() => {
    const clearDrag = () => {
      setDraggingCardId(null)
      setDraggingListId(null)
    }

    document.addEventListener('dragend', clearDrag)
    document.addEventListener('drop', clearDrag)
    return () => {
      document.removeEventListener('dragend', clearDrag)
      document.removeEventListener('drop', clearDrag)
    }
  }, [])

  if (notFound) {
    return <Navigate to="/boards" replace />
  }

  const run = (promise: Promise<unknown>) => promise.catch(fail)

  const handleAddList = (e: FormEvent) => {
    e.preventDefault()
    if (!listName.trim()) return
    run(addList(listName.trim()))
    setListName('')
    setIsAddingList(false)
  }

  const handleRenameBoard = async (e: FormEvent) => {
    e.preventDefault()
    setIsRenamingBoard(false)
    const next = boardName.trim()
    if (!board || !next || next === board.name) return

    const previous = board
    useBoardStore.setState({ board: { ...board, name: next } })

    try {
      await updateBoard(board.id, { name: next })
      if (workspace) refreshBoards(workspace.id).catch(() => {})
    } catch (err) {
      useBoardStore.setState({ board: previous })
      setBoardName(previous.name)
      fail(err)
    }
  }

  const handleChangeBackground = async (background: string) => {
    setShowColors(false)
    if (!board || board.background === background) return

    const previous = board
    // Recolour immediately; the header is the thing being edited.
    useBoardStore.setState({ board: { ...board, background } })

    try {
      await updateBoard(board.id, { background })
      if (workspace) refreshBoards(workspace.id).catch(() => {})
    } catch (err) {
      useBoardStore.setState({ board: previous })
      fail(err)
    }
  }

  const handleDeleteBoard = async () => {
    if (!board) return

    const ok = await confirm({
      title: `Delete "${board.name}"?`,
      message: 'This board and all of its lists and cards will be permanently deleted.',
      confirmLabel: 'Delete board',
      danger: true,
    })
    if (!ok) return

    try {
      await deleteBoard(board.id)
      toast.success('Board deleted')
      if (workspace) refreshBoards(workspace.id).catch(() => {})
      navigate('/boards')
    } catch (err) {
      fail(err)
    }
  }

  const handleDeleteList = async (listId: number) => {
    const list = lists.find((l) => l.id === listId)

    if (list?.cards.length) {
      const ok = await confirm({
        title: `Delete "${list.name}"?`,
        message: `This list and its ${list.cards.length} ${list.cards.length === 1 ? 'card' : 'cards'} will be deleted.`,
        confirmLabel: 'Delete list',
        danger: true,
      })
      if (!ok) return
    }

    run(removeList(listId))
  }

  return (
    <DashboardLayout>
      <Seo title={board?.name ?? 'Board'} description="View your board's lists and cards." />

      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/boards" className="hover:text-gray-600">
          Boards
        </Link>
        <span aria-hidden="true">›</span>
        <span className="text-gray-600">{board?.name ?? '…'}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: board?.background ?? '#05373e' }} />

          {isRenamingBoard ? (
            <form onSubmit={handleRenameBoard}>
              <input
                autoFocus
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onBlur={handleRenameBoard}
                className="rounded-lg border border-brand px-2 py-1 text-xl font-bold text-gray-900 outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsRenamingBoard(true)}
              className="cursor-pointer text-left text-xl font-bold text-gray-900"
              title="Rename board"
            >
              {board?.name ?? 'Loading…'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <AvatarGroup names={members.map((m) => m.name)} />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColors((open) => !open)}
              aria-expanded={showColors}
              className={buttonClass('secondary', 'sm')}
            >
              Background
            </button>

            {showColors && (
              <div className="absolute right-0 z-20 mt-1 flex w-48 flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                {BOARD_BACKGROUNDS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use ${color} background`}
                    aria-pressed={board?.background === color}
                    onClick={() => handleChangeBackground(color)}
                    className={`h-7 w-7 cursor-pointer rounded-full ${
                      board?.background === color ? 'ring-2 ring-brand-dark ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>

          <button type="button" onClick={() => setShowMembers(true)} className={buttonClass('primary', 'sm')}>
            + Invite
          </button>

          <button type="button" onClick={handleDeleteBoard} className={buttonClass('ghost', 'sm')}>
            Delete
          </button>
        </div>
      </div>

      {isLoading && lists.length === 0 ? (
        <BoardSkeleton />
      ) : (
        <div className="mt-6 flex items-start gap-4 overflow-x-auto pb-4">
          {lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              onAddCard={setAddingToList}
              onRenameList={(listId, name) => run(renameList(listId, name))}
              onDeleteList={handleDeleteList}
              onOpenCard={setOpenCard}
              onDropCard={(cardId, toListId, beforeCardId) => run(moveCard(cardId, toListId, beforeCardId))}
              onDropList={(listId, beforeListId) => run(moveList(listId, beforeListId))}
              draggingCardId={draggingCardId}
              setDraggingCardId={setDraggingCardId}
              draggingListId={draggingListId}
              setDraggingListId={setDraggingListId}
            />
          ))}

          <div
            className={`w-72 shrink-0 rounded-xl ${
              draggingListId !== null ? 'border-l-2 border-brand' : ''
            }`}
            onDragOver={(e) => {
              if (draggingListId !== null) e.preventDefault()
            }}
            onDrop={(e) => {
              if (draggingListId === null) return
              e.preventDefault()
              const listId = draggingListId
              setDraggingListId(null)
              run(moveList(listId, null))
            }}
          >
            {isAddingList ? (
              <form onSubmit={handleAddList} className="rounded-xl bg-gray-100 p-3">
                <input
                  autoFocus
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="List name"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg bg-brand-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand"
                  >
                    Add list
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingList(false)
                      setListName('')
                    }}
                    className="cursor-pointer px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingList(true)}
                className="w-full cursor-pointer rounded-xl border-2 border-dashed border-gray-300 px-3 py-3 text-sm font-medium text-gray-500 hover:border-brand hover:text-brand-dark"
              >
                + Add a list
              </button>
            )}
          </div>
        </div>
      )}

      {dialog}

      {showMembers && board && (
        <BoardMembersModal
          boardId={board.id}
          boardName={board.name}
          members={members}
          canManage={board.role === 'Owner' || board.role === 'Admin'}
          onClose={() => setShowMembers(false)}
          onChanged={() => refreshMembers().catch(fail)}
        />
      )}

      {(openCard || addingToList !== null) && (
        <CardModal
          card={openCard}
          boardMembers={members}
          onClose={() => {
            setOpenCard(null)
            setAddingToList(null)
          }}
          onSubmit={(draft) => {
            const editing = openCard
            const targetList = addingToList

            setOpenCard(null)
            setAddingToList(null)

            if (editing) run(editCard(editing.id, draft))
            else if (targetList !== null) run(addCard(targetList, draft))
          }}
          onDelete={
            openCard
              ? () => {
                  const editing = openCard
                  setOpenCard(null)
                  run(removeCard(editing.id))
                }
              : undefined
          }
        />
      )}
    </DashboardLayout>
  )
}

export default BoardDetail
