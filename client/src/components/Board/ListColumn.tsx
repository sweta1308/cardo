import { useState, type DragEvent, type FormEvent } from 'react'
import type { Card } from '../../lib/api'
import { isDraft, type ListWithCards } from '../../store/boardStore'

interface ListColumnProps {
  list: ListWithCards
  onAddCard: (listId: number) => void
  onRenameList: (listId: number, name: string) => void
  onDeleteList: (listId: number) => void
  onOpenCard: (card: Card) => void
  onDropCard: (cardId: number, toListId: number, beforeCardId: number | null) => void
  onDropList: (listId: number, beforeListId: number | null) => void
  draggingCardId: number | null
  setDraggingCardId: (id: number | null) => void
  draggingListId: number | null
  setDraggingListId: (id: number | null) => void
}

const ListColumn = ({
  list,
  onAddCard,
  onRenameList,
  onDeleteList,
  onOpenCard,
  onDropCard,
  onDropList,
  draggingCardId,
  setDraggingCardId,
  draggingListId,
  setDraggingListId,
}: ListColumnProps) => {
  const [isRenaming, setIsRenaming] = useState(false)
  const [name, setName] = useState(list.name)
  const [dropTarget, setDropTarget] = useState<number | 'end' | null>(null)

  const handleRename = (e: FormEvent) => {
    e.preventDefault()
    const next = name.trim()
    if (next && next !== list.name) onRenameList(list.id, next)
    setIsRenaming(false)
  }

  const allowDrop = (e: DragEvent) => {
    if (draggingCardId === null && draggingListId === null) return
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent, beforeCardId: number | null) => {
    if (draggingCardId === null && draggingListId === null) return
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)

    if (draggingListId !== null) {
      const listId = draggingListId
      setDraggingListId(null)
      if (listId !== list.id) onDropList(listId, list.id)
      return
    }

    const cardId = draggingCardId
    setDraggingCardId(null)
    if (cardId !== null) onDropCard(cardId, list.id, beforeCardId)
  }

  const isDraggedList = draggingListId === list.id
  const isSaving = isDraft(list.id)

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-xl bg-gray-100 p-3 ${isDraggedList ? 'opacity-40' : ''} ${
        draggingListId !== null && !isDraggedList ? 'border-l-2 border-brand' : ''
      }`}
      onDragOver={allowDrop}
      onDrop={(e) => handleDrop(e, null)}
      onDragLeave={() => setDropTarget(null)}
    >
      <div
        className="flex items-center gap-2"
        draggable={!isRenaming && !isSaving}
        onDragStart={(e) => {
          e.stopPropagation()
          setDraggingListId(list.id)
        }}
        onDragEnd={() => setDraggingListId(null)}
        title="Drag to reorder list"
      >
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex-1">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRename}
              className="w-full rounded border border-brand bg-white px-2 py-1 text-sm font-semibold outline-none"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsRenaming(true)}
            className="flex-1 cursor-pointer truncate text-left text-sm font-semibold text-gray-800"
            title="Rename list"
          >
            {list.name}
          </button>
        )}

        <span className="shrink-0 text-xs text-gray-400">{isSaving ? 'Saving…' : list.cards.length}</span>

        <button
          type="button"
          onClick={() => onDeleteList(list.id)}
          disabled={isSaving}
          aria-label={`Delete list ${list.name}`}
          className="shrink-0 cursor-pointer px-1 text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ×
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {list.cards.map((card) => (
          <div
            key={card.id}
            onDragOver={(e) => {
              allowDrop(e)
              if (draggingCardId !== null && draggingCardId !== card.id) setDropTarget(card.id)
            }}
            onDrop={(e) => handleDrop(e, card.id)}
            className={dropTarget === card.id ? 'border-t-2 border-brand pt-1' : ''}
          >
            <button
              type="button"
              draggable={!isDraft(card.id)}
              disabled={isDraft(card.id)}
              onDragStart={(e) => {
                e.stopPropagation()
                setDraggingCardId(card.id)
              }}
              onDragEnd={() => {
                setDraggingCardId(null)
                setDropTarget(null)
              }}
              onClick={() => onOpenCard(card)}
              className={`w-full cursor-pointer rounded-lg bg-white p-3 text-left shadow-sm transition-shadow hover:shadow ${
                draggingCardId === card.id ? 'opacity-40' : ''
              } ${isDraft(card.id) ? 'cursor-progress opacity-60' : ''}`}
            >
              <p className="text-sm text-gray-800">{card.title}</p>
              {isDraft(card.id) ? (
                <p className="mt-1 text-xs text-gray-400">Saving…</p>
              ) : (
                card.due_date && (
                  <p className="mt-1 text-xs text-gray-400">Due {new Date(card.due_date).toLocaleDateString()}</p>
                )
              )}
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddCard(list.id)}
        disabled={isSaving}
        className="mt-2 cursor-pointer rounded-lg px-2 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Add a card
      </button>
    </div>
  )
}

export default ListColumn
