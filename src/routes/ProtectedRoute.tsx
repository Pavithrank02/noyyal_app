import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import type { Role } from '@/types'

export function ProtectedRoute({ children, requireRole }: { children: ReactNode; requireRole?: Role }) {
  const currentEmployeeId = useAuthStore((s) => s.currentEmployeeId)
  const employee = useDataStore((s) => (currentEmployeeId ? s.getEmployee(currentEmployeeId) : undefined))

  if (!currentEmployeeId || !employee) return <Navigate to="/login" replace />
  if (requireRole && employee.role !== requireRole) return <Navigate to="/" replace />

  return <>{children}</>
}
