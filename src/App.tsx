import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Login } from '@/pages/Login'
import { MyAttendance } from '@/pages/employee/MyAttendance'
import { MyReports } from '@/pages/employee/MyReports'
import { TeamAttendance } from '@/pages/manager/TeamAttendance'
import { TeamReports } from '@/pages/manager/TeamReports'
import { Team } from '@/pages/manager/Team'
import { EmployeeDetail } from '@/pages/manager/EmployeeDetail'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleDashboard } from '@/routes/RoleDashboard'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'

export default function App() {
  const authStatus = useAuthStore((s) => s.status)
  const init = useAuthStore((s) => s.init)
  const fetchAll = useDataStore((s) => s.fetchAll)
  const reset = useDataStore((s) => s.reset)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (authStatus === 'authenticated') fetchAll()
    else if (authStatus === 'unauthenticated') reset()
  }, [authStatus, fetchAll, reset])

  if (authStatus === 'loading') return <FullScreenLoader />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute requireRole="employee">
              <MyAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requireRole="employee">
              <MyReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/team-attendance"
          element={
            <ProtectedRoute requireRole="manager">
              <TeamAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-reports"
          element={
            <ProtectedRoute requireRole="manager">
              <TeamReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute requireRole="manager">
              <Team />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team/:employeeId"
          element={
            <ProtectedRoute requireRole="manager">
              <EmployeeDetail />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
