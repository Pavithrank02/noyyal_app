import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  currentEmployeeId: string | null
  login: (employeeId: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentEmployeeId: null,
      login: (employeeId) => set({ currentEmployeeId: employeeId }),
      logout: () => set({ currentEmployeeId: null }),
    }),
    { name: 'noyyal-auth-store' },
  ),
)
