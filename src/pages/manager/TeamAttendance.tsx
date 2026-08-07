import { useMemo, useState, type FormEvent } from 'react'
import { CalendarOff, Download, Plus, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { formatDate, formatTime, todayISO } from '@/lib/utils'
import { downloadCsv } from '@/lib/csv'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:text-sm'
const labelClass = 'mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400'

function HolidaysCard() {
  const holidays = useDataStore((s) => s.holidays)
  const addHoliday = useDataStore((s) => s.addHoliday)
  const removeHoliday = useDataStore((s) => s.removeHoliday)

  const [showAdd, setShowAdd] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await addHoliday({ date, name: name.trim() })
      setName('')
      setShowAdd(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmRemove() {
    if (!removingId) return
    const id = removingId
    setRemovingId(null)
    await removeHoliday(id)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holidays</CardTitle>
        {!showAdd && (
          <Button size="sm" variant="secondary" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> Add holiday
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-slate-400">Every Sunday is automatically a holiday for everyone.</p>

        {showAdd && (
          <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className={labelClass}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Independence Day"
                required
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? 'Adding…' : 'Add'}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        {error && <p className="mb-3 text-xs font-medium text-rose-500">{error}</p>}

        {holidays.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No custom holidays added yet.</p>
        ) : (
          <div className="space-y-2">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <CalendarOff className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{h.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(h.date)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRemovingId(h.id)}
                  aria-label="Remove holiday"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={removingId !== null}
        title="Remove this holiday?"
        message="Attendance won't automatically treat this date as a day off anymore."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={confirmRemove}
        onCancel={() => setRemovingId(null)}
      />
    </Card>
  )
}

export function TeamAttendance() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const team = useDataStore((s) => s.getTeam(managerId))
  const attendance = useDataStore((s) => s.attendance)
  const deleteAttendanceRecord = useDataStore((s) => s.deleteAttendanceRecord)

  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [date, setDate] = useState(todayISO())
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  async function confirmDelete() {
    if (!deletingId) return
    const id = deletingId
    setDeletingId(null)
    await deleteAttendanceRecord(id)
  }

  return (
    <AppShell title="Team Attendance" subtitle="Daily snapshot and full history for your team.">
      <HolidaysCard />

      <Card className="mt-6">
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
          <AttendanceTable records={dayRecords} showEmployee employeeNames={employeeNames} onDelete={setDeletingId} />
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
            onDelete={setDeletingId}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete this attendance record?"
        message="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </AppShell>
  )
}
