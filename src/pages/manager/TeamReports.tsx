import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ReportList } from '@/components/reports/ReportList'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { todayISO } from '@/lib/utils'
import { downloadCsv } from '@/lib/csv'

export function TeamReports() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const team = useDataStore((s) => s.getTeam(managerId))
  const reports = useDataStore((s) => s.reports)
  const deleteReport = useDataStore((s) => s.deleteReport)

  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const teamIds = useMemo(() => new Set(team.map((t) => t.id)), [team])
  const employeeNames = useMemo(() => Object.fromEntries(team.map((t) => [t.id, t.name])), [team])
  const filtered = useMemo(
    () =>
      reports
        .filter((r) => teamIds.has(r.employeeId) && (selectedEmployee === 'all' || r.employeeId === selectedEmployee))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [reports, teamIds, selectedEmployee],
  )

  function handleExport() {
    downloadCsv(
      `team-reports-${todayISO()}.csv`,
      filtered.map((r) => ({
        Employee: employeeNames[r.employeeId] ?? r.employeeId,
        Date: r.date,
        Summary: r.summary,
        'Tasks completed': r.tasksCompleted.join('; '),
        Blockers: r.blockers,
        Hours: r.hoursWorked,
      })),
    )
  }

  async function confirmDelete() {
    if (!deletingId) return
    const id = deletingId
    setDeletingId(null)
    await deleteReport(id)
  }

  return (
    <AppShell title="Team Reports" subtitle="Daily work status submitted across your team.">
      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} reports</CardTitle>
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
            <Button size="sm" variant="secondary" onClick={handleExport} disabled={filtered.length === 0}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ReportList reports={filtered.slice(0, 30)} showEmployee onDelete={setDeletingId} />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete this status report?"
        message="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </AppShell>
  )
}
