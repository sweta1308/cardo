import axios, { AxiosError } from 'axios'

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
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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
