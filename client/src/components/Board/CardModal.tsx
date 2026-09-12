import { useState, type FormEvent } from 'react'
import type { Card } from '../../lib/api'
import { inputClass, labelClass } from '../Auth/formStyles'

interface CardModalProps {
  card: Card
  onClose: () => void
  onSave: (patch: { title?: string; description?: string; due_date?: string | null }) => void
  onDelete: () => void
}

const toDateInput = (value: string | null) => (value ? value.slice(0, 10) : '')

const CardModal = ({ card, onClose, onSave, onDelete }: CardModalProps) => {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [dueDate, setDueDate] = useState(toDateInput(card.due_date))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      description,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    })
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
          <h2 className="text-sm font-semibold text-gray-900">Card details</h2>
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

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onDelete}
              className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700"
            >
              Delete card
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className="cursor-pointer rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CardModal
