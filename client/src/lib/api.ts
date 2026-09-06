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
  (error: AxiosError<{ error?: string }>) => {
    const message = error.response?.data?.error ?? 'Something went wrong'
    const status = error.response?.status ?? 0
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
}

export async function createWorkspace(name: string, description: string) {
  const { data } = await apiClient.post<Workspace>('/workspaces', { name, description })
  return data
}

export async function getWorkspace(workspaceId: number) {
  const { data } = await apiClient.get<WorkspaceWithRole>(`/workspaces/${workspaceId}`)
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

export async function getBoard(boardId: number) {
  const { data } = await apiClient.get<BoardWithRole>(`/boards/${boardId}`)
  return data
}
