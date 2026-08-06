import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LeaveStatusBadge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { formatDate } from '@/lib/utils'

export function TeamLeave() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const requests = useDataStore((s) => s.getLeaveRequestsForTeam(managerId))
  const getEmployee = useDataStore((s) => s.getEmployee)
  const decideLeaveRequest = useDataStore((s) => s.decideLeaveRequest)
  const [decidingId, setDecidingId] = useState<string | null>(null)

  const pending = requests.filter((r) => r.status === 'pending')
  const decided = requests.filter((r) => r.status !== 'pending')

  async function handleDecide(id: string, status: 'approved' | 'rejected') {
    setDecidingId(id)
    try {
      await decideLeaveRequest(id, status)
    } finally {
      setDecidingId(null)
    }
  }

  return (
    <AppShell title="Team Leave" subtitle="Review and decide on time-off requests.">
      <Card>
        <CardHeader>
          <CardTitle>Pending approval ({pending.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Nothing pending.</p>}
          {pending.map((r) => {
            const employee = getEmployee(r.employeeId)
            return (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  {employee && <Avatar name={employee.name} color={employee.color} />}
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {employee?.name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(r.startDate)}
                      {r.startDate !== r.endDate && <> &ndash; {formatDate(r.endDate)}</>} &middot; {r.reason}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleDecide(r.id, 'approved')} disabled={decidingId === r.id}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDecide(r.id, 'rejected')}
                    disabled={decidingId === r.id}
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {decided.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No decisions yet.</p>}
          {decided.map((r) => {
            const employee = getEmployee(r.employeeId)
            return (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  {employee && <Avatar name={employee.name} color={employee.color} />}
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {employee?.name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(r.startDate)}
                      {r.startDate !== r.endDate && <> &ndash; {formatDate(r.endDate)}</>} &middot; {r.reason}
                    </p>
                  </div>
                </div>
                <LeaveStatusBadge status={r.status} />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </AppShell>
  )
}
