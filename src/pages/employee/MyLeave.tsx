import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LeaveStatusBadge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { formatDate, todayISO } from '@/lib/utils'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
const labelClass = 'mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400'

export function MyLeave() {
  const employeeId = useAuthStore((s) => s.currentEmployeeId)!
  const requests = useDataStore((s) => s.getLeaveRequestsForEmployee(employeeId))
  const submitLeaveRequest = useDataStore((s) => s.submitLeaveRequest)

  const today = todayISO()
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await submitLeaveRequest({ startDate, endDate, reason: reason.trim() })
      setReason('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell title="Leave" subtitle="Request time off and track approval status.">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Request leave</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>End date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="What's this leave for?"
                  className={`${inputClass} resize-none`}
                />
              </div>
              {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                <Send className="h-4 w-4" /> {submitting ? 'Submitting…' : 'Submit request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Your requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No leave requests yet.</p>}
            {requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {formatDate(r.startDate)}
                      {r.startDate !== r.endDate && <> &ndash; {formatDate(r.endDate)}</>}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.reason}</p>
                  </div>
                  <LeaveStatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
