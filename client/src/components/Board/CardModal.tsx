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
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">{isEditing ? 'Card details' : 'Add a card'}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
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
                      className="flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-1 pr-1 text-xs text-gray-700"
                    >
                      <Avatar name={assignee.name} size="sm" />
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

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
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

            <Button type="submit" disabled={!title.trim()}>
              {isEditing ? 'Save' : 'Add card'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CardModal
