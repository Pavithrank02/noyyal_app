import type { AttendanceRecord } from '@/types'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate, formatHours, formatTime } from '@/lib/utils'

export function AttendanceTable({
  records,
  showEmployee,
  employeeNames,
}: {
  records: AttendanceRecord[]
  showEmployee?: boolean
  employeeNames?: Record<string, string>
}) {
  if (records.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">No attendance records found.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
            {showEmployee && <th className="py-2.5 pr-4 font-medium">Employee</th>}
            <th className="py-2.5 pr-4 font-medium">Date</th>
            <th className="py-2.5 pr-4 font-medium">Status</th>
            {/* Check-in/out are secondary detail — hidden on phones to avoid a 5-6 column horizontal scroll */}
            <th className="hidden py-2.5 pr-4 font-medium sm:table-cell">Check-in</th>
            <th className="hidden py-2.5 pr-4 font-medium sm:table-cell">Check-out</th>
            <th className="py-2.5 pr-4 font-medium">Hours</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/60">
              {showEmployee && (
                <td className="py-2.5 pr-4 font-medium text-slate-700 dark:text-slate-200">
                  {employeeNames?.[r.employeeId] ?? r.employeeId}
                </td>
              )}
              <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{formatDate(r.date)}</td>
              <td className="py-2.5 pr-4">
                <StatusBadge status={r.status} />
              </td>
              <td className="hidden py-2.5 pr-4 text-slate-500 dark:text-slate-400 sm:table-cell">
                {formatTime(r.checkIn)}
              </td>
              <td className="hidden py-2.5 pr-4 text-slate-500 dark:text-slate-400 sm:table-cell">
                {formatTime(r.checkOut)}
              </td>
              <td className="py-2.5 pr-4 font-medium text-slate-700 dark:text-slate-200">
                {r.hoursWorked ? formatHours(r.hoursWorked) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
