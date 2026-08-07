import { useMemo, useState, type FormEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CalendarCheck, CalendarClock, Clock3, Flame, Pencil } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { StatTile } from '@/components/ui/StatTile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar'
import { AttendanceTable } from '@/components/attendance/AttendanceTable'
import { ReportList } from '@/components/reports/ReportList'
import { useDataStore } from '@/store/useDataStore'
import { todayISO } from '@/lib/utils'
import type { AttendanceStatus, Employee, Role } from '@/types'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:text-sm'
const labelClass = 'mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400'

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'late', label: 'Late' },
  { value: 'wfh', label: 'WFH' },
  { value: 'leave', label: 'On Leave' },
  { value: 'absent', label: 'Absent' },
]

function SetStatusForm({ employeeId }: { employeeId: string }) {
  const setManualStatus = useDataStore((s) => s.setManualStatus)
  const [date, setDate] = useState(todayISO())
  const [status, setStatus] = useState<AttendanceStatus>('half-day')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await setManualStatus(employeeId, date, status)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set attendance status</CardTitle>
        {saved && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved ✓</span>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className={labelClass}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AttendanceStatus)} className={inputClass}>
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={saving} className="sm:w-auto">
            <CalendarClock className="h-4 w-4" /> {saving ? 'Saving…' : 'Set status'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EditProfileForm({ employee, onDone }: { employee: Employee; onDone: () => void }) {
  const updateEmployee = useDataStore((s) => s.updateEmployee)
  const [department, setDepartment] = useState(employee.department)
  const [title, setTitle] = useState(employee.title)
  const [role, setRole] = useState<Role>(employee.role)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateEmployee(employee.id, { department, title, role })
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Department</label>
          <input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputClass}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function EmployeeDetail() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const employee = useDataStore((s) => (employeeId ? s.getEmployee(employeeId) : undefined))
  const attendance = useDataStore((s) => (employeeId ? s.getAttendanceForEmployee(employeeId) : []))
  const reports = useDataStore((s) => (employeeId ? s.getReportsForEmployee(employeeId) : []))
  const [tab, setTab] = useState<'attendance' | 'reports'>('attendance')
  const [editing, setEditing] = useState(false)

  const stats = useMemo(() => {
    const now = new Date()
    const monthRecords = attendance.filter((a) => {
      const d = new Date(a.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const presentCount = monthRecords.filter((a) => ['present', 'late', 'wfh', 'half-day'].includes(a.status)).length
    const attendanceRate = monthRecords.length ? Math.round((presentCount / monthRecords.length) * 100) : 0
    const avgHours = monthRecords.length
      ? monthRecords.reduce((s, a) => s + a.hoursWorked, 0) / monthRecords.length
      : 0

    let streak = 0
    for (const a of attendance) {
      if (['present', 'late', 'wfh', 'half-day'].includes(a.status)) streak++
      else break
    }

    return { attendanceRate, avgHours, streak }
  }, [attendance])

  if (!employeeId || !employee) return <Navigate to="/team" replace />

  return (
    <AppShell title="Employee Profile">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={employee.name} color={employee.color} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{employee.name}</h2>
            <p className="text-sm text-slate-400">
              {employee.title || 'No title set'} &middot; {employee.department || 'No department set'}
            </p>
          </div>
        </div>
        {!editing && (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </div>

      {editing && <EditProfileForm employee={employee} onDone={() => setEditing(false)} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatTile label="Attendance rate (month)" value={`${stats.attendanceRate}%`} icon={CalendarCheck} tone="emerald" />
        <StatTile label="Avg hours / day" value={`${stats.avgHours.toFixed(1)}h`} icon={Clock3} tone="brand" />
        <StatTile label="Current streak" value={`${stats.streak} days`} icon={Flame} tone="amber" />
      </div>

      <div className="mt-6">
        <SetStatusForm employeeId={employeeId} />
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
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setTab('attendance')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === 'attendance'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Attendance history
              </button>
              <button
                onClick={() => setTab('reports')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === 'reports'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Status reports
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {tab === 'attendance' ? <AttendanceTable records={attendance} /> : <ReportList reports={reports} />}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
