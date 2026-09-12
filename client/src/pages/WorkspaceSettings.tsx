import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/Dashboard/DashboardLayout'
import Seo from '../components/Seo'
import { inputClass, labelClass } from '../components/Auth/formStyles'
import {
  ApiError,
  addWorkspaceMember,
  deleteWorkspace,
  removeWorkspaceMember,
  updateWorkspace,
} from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useWorkspaceStore } from '../store/workspaceStore'

const fail = (err: unknown) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong')

const WorkspaceSettings = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const workspace = useWorkspaceStore((state) => state.workspace)
  const members = useWorkspaceStore((state) => state.members)
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace)
  const fetchMembers = useWorkspaceStore((state) => state.fetchMembers)
  const resolveWorkspace = useWorkspaceStore((state) => state.resolveWorkspace)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member'>('Member')
  const [isInviting, setIsInviting] = useState(false)

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

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
    setIsInviting(true)
    try {
      await addWorkspaceMember(workspace.id, inviteEmail.trim(), inviteRole)
      await fetchMembers(workspace.id)
      setInviteEmail('')
      toast.success('Member added')
    } catch (err) {
      fail(err)
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (userId: number, memberName: string) => {
    if (!window.confirm(`Remove ${memberName} from ${workspace.name}?`)) return
    try {
      await removeWorkspaceMember(workspace.id, userId)
      await fetchMembers(workspace.id)
      toast.success('Member removed')
    } catch (err) {
      fail(err)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!window.confirm(`Delete "${workspace.name}"? Its boards, lists and cards go with it.`)) return
    try {
      await deleteWorkspace(workspace.id)
      toast.success('Workspace deleted')
      // Fall back to whatever workspace is left, or onboarding if none.
      useWorkspaceStore.setState({ workspace: null, workspaces: [], members: [], isResolved: false })
      const next = await resolveWorkspace()
      navigate(next ? '/dashboard' : '/onboarding', { replace: true })
    } catch (err) {
      fail(err)
    }
  }

  return (
    <DashboardLayout>
      <Seo title="Workspace settings" description="Rename your workspace, manage members, or delete it." />

      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Workspace settings</h1>
      <p className="mt-1 text-sm text-gray-500">{workspace.name}</p>

      <div className="mt-6 max-w-xl rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Details</h2>

        <form className="mt-4 space-y-4" onSubmit={handleSave}>
          <div>
            <label htmlFor="ws-name" className={labelClass}>
              Name
            </label>
            <input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="ws-description" className={labelClass}>
              Description
            </label>
            <input
              id="ws-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving || !name.trim() || !description.trim() || !canManage}
            className="cursor-pointer rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>

          {!canManage && <p className="text-xs text-gray-400">Only owners and admins can edit this workspace.</p>}
        </form>
      </div>

      <div className="mt-6 max-w-xl rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Members</h2>

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
                  onClick={() => handleRemoveMember(member.id, member.name)}
                  className="shrink-0 cursor-pointer text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {canManage && (
          <form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={handleInvite}>
            <div className="min-w-0 flex-1">
              <label htmlFor="invite-email" className={labelClass}>
                Add a member by email
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className={inputClass}
              />
            </div>

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Member')}
              aria-label="Member role"
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={isInviting || !inviteEmail.trim()}
              className="cursor-pointer rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isInviting ? 'Adding…' : 'Add'}
            </button>
          </form>
        )}

        <p className="mt-3 text-xs text-gray-400">People must already have a cardo account to be added.</p>
      </div>

      {role === 'Owner' && (
        <div className="mt-6 max-w-xl rounded-xl border border-red-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
          <p className="mt-1 text-sm text-gray-500">
            Deleting this workspace also deletes its boards, lists and cards. This can't be undone.
          </p>
          <button
            type="button"
            onClick={handleDeleteWorkspace}
            className="mt-4 cursor-pointer rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete workspace
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}

export default WorkspaceSettings
