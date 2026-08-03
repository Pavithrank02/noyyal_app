import { useMemo } from 'react'
import { CalendarCheck, Clock3, Flame, NotebookPen } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CheckInCard } from '@/components/attendance/CheckInCard'
import { StatusReportForm } from '@/components/reports/StatusReportForm'
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar'
import { ReportList } from '@/components/reports/ReportList'
import { StatTile } from '@/components/ui/StatTile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'

export function EmployeeDashboard() {
  const employeeId = useAuthStore((s) => s.currentEmployeeId)!
  const employee = useDataStore((s) => s.getEmployee(employeeId))
  const attendance = useDataStore((s) => s.getAttendanceForEmployee(employeeId))
  const reports = useDataStore((s) => s.getReportsForEmployee(employeeId))

  const stats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)

    const weekRecords = attendance.filter((a) => new Date(a.date) >= weekAgo)
    const hoursThisWeek = weekRecords.reduce((sum, a) => sum + a.hoursWorked, 0)

    const monthRecords = attendance.filter((a) => {
      const d = new Date(a.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const presentCount = monthRecords.filter((a) => ['present', 'late', 'wfh', 'half-day'].includes(a.status)).length
    const attendanceRate = monthRecords.length ? Math.round((presentCount / monthRecords.length) * 100) : 0

    let streak = 0
    for (const a of attendance) {
      if (['present', 'late', 'wfh', 'half-day'].includes(a.status)) streak++
      else break
    }

    return { hoursThisWeek, attendanceRate, streak }
  }, [attendance])

  if (!employee) return null

  return (
    <AppShell title={`Hi, ${employee.name.split(' ')[0]} 👋`} subtitle="Here's how your day is shaping up.">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Hours this week" value={`${stats.hoursThisWeek.toFixed(1)}h`} icon={Clock3} tone="brand" />
        <StatTile label="Attendance rate (month)" value={`${stats.attendanceRate}%`} icon={CalendarCheck} tone="emerald" />
        <StatTile label="Current streak" value={`${stats.streak} days`} icon={Flame} tone="amber" />
        <StatTile label="Reports submitted" value={`${reports.length}`} icon={NotebookPen} tone="sky" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CheckInCard employeeId={employeeId} />
        </div>
        <div className="lg:col-span-3">
          <StatusReportForm employeeId={employeeId} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceCalendar records={attendance} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent status reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportList reports={reports.slice(0, 3)} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
