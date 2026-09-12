import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { ApiError, addBoardMember, removeBoardMember, type BoardMember } from '../../lib/api'
import { inputClass, labelClass } from '../Auth/formStyles'

interface BoardMembersModalProps {
  boardId: number
  boardName: string
  members: BoardMember[]
  canManage: boolean
  onClose: () => void
  onChanged: () => void
}

const fail = (err: unknown) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong')

const BoardMembersModal = ({
  boardId,
  boardName,
  members,
  canManage,
  onClose,
  onChanged,
}: BoardMembersModalProps) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'Admin' | 'Member'>('Member')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      await addBoardMember(boardId, email.trim(), role)
      setEmail('')
      toast.success('Member added')
      onChanged()
    } catch (err) {
      fail(err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemove = async (userId: number, name: string) => {
    if (!window.confirm(`Remove ${name} from ${boardName}?`)) return
    try {
      await removeBoardMember(boardId, userId)
      toast.success('Member removed')
      onChanged()
    } catch (err) {
      fail(err)
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
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Board members</h2>
            <p className="text-xs text-gray-500">Who can see and edit {boardName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <ul className="mt-4 divide-y divide-gray-100">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand-dark">
                {member.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{member.name}</p>
                <p className="truncate text-xs text-gray-500">{member.email}</p>
              </div>
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{member.role}</span>
              {canManage && member.role !== 'Owner' && (
                <button
                  type="button"
                  onClick={() => handleRemove(member.id, member.name)}
                  className="shrink-0 cursor-pointer text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {canManage ? (
          <form className="mt-4 space-y-3" onSubmit={handleAdd}>
            <div>
              <label htmlFor="board-member-email" className={labelClass}>
                Add a member by email
              </label>
              <input
                id="board-member-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'Admin' | 'Member')}
                aria-label="Board role"
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>

              <button
                type="submit"
                disabled={isAdding || !email.trim()}
                className="cursor-pointer rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAdding ? 'Adding…' : 'Add'}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-xs text-gray-400">Only the board owner and admins can manage members.</p>
        )}
      </div>
    </div>
  )
}

export default BoardMembersModal
