import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getWorkspaceMembers, getWorkspaces, type Workspace, type WorkspaceMember } from '../lib/api'
import { useBoardsStore } from './boardsStore'

interface WorkspaceState {
  workspace: Workspace | null
  // Every workspace the user belongs to. Session-only: refetched on each load.
  workspaces: Workspace[]
  members: WorkspaceMember[]
  // Session-only: whether we've determined the current user's workspace yet.
  isResolved: boolean
  setWorkspace: (workspace: Workspace) => void
  switchWorkspace: (workspace: Workspace) => void
  resolveWorkspace: () => Promise<Workspace | null>
  fetchMembers: (workspaceId: number) => Promise<void>
  clear: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspace: null,
      workspaces: [],
      members: [],
      isResolved: false,

      setWorkspace: (workspace) =>
        set((state) => ({
          workspace,
          isResolved: true,
          workspaces: state.workspaces.some((w) => w.id === workspace.id)
            ? state.workspaces
            : [...state.workspaces, workspace],
        })),

      switchWorkspace: (workspace) => {
        // Drop the previous workspace's data so it can't show under the new one.
        useBoardsStore.getState().reset()
        set({ workspace, members: [] })
      },

      resolveWorkspace: async () => {
        const current = get().workspace
        let active: Workspace | null = current

        try {
          const workspaces = await getWorkspaces()
          // Keep the active workspace if it still exists, so a reordered
          // response (or a new membership) can't move the user elsewhere.
          active = workspaces.find((w) => w.id === current?.id) ?? workspaces[0] ?? null
          set({ workspaces, workspace: active })
        } catch {
          // Leave the workspace unset; routing falls back to onboarding.
        } finally {
          set({ isResolved: true })
        }

        return active
      },

      fetchMembers: async (workspaceId) => {
        const members = await getWorkspaceMembers(workspaceId)
        set({ members })
      },

      clear: () => set({ workspace: null, workspaces: [], members: [], isResolved: false }),
    }),
    { name: 'workspace', partialize: (state) => ({ workspace: state.workspace }) },
  ),
)
