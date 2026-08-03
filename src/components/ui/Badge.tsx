import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { AttendanceStatus, Mood } from '@/types'

const statusStyles: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
  late: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  absent: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
  leave: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20',
  wfh: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20',
  'half-day': 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20',
}

const statusLabels: Record<AttendanceStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  leave: 'On Leave',
  wfh: 'WFH',
  'half-day': 'Half Day',
}

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}

const moodLabels: Record<Mood, { label: string; className: string }> = {
  great: { label: 'Great', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  steady: { label: 'Steady', className: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' },
  stretched: { label: 'Stretched', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
}

export function MoodBadge({ mood }: { mood: Mood }) {
  const m = moodLabels[mood]
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', m.className)}>{m.label}</span>
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        className,
      )}
    >
      {children}
    </span>
  )
}
