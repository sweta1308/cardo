import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export interface AuthUser {
  id: number
  name: string
  email: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const apiClient = axios.create({
  baseURL: API_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.token = token
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const data = error.response?.data
    const message = data?.error ?? data?.message ?? 'Something went wrong'
    const status = error.response?.status ?? 0

    if (status === 403) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(new ApiError(message, status))
  },
)

export async function signup(name: string, email: string, password: string) {
  const { data } = await apiClient.post<AuthResponse>('/signup', { name, email, password })
  return data
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<AuthResponse>('/login', { email, password })
  return data
}

export type Role = 'Owner' | 'Admin' | 'Member'

export interface Workspace {
  id: number
  name: string
  description: string
  owner_id: number
  created_at: string
  updated_at: string
}

export interface WorkspaceWithRole extends Workspace {
  role: Role
}

export interface Board {
  id: number
  name: string
  description: string
  workspace_id: number
  background: string
  created_by: number
  created_at: string
  updated_at: string
}

export interface BoardWithRole extends Board {
  role: Role
  list_count?: number
  card_count?: number
}

export async function createWorkspace(name: string, description: string) {
  const { data } = await apiClient.post<Workspace>('/workspaces', { name, description })
  return data
}

export async function getWorkspaces() {
  const { data } = await apiClient.get<WorkspaceWithRole[]>('/workspaces')
  return data
}

export interface WorkspaceMember {
  id: number
  name: string
  email: string
  role: Role
}

export async function getWorkspaceMembers(workspaceId: number) {
  const { data } = await apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`)
  return data
}

interface CreateBoardPayload {
  workspace_id: number
  name: string
  description: string
  background: string
}

export async function createBoard(payload: CreateBoardPayload) {
  const { data } = await apiClient.post<Board>('/boards', payload)
  return data
}

export async function getBoards(workspaceId: number) {
  const { data } = await apiClient.get<BoardWithRole[]>('/boards', {
    params: { workspace_id: workspaceId },
  })
  return data
}

export interface BoardDetail extends BoardWithRole {
  lists: (List & { cards: Card[] })[]
}

export async function getBoard(boardId: number) {
  const { data } = await apiClient.get<BoardDetail>(`/boards/${boardId}`)
  return data
}

export async function updateBoard(boardId: number, patch: { name?: string; description?: string; background?: string }) {
  const { data } = await apiClient.patch<Board>(`/boards/${boardId}`, patch)
  return data
}

export async function deleteBoard(boardId: number) {
  await apiClient.delete(`/boards/${boardId}`)
}

export interface BoardMember {
  id: number
  name: string
  email: string
  role: Role
}

export async function getBoardMembers(boardId: number) {
  const { data } = await apiClient.get<BoardMember[]>(`/boards/${boardId}/members`)
  return data
}

export async function addBoardMember(boardId: number, email: string, role?: 'Admin' | 'Member') {
  const { data } = await apiClient.post<BoardMember>(`/boards/${boardId}/members`, { email, role })
  return data
}

export async function removeBoardMember(boardId: number, userId: number) {
  await apiClient.delete(`/boards/${boardId}/members/${userId}`)
}

export interface CardAssignee {
  id: number
  name: string
  email: string
}

export async function getCardMembers(cardId: number) {
  const { data } = await apiClient.get<CardAssignee[]>(`/cards/${cardId}/members`)
  return data
}

export async function assignCardMember(cardId: number, email: string) {
  const { data } = await apiClient.post<CardAssignee>(`/cards/${cardId}/members`, { email })
  return data
}

export async function unassignCardMember(cardId: number, userId: number) {
  await apiClient.delete(`/cards/${cardId}/members/${userId}`)
}

export interface List {
  id: number
  name: string
  position: number
  board_id: number
  created_at: string
  updated_at: string
}

export async function createList(boardId: number, name: string, position: number) {
  const { data } = await apiClient.post<List>('/lists', { board_id: boardId, name, position })
  return data
}

export async function updateList(listId: number, patch: { name?: string; position?: number }) {
  const { data } = await apiClient.patch<List>(`/lists/${listId}`, patch)
  return data
}

export async function deleteList(listId: number) {
  await apiClient.delete(`/lists/${listId}`)
}

export interface Card {
  id: number
  title: string
  description: string | null
  position: number
  list_id: number
  due_date: string | null
  created_by: number
  created_at: string
  updated_at: string
}

export async function createCard(payload: {
  list_id: number
  title: string
  position: number
  description?: string
  due_date?: string
}) {
  const { data } = await apiClient.post<Card>('/cards', payload)
  return data
}

export async function updateCard(
  cardId: number,
  patch: { title?: string; description?: string; position?: number; due_date?: string | null; list_id?: number },
) {
  const { data } = await apiClient.patch<Card>(`/cards/${cardId}`, patch)
  return data
}

export async function deleteCard(cardId: number) {
  await apiClient.delete(`/cards/${cardId}`)
}

export async function updateWorkspace(workspaceId: number, patch: { name?: string; description?: string }) {
  const { data } = await apiClient.patch<Workspace>(`/workspaces/${workspaceId}`, patch)
  return data
}

export async function deleteWorkspace(workspaceId: number) {
  await apiClient.delete(`/workspaces/${workspaceId}`)
}

export async function addWorkspaceMember(workspaceId: number, email: string, role?: 'Admin' | 'Member') {
  const { data } = await apiClient.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, { email, role })
  return data
}

export async function removeWorkspaceMember(workspaceId: number, userId: number) {
  await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`)
}

export async function logout() {
  await apiClient.post('/logout')
}
