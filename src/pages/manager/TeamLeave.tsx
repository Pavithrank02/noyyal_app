import { useState } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LeaveStatusBadge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { formatDate } from '@/lib/utils'
import type { LeaveRequest } from '@/types'

function LeaveRow({
  request,
  busy,
  onDecide,
  onDelete,
}: {
  request: LeaveRequest
  busy: boolean
  onDecide: (status: 'approved' | 'rejected') => void
  onDelete: () => void
}) {
  const getEmployee = useDataStore((s) => s.getEmployee)
  const employee = getEmployee(request.employeeId)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {employee && <Avatar name={employee.name} color={employee.color} />}
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{employee?.name ?? 'Unknown'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatDate(request.startDate)}
            {request.startDate !== request.endDate && <> &ndash; {formatDate(request.endDate)}</>} &middot;{' '}
            {request.reason}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <LeaveStatusBadge status={request.status} />
        <Button
          size="sm"
          variant={request.status === 'approved' ? 'secondary' : 'primary'}
          onClick={() => onDecide('approved')}
          disabled={busy || request.status === 'approved'}
        >
          <Check className="h-3.5 w-3.5" /> Approve
        </Button>
        <Button
          size="sm"
          variant={request.status === 'rejected' ? 'secondary' : 'danger'}
          onClick={() => onDecide('rejected')}
          disabled={busy || request.status === 'rejected'}
        >
          <X className="h-3.5 w-3.5" /> Reject
        </Button>
        <button
          onClick={onDelete}
          disabled={busy}
          aria-label="Delete request"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50 dark:hover:bg-rose-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function TeamLeave() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const requests = useDataStore((s) => s.getLeaveRequestsForTeam(managerId))
  const decideLeaveRequest = useDataStore((s) => s.decideLeaveRequest)
  const deleteLeaveRequest = useDataStore((s) => s.deleteLeaveRequest)
  const [busyId, setBusyId] = useState<string | null>(null)

  const pending = requests.filter((r) => r.status === 'pending')
  const decided = requests.filter((r) => r.status !== 'pending')

  async function handleDecide(id: string, status: 'approved' | 'rejected') {
    setBusyId(id)
    try {
      await decideLeaveRequest(id, status)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this leave request? This cannot be undone.')) return
    setBusyId(id)
    try {
      await deleteLeaveRequest(id)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AppShell title="Team Leave" subtitle="Review, edit, or remove time-off requests.">
      <Card>
        <CardHeader>
          <CardTitle>Pending approval ({pending.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Nothing pending.</p>}
          {pending.map((r) => (
            <LeaveRow
              key={r.id}
              request={r}
              busy={busyId === r.id}
              onDecide={(status) => handleDecide(r.id, status)}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {decided.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No decisions yet.</p>}
          {decided.map((r) => (
            <LeaveRow
              key={r.id}
              request={r}
              busy={busyId === r.id}
              onDecide={(status) => handleDecide(r.id, status)}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
        </CardContent>
      </Card>
    </AppShell>
  )
}
