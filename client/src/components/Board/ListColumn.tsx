import { useState, type DragEvent, type FormEvent } from 'react'
import type { Card } from '../../lib/api'
import type { ListWithCards } from '../../store/boardStore'

interface ListColumnProps {
  list: ListWithCards
  onAddCard: (listId: number, title: string) => void
  onRenameList: (listId: number, name: string) => void
  onDeleteList: (listId: number) => void
  onOpenCard: (card: Card) => void
  onDropCard: (toListId: number, beforeCardId: number | null) => void
  draggingCardId: number | null
  setDraggingCardId: (id: number | null) => void
}

const ListColumn = ({
  list,
  onAddCard,
  onRenameList,
  onDeleteList,
  onOpenCard,
  onDropCard,
  draggingCardId,
  setDraggingCardId,
}: ListColumnProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [name, setName] = useState(list.name)
  const [dropTarget, setDropTarget] = useState<number | 'end' | null>(null)

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAddCard(list.id, title.trim())
    setTitle('')
    setIsAdding(false)
  }

  const handleRename = (e: FormEvent) => {
    e.preventDefault()
    const next = name.trim()
    if (next && next !== list.name) onRenameList(list.id, next)
    setIsRenaming(false)
  }

  const allowDrop = (e: DragEvent) => {
    if (draggingCardId === null) return
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent, beforeCardId: number | null) => {
    if (draggingCardId === null) return
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)
    onDropCard(list.id, beforeCardId)
  }

  return (
    <div
      className="flex w-72 shrink-0 flex-col rounded-xl bg-gray-100 p-3"
      onDragOver={allowDrop}
      onDrop={(e) => handleDrop(e, null)}
      onDragLeave={() => setDropTarget(null)}
    >
      <div className="flex items-center gap-2">
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

        <span className="shrink-0 text-xs text-gray-400">{list.cards.length}</span>

        <button
          type="button"
          onClick={() => onDeleteList(list.id)}
          aria-label={`Delete list ${list.name}`}
          className="shrink-0 cursor-pointer px-1 text-gray-400 hover:text-red-600"
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
              draggable
              onDragStart={() => setDraggingCardId(card.id)}
              onDragEnd={() => {
                setDraggingCardId(null)
                setDropTarget(null)
              }}
              onClick={() => onOpenCard(card)}
              className={`w-full cursor-pointer rounded-lg bg-white p-3 text-left shadow-sm transition-shadow hover:shadow ${
                draggingCardId === card.id ? 'opacity-40' : ''
              }`}
            >
              <p className="text-sm text-gray-800">{card.title}</p>
              {card.due_date && (
                <p className="mt-1 text-xs text-gray-400">Due {new Date(card.due_date).toLocaleDateString()}</p>
              )}
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className="mt-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-brand-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand"
            >
              Add card
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setTitle('')
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
          onClick={() => setIsAdding(true)}
          className="mt-2 cursor-pointer rounded-lg px-2 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        >
          + Add a card
        </button>
      )}
    </div>
  )
}

export default ListColumn
