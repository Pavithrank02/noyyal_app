import { AppShell } from '@/components/layout/AppShell'
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'

export function MyAttendance() {
  const employeeId = useAuthStore((s) => s.currentEmployeeId)!
  const attendance = useDataStore((s) => s.getAttendanceForEmployee(employeeId))

  return (
    <AppShell title="My Attendance" subtitle="Track your check-ins, check-outs, and monthly attendance pattern.">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar view</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceCalendar records={attendance} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTable records={attendance} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
