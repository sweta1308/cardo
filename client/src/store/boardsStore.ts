import { create } from 'zustand'
import { getBoards, type BoardWithRole } from '../lib/api'

interface BoardsState {
  boards: BoardWithRole[]
  isLoading: boolean
  fetchBoards: (workspaceId: number) => Promise<void>
  reset: () => void
}

export const useBoardsStore = create<BoardsState>((set) => ({
  boards: [],
  isLoading: false,
  reset: () => set({ boards: [], isLoading: false }),
  fetchBoards: async (workspaceId) => {
    set({ isLoading: true })
    try {
      const boards = await getBoards(workspaceId)
      set({ boards })
    } finally {
      set({ isLoading: false })
    }
  },
}))
