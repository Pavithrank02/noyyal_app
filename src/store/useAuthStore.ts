import { create } from 'zustand'
import { api } from '@/lib/api'
import type { Employee } from '@/types'

interface AuthState {
  currentEmployeeId: string | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  error: string | null

  init: () => Promise<void>
  signUp: (name: string, employeeId: string, password: string) => Promise<void>
  login: (employeeId: string, password: string) => Promise<void>
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

  signUp: async (name, employeeId, password) => {
    set({ error: null })
    try {
      const employee = await api.post<Employee>('/auth/signup', { name, employeeId, password })
      set({ currentEmployeeId: employee.id, status: 'authenticated' })
    } catch (err) {
      set({ error: (err as Error).message })
      throw err
    }
  },

  login: async (employeeId, password) => {
    set({ error: null })
    try {
      const employee = await api.post<Employee>('/auth/login', { employeeId, password })
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
