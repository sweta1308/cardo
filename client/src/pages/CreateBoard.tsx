import { useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { inputClass, labelClass } from '../components/Auth/formStyles'
import OnboardingShell from '../components/Onboarding/OnboardingShell'
import Seo from '../components/Seo'
import { ApiError, createBoard } from '../lib/api'

const BACKGROUND_OPTIONS = ['#0079BF', '#D29034', '#519839', '#B04632', '#89609E', '#CD5A91', '#4BBF6B', '#00AECC']

const CreateBoard = () => {
  const [searchParams] = useSearchParams()
  const workspaceId = Number(searchParams.get('workspaceId'))

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [background, setBackground] = useState(BACKGROUND_OPTIONS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  if (!workspaceId) {
    return <Navigate to="/onboarding" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      await createBoard({ workspace_id: workspaceId, name, description, background })
      toast.success('Board created')
      setIsDone(true)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <OnboardingShell stepLabel="Create your first board">
      <Seo title="Create your board" description="Create your first board to start organizing your tasks." />

      {isDone ? (
        <div className="w-full max-w-md text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl mx-auto" aria-hidden="true">
            🎉
          </span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">"{name}" is ready!</h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Your board has been created. The board view is coming soon — check back shortly.
          </p>
        </div>
      ) : (
        <>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl" aria-hidden="true">
            🧱
          </span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">Create a board</h1>
          <p className="mt-2 text-center text-sm text-gray-500 sm:text-base">
            Boards are where your lists and cards live.
          </p>

          <div className="relative z-10 mt-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="board-name" className={labelClass}>
                  Board name
                </label>
                <input
                  id="board-name"
                  name="board-name"
                  type="text"
                  placeholder="e.g. Sprint Board, Product Launch"
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="board-description" className={labelClass}>
                  Description
                </label>
                <input
                  id="board-description"
                  name="board-description"
                  type="text"
                  placeholder="What's this board for?"
                  className={inputClass}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <span className={labelClass}>Background</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BACKGROUND_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Select ${color} background`}
                      aria-pressed={background === color}
                      onClick={() => setBackground(color)}
                      className={`h-8 w-8 cursor-pointer rounded-full transition-shadow ${
                        background === color ? 'ring-2 ring-brand-dark ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !description.trim()}
                className="w-full cursor-pointer rounded-full bg-brand-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Creating board…' : 'Create board →'}
              </button>
            </form>
          </div>
        </>
      )}
    </OnboardingShell>
  )
}

export default CreateBoard
