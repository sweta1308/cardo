import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import {
  ApiError,
  assignCardMember,
  getCardMembers,
  unassignCardMember,
  type BoardMember,
  type Card,
  type CardAssignee,
} from '../../lib/api'
import { inputClass, labelClass } from '../Auth/formStyles'

export interface CardDraft {
  title: string
  description: string
  due_date: string | null
  assigneeEmails: string[]
}

interface CardModalProps {
  card: Card | null
  boardMembers: BoardMember[]
  onClose: () => void
  onSubmit: (draft: CardDraft) => void
  onDelete?: () => void
}

const toDateInput = (value: string | null | undefined) => (value ? value.slice(0, 10) : '')

const CardModal = ({ card, boardMembers, onClose, onSubmit, onDelete }: CardModalProps) => {
  const isEditing = card !== null

  const [title, setTitle] = useState(card?.title ?? '')
  const [description, setDescription] = useState(card?.description ?? '')
  const [dueDate, setDueDate] = useState(toDateInput(card?.due_date))
  const [assignees, setAssignees] = useState<CardAssignee[]>([])

  useEffect(() => {
    if (!card) return
    getCardMembers(card.id)
      .then(setAssignees)
      .catch(() => {})
  }, [card])

  const unassigned = boardMembers.filter((member) => !assignees.some((a) => a.id === member.id))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      assigneeEmails: assignees.map((a) => a.email),
    })
  }

  const handleAssign = async (email: string) => {
    const member = boardMembers.find((m) => m.email === email)
    if (!member) return

    if (!card) {
      setAssignees((current) => [...current, { id: member.id, name: member.name, email: member.email }])
      return
    }

    try {
      await assignCardMember(card.id, email)
      setAssignees(await getCardMembers(card.id))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  }

  const handleUnassign = async (userId: number) => {
    if (!card) {
      setAssignees((current) => current.filter((a) => a.id !== userId))
      return
    }

    try {
      await unassignCardMember(card.id, userId)
      setAssignees((current) => current.filter((a) => a.id !== userId))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-900">{isEditing ? 'Card details' : 'Add a card'}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="card-title" className={labelClass}>
              Title
            </label>
            <input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="card-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="card-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail…"
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <label htmlFor="card-due" className={labelClass}>
              Due date
            </label>
            <input
              id="card-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <span className={labelClass}>Assignees</span>

              {assignees.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {assignees.map((assignee) => (
                    <li
                      key={assignee.id}
                      className="flex items-center gap-1.5 rounded-full bg-brand/10 py-1 pl-2 pr-1 text-xs text-brand-dark"
                    >
                      <span className="font-medium">{assignee.name}</span>
                      <button
                        type="button"
                        onClick={() => handleUnassign(assignee.id)}
                        aria-label={`Unassign ${assignee.name}`}
                        className="cursor-pointer rounded-full px-1 text-brand-dark/60 hover:text-red-600"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {unassigned.length > 0 ? (
                <select
                  value=""
                  onChange={(e) => handleAssign(e.target.value)}
                  aria-label="Assign a board member"
                  className={`${inputClass} mt-2 cursor-pointer`}
                >
                  <option value="">Assign someone…</option>
                  {unassigned.map((member) => (
                    <option key={member.id} value={member.email}>
                      {member.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-2 text-xs text-gray-400">
                  {assignees.length ? 'Everyone on this board is assigned.' : 'Add people to the board to assign them.'}
                </p>
              )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700"
              >
                Delete card
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={!title.trim()}
              className="cursor-pointer rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? 'Save' : 'Add card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CardModal
