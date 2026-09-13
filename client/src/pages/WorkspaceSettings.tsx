import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/Dashboard/DashboardLayout'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import { useConfirm } from '../components/ui/ConfirmDialog'
import { inputClass, labelClass } from '../components/Auth/formStyles'
import { ApiError, deleteWorkspace, updateWorkspace } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useWorkspaceStore } from '../store/workspaceStore'

const fail = (err: unknown) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong')

type Section = 'general' | 'advanced'

const WorkspaceSettings = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const workspace = useWorkspaceStore((state) => state.workspace)
  const members = useWorkspaceStore((state) => state.members)
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace)
  const resolveWorkspace = useWorkspaceStore((state) => state.resolveWorkspace)

  const { confirm, dialog } = useConfirm()
  const [section, setSection] = useState<Section>('general')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!workspace) return
    setName(workspace.name)
    setDescription(workspace.description)
  }, [workspace])

  if (!workspace) {
    return <Navigate to="/onboarding" replace />
  }

  const role = members.find((m) => m.id === user?.id)?.role
  const canManage = role === 'Owner' || role === 'Admin'

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updated = await updateWorkspace(workspace.id, { name: name.trim(), description: description.trim() })
      setWorkspace(updated)
      toast.success('Workspace updated')
    } catch (err) {
      fail(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    const ok = await confirm({
      title: `Delete "${workspace.name}"?`,
      message: 'Every board, list and card in this workspace will be permanently deleted.',
      confirmLabel: 'Delete workspace',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteWorkspace(workspace.id)
      toast.success('Workspace deleted')
      useWorkspaceStore.setState({ workspace: null, workspaces: [], members: [], isResolved: false })
      const next = await resolveWorkspace()
      navigate(next ? '/dashboard' : '/onboarding', { replace: true })
    } catch (err) {
      fail(err)
    }
  }

  const navItem = (key: Section, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setSection(key)}
      className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        section === key ? 'bg-brand/10 font-semibold text-brand-dark' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )

  return (
    <DashboardLayout>
      {dialog}
      <Seo title="Workspace settings" description="Rename your workspace or delete it." />

      <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
      <p className="mt-1 text-sm text-gray-500">{workspace.name}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[12rem_1fr]">
        <nav className="flex flex-col gap-1 md:sticky md:top-6 md:self-start">
          {navItem('general', 'General')}
          <Link
            to="/members"
            className="rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-gray-100"
          >
            Members
          </Link>
          {role === 'Owner' && navItem('advanced', 'Advanced')}
        </nav>

        {section === 'general' ? (
          <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">General</h2>

            <form className="mt-4 space-y-4" onSubmit={handleSave}>
              <div>
                <label htmlFor="ws-name" className={labelClass}>
                  Workspace name
                </label>
                <input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label htmlFor="ws-description" className={labelClass}>
                  Workspace description
                </label>
                <input
                  id="ws-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                />
              </div>

              <Button type="submit" disabled={isSaving || !name.trim() || !description.trim() || !canManage}>
                {isSaving ? 'Saving…' : 'Save Changes'}
              </Button>

              {!canManage && <p className="text-xs text-gray-400">Only owners and admins can edit this workspace.</p>}
            </form>
          </div>
        ) : (
          <div className="max-w-xl rounded-xl border border-red-200 bg-white p-6">
            <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
            <p className="mt-1 text-sm text-gray-500">
              Deleting this workspace also deletes its boards, lists and cards. This can't be undone.
            </p>
            <Button variant="danger" onClick={handleDeleteWorkspace} className="mt-4">
              Delete workspace
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default WorkspaceSettings
