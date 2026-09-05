import { useState, type FormEvent } from 'react'
import logo from '../assets/logo.webp'
import logoWhite from '../assets/logo-white.webp'
import onboardingIllustration from '../assets/onboarding-illustration.svg'
import { inputClass, labelClass } from '../components/Auth/formStyles'
import Seo from '../components/Seo'
import { getStoredUser } from '../lib/auth'

const CreateWorkspace = () => {
  const user = getStoredUser()
  const firstName = user?.name.split(' ')[0] ?? 'there'
  const initial = firstName.charAt(0).toUpperCase()

  const [workspaceName, setWorkspaceName] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="grid min-h-screen bg-gray-50 md:grid-cols-[16rem_1fr]">
      <Seo title="Create your workspace" description="Create your first workspace to start organizing your projects." />

      <aside className="hidden flex-col justify-between bg-brand-dark px-5 py-6 text-white md:sticky md:top-0 md:flex md:h-screen">
        <div>
          <img src={logoWhite} alt="cardo" className="h-12 w-auto" />

          <div className="mt-10">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <span aria-hidden="true">🪄</span> Getting started
            </p>
            <div className="mt-3 border-l-2 border-white/30 pl-3">
              <p className="text-sm text-white/90">Create your first workspace</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:px-10">
          <img src={logo} alt="cardo" className="h-8 w-auto md:hidden" />

          <div className="ml-auto flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white">
              {initial}
            </span>
            <span className="text-sm font-medium text-gray-700">{firstName}</span>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
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

            <form className="mt-5" onSubmit={handleSubmit}>
              <label htmlFor="workspace-name" className={labelClass}>
                Workspace name
              </label>
              <input
                id="workspace-name"
                name="workspace-name"
                type="text"
                placeholder="e.g. Acme Inc., My Project, Personal"
                className={inputClass}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 Don't worry, you can change this later from workspace settings.
              </p>

              <button
                type="submit"
                disabled={!workspaceName.trim()}
                className="mt-6 w-full cursor-pointer rounded-full bg-brand-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create workspace →
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateWorkspace
