import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getWorkspaceMembers, getWorkspaces, type Workspace, type WorkspaceMember } from '../lib/api'

interface WorkspaceState {
  workspace: Workspace | null
  members: WorkspaceMember[]
  // Session-only: whether we've determined the current user's workspace yet.
  isResolved: boolean
  setWorkspace: (workspace: Workspace) => void
  resolveWorkspace: () => Promise<Workspace | null>
  fetchMembers: (workspaceId: number) => Promise<void>
  clear: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspace: null,
      members: [],
      isResolved: false,
      setWorkspace: (workspace) => set({ workspace, isResolved: true }),
      fetchMembers: async (workspaceId) => {
        const members = await getWorkspaceMembers(workspaceId)
        set({ members })
      },
      resolveWorkspace: async () => {
        let workspace: Workspace | null = null
        try {
          const workspaces = await getWorkspaces()
          workspace = workspaces[0] ?? null
          set({ workspace })
        } catch {
          // Leave the workspace unset; routing falls back to onboarding.
        } finally {
          set({ isResolved: true })
        }
        return workspace
      },
      clear: () => set({ workspace: null, isResolved: false }),
    }),
    { name: 'workspace', partialize: (state) => ({ workspace: state.workspace }) },
  ),
)
