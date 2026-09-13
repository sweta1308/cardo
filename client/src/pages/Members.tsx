import { useMemo, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/Dashboard/DashboardLayout'
import Seo from '../components/Seo'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useConfirm } from '../components/ui/ConfirmDialog'
import { inputClass } from '../components/Auth/formStyles'
import { ApiError, addWorkspaceMember, removeWorkspaceMember, type Role } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useWorkspaceStore } from '../store/workspaceStore'

const fail = (err: unknown) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong')

const ROLE_TONE: Record<Role, 'brand' | 'sky' | 'neutral'> = {
  Owner: 'brand',
  Admin: 'sky',
  Member: 'neutral',
}

const Members = () => {
  const user = useAuthStore((state) => state.user)
  const workspace = useWorkspaceStore((state) => state.workspace)
  const members = useWorkspaceStore((state) => state.members)
  const fetchMembers = useWorkspaceStore((state) => state.fetchMembers)

  const { confirm, dialog } = useConfirm()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | Role>('All')
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member'>('Member')
  const [isInviting, setIsInviting] = useState(false)

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return members
      .filter((m) => roleFilter === 'All' || m.role === roleFilter)
      .filter((m) => !term || m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term))
  }, [members, search, roleFilter])

  if (!workspace) {
    return <Navigate to="/onboarding" replace />
  }

  const myRole = members.find((m) => m.id === user?.id)?.role
  const canManage = myRole === 'Owner' || myRole === 'Admin'

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
    setIsInviting(true)
    try {
      await addWorkspaceMember(workspace.id, email.trim(), inviteRole)
      await fetchMembers(workspace.id)
      setEmail('')
      setShowInvite(false)
      toast.success('Member added')
    } catch (err) {
      fail(err)
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (userId: number, name: string) => {
    const ok = await confirm({
      title: `Remove ${name}?`,
      message: `They'll lose access to ${workspace.name} and its boards.`,
      confirmLabel: 'Remove',
      danger: true,
    })
    if (!ok) return
    try {
      await removeWorkspaceMember(workspace.id, userId)
      await fetchMembers(workspace.id)
      toast.success('Member removed')
    } catch (err) {
      fail(err)
    }
  }

  return (
    <DashboardLayout>
      {dialog}
      <Seo title="Members" description="People who have access to this workspace." />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="mt-1 text-sm text-gray-500">
            {members.length} {members.length === 1 ? 'member' : 'members'} in {workspace.name}
          </p>
        </div>

        {canManage && <Button onClick={() => setShowInvite((open) => !open)}>+ Invite Member</Button>}
      </div>

      {showInvite && canManage && (
        <form onSubmit={handleInvite} className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
            aria-label="Email address"
            className={`${inputClass} min-w-0 flex-1`}
            autoFocus
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Member')}
            aria-label="Role"
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
          <Button type="submit" disabled={isInviting || !email.trim()}>
            {isInviting ? 'Adding…' : 'Add'}
          </Button>
        </form>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          aria-label="Search members"
          className={`${inputClass} min-w-0 flex-1`}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'All' | Role)}
          aria-label="Filter by role"
          className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
        >
          <option value="All">All Roles</option>
          <option value="Owner">Owner</option>
          <option value="Admin">Admin</option>
          <option value="Member">Member</option>
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="hidden grid-cols-[1fr_10rem_6rem] gap-4 border-b border-gray-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:grid">
          <span>Member</span>
          <span>Role</span>
          <span />
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">No members match your filters.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visible.map((member) => (
              <li key={member.id} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[1fr_10rem_6rem] sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={member.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {member.name}
                      {member.id === user?.id && <span className="ml-1.5 text-xs text-gray-400">(you)</span>}
                    </p>
                    <p className="truncate text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>

                <div>
                  <Badge tone={ROLE_TONE[member.role]}>{member.role}</Badge>
                </div>

                <div className="sm:text-right">
                  {canManage && member.role !== 'Owner' && (
                    <button
                      type="button"
                      onClick={() => handleRemove(member.id, member.name)}
                      className="cursor-pointer text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-400">People must already have a cardo account to be added.</p>
    </DashboardLayout>
  )
}

export default Members
