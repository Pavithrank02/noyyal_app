import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, todayISO } from '@/lib/utils'
import { useDataStore } from '@/store/useDataStore'
import type { AttendanceRecord } from '@/types'

const statusDot: Record<string, string> = {
  present: 'bg-emerald-500',
  late: 'bg-amber-500',
  absent: 'bg-rose-500',
  leave: 'bg-violet-500',
  wfh: 'bg-sky-500',
  'half-day': 'bg-orange-500',
}

export function AttendanceCalendar({ records }: { records: AttendanceRecord[] }) {
  const isHoliday = useDataStore((s) => s.isHoliday)
  const getHolidayName = useDataStore((s) => s.getHolidayName)
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  const recordByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>()
    records.forEach((r) => map.set(r.date, r))
    return map
  }, [records])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = todayISO()

  const cells: Array<{ day: number; dateStr: string } | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, dateStr })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="pb-1 text-[11px] font-medium text-slate-400">
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />
          const record = recordByDate.get(cell.dateStr)
          // A real attendance record (e.g. someone voluntarily worked a
          // holiday) always takes priority over the holiday styling.
          const holiday = !record && isHoliday(cell.dateStr)
          const isToday = cell.dateStr === todayStr
          return (
            <div
              key={i}
              title={record ? record.status : holiday ? (getHolidayName(cell.dateStr) ?? 'Holiday') : 'No record'}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium',
                record
                  ? 'bg-slate-50 dark:bg-slate-800/60'
                  : holiday
                    ? 'bg-indigo-50 dark:bg-indigo-500/10'
                    : 'text-slate-300 dark:text-slate-700',
                isToday && 'ring-2 ring-brand-500',
              )}
            >
              <span
                className={cn(
                  record
                    ? 'text-slate-700 dark:text-slate-200'
                    : holiday
                      ? 'text-indigo-500 dark:text-indigo-400'
                      : '',
                )}
              >
                {cell.day}
              </span>
              {record && (
                <span className={cn('absolute bottom-1 h-1.5 w-1.5 rounded-full', statusDot[record.status])} />
              )}
              {!record && holiday && <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(statusDot).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className={cn('h-1.5 w-1.5 rounded-full', color)} />
            <span className="capitalize">{status.replace('-', ' ')}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <span>Holiday</span>
        </div>
      </div>
    </div>
  )
}
