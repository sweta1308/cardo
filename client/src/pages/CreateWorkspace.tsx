import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import onboardingIllustration from '../assets/onboarding-illustration.svg'
import { inputClass, labelClass } from '../components/Auth/formStyles'
import OnboardingShell from '../components/Onboarding/OnboardingShell'
import Seo from '../components/Seo'
import { ApiError, createWorkspace } from '../lib/api'
import { useAuthStore } from '../store/authStore'

const CreateWorkspace = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const firstName = user?.name.split(' ')[0] ?? 'there'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      const workspace = await createWorkspace(name, description)
      toast.success('Workspace created')
      navigate(`/onboarding/board?workspaceId=${workspace.id}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <OnboardingShell stepLabel="Create your first workspace">
      <Seo title="Create your workspace" description="Create your first workspace to start organizing your projects." />

      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-2xl" aria-hidden="true">
        👋
      </span>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">Welcome, {firstName}!</h1>
      <p className="mt-2 text-center text-sm text-gray-500 sm:text-base">
        Let's create your first workspace.
        <br />
        You'll be ready to organize your projects in no time.
      </p>

      <img src={onboardingIllustration} alt="Onboarding illustration" className="w-full max-w-md" />

      <div className="relative z-10 -mt-24 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-lg" aria-hidden="true">
            🏢
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Name your workspace</h2>
            <p className="text-sm text-gray-500">This is the name of your team or organization.</p>
          </div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="workspace-name" className={labelClass}>
              Workspace name
            </label>
            <input
              id="workspace-name"
              name="workspace-name"
              type="text"
              placeholder="e.g. Acme Inc., My Project, Personal"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="workspace-description" className={labelClass}>
              Description
            </label>
            <input
              id="workspace-description"
              name="workspace-description"
              type="text"
              placeholder="What's this workspace for?"
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <p className="text-xs text-gray-500">💡 Don't worry, you can change this later from workspace settings.</p>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !description.trim()}
            className="w-full cursor-pointer rounded-full bg-brand-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creating workspace…' : 'Create workspace →'}
          </button>
        </form>
      </div>
    </OnboardingShell>
  )
}

export default CreateWorkspace
