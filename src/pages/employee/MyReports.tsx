import { AppShell } from '@/components/layout/AppShell'
import { ReportList } from '@/components/reports/ReportList'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'

export function MyReports() {
  const employeeId = useAuthStore((s) => s.currentEmployeeId)!
  const reports = useDataStore((s) => s.getReportsForEmployee(employeeId))

  return (
    <AppShell title="My Reports" subtitle="Every daily status report you've submitted.">
      <ReportList reports={reports} />
    </AppShell>
  )
}
