import { create } from 'zustand'
import { api } from '@/lib/api'
import type { Employee } from '@/types'

interface AuthState {
  currentEmployeeId: string | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  error: string | null

  init: () => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  currentEmployeeId: null,
  status: 'loading',
  error: null,

  init: async () => {
    try {
      const employee = await api.get<Employee>('/auth/me')
      set({ currentEmployeeId: employee.id, status: 'authenticated' })
    } catch {
      set({ currentEmployeeId: null, status: 'unauthenticated' })
    }
  },

  signUp: async (name, email, password) => {
    set({ error: null })
    try {
      const employee = await api.post<Employee>('/auth/signup', { name, email, password })
      set({ currentEmployeeId: employee.id, status: 'authenticated' })
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  login: async (email, password) => {
    set({ error: null })
    try {
      const employee = await api.post<Employee>('/auth/login', { email, password })
      set({ currentEmployeeId: employee.id, status: 'authenticated' })
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  logout: async () => {
    await api.post('/auth/logout')
    set({ currentEmployeeId: null, status: 'unauthenticated' })
  },
}))
