import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.webp'
import Seo from '../components/Seo'
import { getBoards, getWorkspaceMembers, type Workspace } from '../lib/api'
import { useWorkspaceStore } from '../store/workspaceStore'

interface WorkspaceStats {
  members: number
  boards: number
}

const WorkspaceSelector = () => {
  const navigate = useNavigate()
  const workspaces = useWorkspaceStore((state) => state.workspaces)
  const active = useWorkspaceStore((state) => state.workspace)
  const switchWorkspace = useWorkspaceStore((state) => state.switchWorkspace)

  const [stats, setStats] = useState<Record<number, WorkspaceStats>>({})

  useEffect(() => {
    let cancelled = false

    Promise.all(
      workspaces.map(async (workspace) => {
        const [members, boards] = await Promise.all([
          getWorkspaceMembers(workspace.id).catch(() => []),
          getBoards(workspace.id).catch(() => []),
        ])
        return [workspace.id, { members: members.length, boards: boards.length }] as const
      }),
    ).then((entries) => {
      if (!cancelled) setStats(Object.fromEntries(entries))
    })

    return () => {
      cancelled = true
    }
  }, [workspaces])

  const handleSelect = (workspace: Workspace) => {
    switchWorkspace(workspace)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <Seo title="Select your workspace" description="Choose a workspace to continue." />

      <div className="mx-auto max-w-3xl">
        <img src={logo} alt="cardo" className="mx-auto h-9 w-auto" />

        <h1 className="mt-10 text-center text-2xl font-bold text-gray-900">Select your workspace</h1>
        <p className="mt-1 text-center text-sm text-gray-500">Choose a workspace to continue</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {workspaces.map((workspace) => {
            const stat = stats[workspace.id]

            return (
              <button
                key={workspace.id}
                type="button"
                onClick={() => handleSelect(workspace)}
                className={`cursor-pointer rounded-xl border bg-white p-5 text-left transition-shadow hover:shadow-md ${
                  workspace.id === active?.id ? 'border-brand' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                    {workspace.name.charAt(0).toUpperCase()}
                  </span>
                  {workspace.id === active?.id && <span className="text-sm text-brand">✓</span>}
                </div>

                <p className="mt-3 font-semibold text-gray-900">{workspace.name}</p>
                <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{workspace.description}</p>

                <p className="mt-3 text-xs text-gray-400">
                  {stat ? `${stat.members} members · ${stat.boards} boards` : 'Loading…'}
                </p>
              </button>
            )
          })}
        </div>

        <Link
          to="/onboarding"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
        >
          <span aria-hidden="true">+</span> Create a new workspace
        </Link>
      </div>
    </div>
  )
}

export default WorkspaceSelector
