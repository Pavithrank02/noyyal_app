import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard'
import { ManagerDashboard } from '@/pages/manager/ManagerDashboard'

export function RoleDashboard() {
  const currentEmployeeId = useAuthStore((s) => s.currentEmployeeId)!
  const employee = useDataStore((s) => s.getEmployee(currentEmployeeId))

  return employee?.role === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard />
}
