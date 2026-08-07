import { Download } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ReportList } from '@/components/reports/ReportList'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { todayISO } from '@/lib/utils'
import { downloadCsv } from '@/lib/csv'

export function MyReports() {
  const employeeId = useAuthStore((s) => s.currentEmployeeId)!
  const reports = useDataStore((s) => s.getReportsForEmployee(employeeId))

  function handleExport() {
    downloadCsv(
      `my-reports-${todayISO()}.csv`,
      reports.map((r) => ({
        Date: r.date,
        Summary: r.summary,
        'Tasks completed': r.tasksCompleted.join('; '),
        Blockers: r.blockers,
        Hours: r.hoursWorked,
        'Work mode': r.workMode,
        Mood: r.mood,
      })),
    )
  }

  return (
    <AppShell title="My Reports" subtitle="Every daily status report you've submitted.">
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="secondary" onClick={handleExport} disabled={reports.length === 0}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>
      <ReportList reports={reports} />
    </AppShell>
  )
}
