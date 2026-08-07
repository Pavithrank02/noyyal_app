import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ReportList } from '@/components/reports/ReportList'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'

export function TeamReports() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const team = useDataStore((s) => s.getTeam(managerId))
  const reports = useDataStore((s) => s.reports)

  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')

  const teamIds = useMemo(() => new Set(team.map((t) => t.id)), [team])
  const filtered = useMemo(
    () =>
      reports
        .filter((r) => teamIds.has(r.employeeId) && (selectedEmployee === 'all' || r.employeeId === selectedEmployee))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [reports, teamIds, selectedEmployee],
  )

  return (
    <AppShell title="Team Reports" subtitle="Daily work status submitted across your team.">
      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} reports</CardTitle>
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
        </CardHeader>
        <CardContent>
          <ReportList reports={filtered.slice(0, 30)} showEmployee />
        </CardContent>
      </Card>
    </AppShell>
  )
}
