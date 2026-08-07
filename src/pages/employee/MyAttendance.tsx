import { Download } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { formatTime, todayISO } from '@/lib/utils'
import { downloadCsv } from '@/lib/csv'

export function MyAttendance() {
  const employeeId = useAuthStore((s) => s.currentEmployeeId)!
  const attendance = useDataStore((s) => s.getAttendanceForEmployee(employeeId))

  function handleExport() {
    downloadCsv(
      `my-attendance-${todayISO()}.csv`,
      attendance.map((r) => ({
        Date: r.date,
        Status: r.status,
        'Check-in': formatTime(r.checkIn),
        'Check-out': formatTime(r.checkOut),
        Hours: r.hoursWorked,
      })),
    )
  }

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
            <Button size="sm" variant="secondary" onClick={handleExport} disabled={attendance.length === 0}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <AttendanceTable records={attendance} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
