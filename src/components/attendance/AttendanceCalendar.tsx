import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, todayISO } from '@/lib/utils'
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
          const isToday = cell.dateStr === todayStr
          return (
            <div
              key={i}
              title={record ? record.status : 'No record'}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium',
                record ? 'bg-slate-50 dark:bg-slate-800/60' : 'text-slate-300 dark:text-slate-700',
                isToday && 'ring-2 ring-brand-500',
              )}
            >
              <span className={record ? 'text-slate-700 dark:text-slate-200' : ''}>{cell.day}</span>
              {record && (
                <span className={cn('absolute bottom-1 h-1.5 w-1.5 rounded-full', statusDot[record.status])} />
              )}
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
      </div>
    </div>
  )
}
