import { create } from 'zustand'
import {
  assignCardMember,
  createCard,
  createList,
  deleteCard,
  deleteList,
  getBoard,
  getBoardMembers,
  updateCard,
  updateList,
  type BoardMember,
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
  members: BoardMember[]
  isLoading: boolean
  load: (boardId: number) => Promise<void>
  refreshMembers: () => Promise<void>
  addList: (name: string) => Promise<void>
  renameList: (listId: number, name: string) => Promise<void>
  removeList: (listId: number) => Promise<void>
  moveList: (listId: number, beforeListId: number | null) => Promise<void>
  addCard: (
    listId: number,
    data: { title: string; description?: string; due_date?: string | null; assigneeEmails?: string[] },
  ) => Promise<void>
  editCard: (cardId: number, patch: { title?: string; description?: string; due_date?: string | null }) => Promise<void>
  moveCard: (cardId: number, toListId: number, beforeCardId: number | null) => Promise<void>
  removeCard: (cardId: number) => Promise<void>
  reset: () => void
}

const POSITION_GAP = 1024

let draftCounter = 0
const draftId = () => (draftCounter -= 1)

export const isDraft = (id: number) => id < 0

function slotFor(items: { id: number; position: number }[], beforeId: number | null) {
  const found = beforeId === null ? -1 : items.findIndex((i) => i.id === beforeId)
  const index = beforeId === null || found === -1 ? items.length : found

  const prev = items[index - 1]
  const next = items[index]

  const position = !prev && !next
    ? POSITION_GAP
    : !prev
      ? next.position / 2
      : !next
        ? prev.position + POSITION_GAP
        : (prev.position + next.position) / 2

  return { index, position }
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  lists: [],
  members: [],
  isLoading: false,

  reset: () => set({ board: null, lists: [], members: [], isLoading: false }),

  refreshMembers: async () => {
    const board = get().board
    if (!board) return
    set({ members: await getBoardMembers(board.id) })
  },

  load: async (boardId) => {
    set({ isLoading: true })
    try {
      const [{ lists, ...board }, members] = await Promise.all([getBoard(boardId), getBoardMembers(boardId)])
      set({ board, lists, members })
    } finally {
      set({ isLoading: false })
    }
  },

  addList: async (name) => {
    const { board, lists } = get()
    if (!board) return

    const position = lists.length ? lists[lists.length - 1].position + POSITION_GAP : POSITION_GAP
    const draft: ListWithCards = {
      id: draftId(),
      name,
      position,
      board_id: board.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: [],
    }

    set({ lists: [...lists, draft] })

    try {
      const created = await createList(board.id, name, position)
      set({ lists: get().lists.map((l) => (l.id === draft.id ? { ...created, cards: l.cards } : l)) })
    } catch (err) {
      set({ lists: get().lists.filter((l) => l.id !== draft.id) })
      throw err
    }
  },

  renameList: async (listId, name) => {
    const before = get().lists
    set({ lists: before.map((l) => (l.id === listId ? { ...l, name } : l)) })

    try {
      await updateList(listId, { name })
    } catch (err) {
      set({ lists: before })
      throw err
    }
  },

  removeList: async (listId) => {
    const before = get().lists
    set({ lists: before.filter((l) => l.id !== listId) })

    try {
      await deleteList(listId)
    } catch (err) {
      set({ lists: before })
      throw err
    }
  },

  moveList: async (listId, beforeListId) => {
    const lists = get().lists
    const list = lists.find((l) => l.id === listId)
    if (!list) return

    const others = lists.filter((l) => l.id !== listId)
    const { index, position } = slotFor(others, beforeListId)
    if (list.position === position) return

    const reordered = [...others]
    reordered.splice(index, 0, { ...list, position })
    set({ lists: reordered })

    try {
      await updateList(listId, { position })
    } catch (err) {
      set({ lists })
      throw err
    }
  },

  addCard: async (listId, { title, description, due_date, assigneeEmails }) => {
    const list = get().lists.find((l) => l.id === listId)
    if (!list) return

    const position = list.cards.length ? list.cards[list.cards.length - 1].position + POSITION_GAP : POSITION_GAP
    const draft: Card = {
      id: draftId(),
      title,
      description: description ?? null,
      position,
      list_id: listId,
      due_date: due_date ?? null,
      created_by: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const settleDraft = (saved: Card | null) =>
      get().lists.map((l) => ({
        ...l,
        cards: saved ? l.cards.map((c) => (c.id === draft.id ? saved : c)) : l.cards.filter((c) => c.id !== draft.id),
      }))

    set({ lists: get().lists.map((l) => (l.id === listId ? { ...l, cards: [...l.cards, draft] } : l)) })

    let created: Card
    try {
      created = await createCard({
        list_id: listId,
        title,
        position,
        ...(description && { description }),
        ...(due_date && { due_date }),
      })
      set({ lists: settleDraft(created) })
    } catch (err) {
      set({ lists: settleDraft(null) })
      throw err
    }

    // Assignment needs the id the server just issued, so it can only run now.
    // The card itself is saved by this point — a failure here must not remove it.
    if (assigneeEmails?.length) {
      await Promise.all(assigneeEmails.map((email) => assignCardMember(created.id, email)))
    }
  },

  editCard: async (cardId, patch) => {
    const before = get().lists
    set({
      lists: before.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
      })),
    })

    try {
      const updated = await updateCard(cardId, patch)
      set({
        lists: get().lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) => (c.id === cardId ? updated : c)),
        })),
      })
    } catch (err) {
      set({ lists: before })
      throw err
    }
  },

  moveCard: async (cardId, toListId, beforeCardId) => {
    const lists = get().lists
    const from = lists.find((l) => l.cards.some((c) => c.id === cardId))
    const card = from?.cards.find((c) => c.id === cardId)
    const to = lists.find((l) => l.id === toListId)
    if (!from || !card || !to) return

    const destination = to.cards.filter((c) => c.id !== cardId)
    const { index, position } = slotFor(destination, beforeCardId)
    if (card.list_id === toListId && card.position === position) return

    const moved = { ...card, list_id: toListId, position }

    set({
      lists: lists.map((l) => {
        if (l.id === toListId) {
          const next = [...destination]
          next.splice(index, 0, moved)
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
    const before = get().lists
    set({ lists: before.map((l) => ({ ...l, cards: l.cards.filter((c) => c.id !== cardId) })) })

    try {
      await deleteCard(cardId)
    } catch (err) {
      set({ lists: before })
      throw err
    }
  },
}))
