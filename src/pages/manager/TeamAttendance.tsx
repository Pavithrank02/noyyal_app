import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { formatTime, todayISO } from '@/lib/utils'
import { downloadCsv } from '@/lib/csv'

export function TeamAttendance() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const team = useDataStore((s) => s.getTeam(managerId))
  const attendance = useDataStore((s) => s.attendance)
  const deleteAttendanceRecord = useDataStore((s) => s.deleteAttendanceRecord)

  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [date, setDate] = useState(todayISO())

  const teamIds = useMemo(() => new Set(team.map((t) => t.id)), [team])
  const employeeNames = useMemo(() => Object.fromEntries(team.map((t) => [t.id, t.name])), [team])

  const dayRecords = useMemo(
    () => attendance.filter((a) => teamIds.has(a.employeeId) && a.date === date),
    [attendance, teamIds, date],
  )

  const historyRecords = useMemo(
    () =>
      attendance
        .filter((a) => teamIds.has(a.employeeId) && (selectedEmployee === 'all' || a.employeeId === selectedEmployee))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 60),
    [attendance, teamIds, selectedEmployee],
  )

  function handleExport() {
    downloadCsv(
      `team-attendance-${todayISO()}.csv`,
      historyRecords.map((r) => ({
        Employee: employeeNames[r.employeeId] ?? r.employeeId,
        Date: r.date,
        Status: r.status,
        'Check-in': formatTime(r.checkIn),
        'Check-out': formatTime(r.checkOut),
        Hours: r.hoursWorked,
      })),
    )
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this attendance record? This cannot be undone.')) return
    await deleteAttendanceRecord(id)
  }

  return (
    <AppShell title="Team Attendance" subtitle="Daily snapshot and full history for your team.">
      <Card>
        <CardHeader>
          <CardTitle>Snapshot for a specific day</CardTitle>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-base text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:w-auto sm:text-sm"
          />
        </CardHeader>
        <CardContent>
          <AttendanceTable records={dayRecords} showEmployee employeeNames={employeeNames} onDelete={handleDelete} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Full history</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-base text-slate-700 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:w-auto sm:text-sm"
            >
              <option value="all">All employees</option>
              {team.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Button size="sm" variant="secondary" onClick={handleExport} disabled={historyRecords.length === 0}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AttendanceTable
            records={historyRecords}
            showEmployee
            employeeNames={employeeNames}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </AppShell>
  )
}
