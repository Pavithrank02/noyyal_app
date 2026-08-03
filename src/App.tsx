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

export default function App() {
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
