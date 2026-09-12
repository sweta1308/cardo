import { create } from 'zustand'
import {
  createCard,
  createList,
  deleteCard,
  deleteList,
  getBoard,
  getCards,
  getLists,
  updateCard,
  updateList,
  type BoardWithRole,
  type Card,
  type List,
} from '../lib/api'

export interface ListWithCards extends List {
  cards: Card[]
}

interface BoardState {
  board: BoardWithRole | null
  lists: ListWithCards[]
  isLoading: boolean
  load: (boardId: number) => Promise<void>
  addList: (name: string) => Promise<void>
  renameList: (listId: number, name: string) => Promise<void>
  removeList: (listId: number) => Promise<void>
  addCard: (listId: number, title: string) => Promise<void>
  editCard: (cardId: number, patch: { title?: string; description?: string; due_date?: string | null }) => Promise<void>
  moveCard: (cardId: number, toListId: number, beforeCardId: number | null) => Promise<void>
  removeCard: (cardId: number) => Promise<void>
  reset: () => void
}

// Positions are floats so an item can always be slotted between two neighbours.
const POSITION_GAP = 1024

function positionForMove(cards: Card[], beforeCardId: number | null) {
  const index = beforeCardId === null ? cards.length : cards.findIndex((c) => c.id === beforeCardId)
  const target = index === -1 ? cards.length : index

  const prev = cards[target - 1]
  const next = cards[target]

  if (!prev && !next) return POSITION_GAP
  if (!prev) return next.position / 2
  if (!next) return prev.position + POSITION_GAP
  return (prev.position + next.position) / 2
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  lists: [],
  isLoading: false,

  reset: () => set({ board: null, lists: [], isLoading: false }),

  load: async (boardId) => {
    set({ isLoading: true })
    try {
      const [board, lists] = await Promise.all([getBoard(boardId), getLists(boardId)])
      // Cards are only fetchable per list, so fan out across the board's lists.
      const withCards = await Promise.all(
        lists.map(async (list) => ({ ...list, cards: await getCards(list.id) })),
      )
      set({ board, lists: withCards })
    } finally {
      set({ isLoading: false })
    }
  },

  addList: async (name) => {
    const { board, lists } = get()
    if (!board) return

    const position = lists.length ? lists[lists.length - 1].position + POSITION_GAP : POSITION_GAP
    const list = await createList(board.id, name, position)
    set({ lists: [...get().lists, { ...list, cards: [] }] })
  },

  renameList: async (listId, name) => {
    const updated = await updateList(listId, { name })
    set({ lists: get().lists.map((l) => (l.id === listId ? { ...l, name: updated.name } : l)) })
  },

  removeList: async (listId) => {
    await deleteList(listId)
    set({ lists: get().lists.filter((l) => l.id !== listId) })
  },

  addCard: async (listId, title) => {
    const list = get().lists.find((l) => l.id === listId)
    if (!list) return

    const position = list.cards.length ? list.cards[list.cards.length - 1].position + POSITION_GAP : POSITION_GAP
    const card = await createCard({ list_id: listId, title, position })
    set({
      lists: get().lists.map((l) => (l.id === listId ? { ...l, cards: [...l.cards, card] } : l)),
    })
  },

  editCard: async (cardId, patch) => {
    const updated = await updateCard(cardId, patch)
    set({
      lists: get().lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? updated : c)),
      })),
    })
  },

  moveCard: async (cardId, toListId, beforeCardId) => {
    const lists = get().lists
    const from = lists.find((l) => l.cards.some((c) => c.id === cardId))
    const card = from?.cards.find((c) => c.id === cardId)
    const to = lists.find((l) => l.id === toListId)
    if (!from || !card || !to) return

    // Exclude the card itself so it can't be positioned relative to its old slot.
    const destination = to.cards.filter((c) => c.id !== cardId)
    const position = positionForMove(destination, beforeCardId)
    if (card.list_id === toListId && card.position === position) return

    const moved = { ...card, list_id: toListId, position }

    // Apply locally first so the drag feels immediate, then persist.
    set({
      lists: lists.map((l) => {
        if (l.id === toListId) {
          const index = beforeCardId === null ? destination.length : destination.findIndex((c) => c.id === beforeCardId)
          const next = [...destination]
          next.splice(index === -1 ? destination.length : index, 0, moved)
          return { ...l, cards: next }
        }
        return { ...l, cards: l.cards.filter((c) => c.id !== cardId) }
      }),
    })

    try {
      await updateCard(cardId, { list_id: toListId, position })
    } catch (err) {
      set({ lists })
      throw err
    }
  },

  removeCard: async (cardId) => {
    await deleteCard(cardId)
    set({
      lists: get().lists.map((l) => ({ ...l, cards: l.cards.filter((c) => c.id !== cardId) })),
    })
  },
}))
