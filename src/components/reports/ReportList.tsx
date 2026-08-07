import { AlertTriangle, Clock3, Laptop } from 'lucide-react'
import type { StatusReport } from '@/types'
import { Card } from '@/components/ui/Card'
import { MoodBadge, Chip } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate, formatHours } from '@/lib/utils'
import { useDataStore } from '@/store/useDataStore'

export function ReportList({ reports, showEmployee }: { reports: StatusReport[]; showEmployee?: boolean }) {
  const getEmployee = useDataStore((s) => s.getEmployee)

  if (reports.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">No status reports found.</p>
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const employee = getEmployee(report.employeeId)
        return (
          <Card key={report.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {showEmployee && employee && <Avatar name={employee.name} color={employee.color} />}
                <div>
                  {showEmployee && employee && (
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{employee.name}</p>
                  )}
                  <p className="text-xs text-slate-400">{formatDate(report.date)}</p>
                </div>
              </div>
              <MoodBadge mood={report.mood} />
            </div>

            <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{report.summary}</p>

            {report.tasksCompleted.length > 0 && (
              <ul className="mt-3 space-y-1">
                {report.tasksCompleted.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    {task}
                  </li>
                ))}
              </ul>
            )}

            {report.blockers && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {report.blockers}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>
                <Clock3 className="h-3 w-3" /> {formatHours(report.hoursWorked)}
              </Chip>
              <Chip>
                <Laptop className="h-3 w-3" /> {report.workMode.toUpperCase()}
              </Chip>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
