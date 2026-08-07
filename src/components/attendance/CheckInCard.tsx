import { useEffect, useState } from 'react'
import { Clock, LogIn, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDataStore } from '@/store/useDataStore'
import { cn, formatDuration, formatTime } from '@/lib/utils'

export function CheckInCard({ employeeId }: { employeeId: string }) {
  const [now, setNow] = useState(new Date())
  const [confirmingCheckOut, setConfirmingCheckOut] = useState(false)
  const record = useDataStore((s) => s.getTodayRecord(employeeId))
  const checkIn = useDataStore((s) => s.checkIn)
  const checkOut = useDataStore((s) => s.checkOut)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hasCheckedIn = !!record?.checkIn
  const hasCheckedOut = !!record?.checkOut

  const workingHours = !record?.checkIn
    ? '00:00:00'
    : formatDuration(record.checkIn, (record.checkOut ? new Date(record.checkOut) : now).getTime())

  function confirmCheckOut() {
    setConfirmingCheckOut(false)
    checkOut(employeeId)
  }

  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/10 to-accent-400/10 blur-2xl" />
      <div className="relative flex flex-col items-center text-center">
        <div className="grid w-full grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current time</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white sm:text-3xl">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Working hours</p>
            <p
              className={cn(
                'mt-1 font-mono text-2xl font-bold tabular-nums sm:text-3xl',
                hasCheckedIn ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 dark:text-slate-700',
              )}
            >
              {workingHours}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          {record ? <StatusBadge status={record.status} /> : <StatusBadge status="absent" />}
        </div>

        <div className="mt-6 grid w-full grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/50">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <LogIn className="h-3.5 w-3.5" /> Check-in
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatTime(record?.checkIn ?? null)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <LogOut className="h-3.5 w-3.5" /> Check-out
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatTime(record?.checkOut ?? null)}</p>
          </div>
        </div>

        <div className="mt-6 w-full">
          {!hasCheckedIn && (
            <Button className="w-full" size="lg" onClick={() => checkIn(employeeId)}>
              <LogIn className="h-4 w-4" /> Check In
            </Button>
          )}
          {hasCheckedIn && !hasCheckedOut && (
            <Button className="w-full" size="lg" variant="danger" onClick={() => setConfirmingCheckOut(true)}>
              <LogOut className="h-4 w-4" /> Check Out
            </Button>
          )}
          {hasCheckedIn && hasCheckedOut && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Clock className="h-4 w-4" /> Day complete &middot; {record?.hoursWorked.toFixed(1)}h logged
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmingCheckOut}
        title="Check out now?"
        message="This will log your hours for the day and cannot be undone from here."
        confirmLabel="Check Out"
        variant="danger"
        onConfirm={confirmCheckOut}
        onCancel={() => setConfirmingCheckOut(false)}
      />
    </Card>
  )
}
