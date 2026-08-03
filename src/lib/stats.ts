import type { AttendanceRecord, AttendanceStatus } from '@/types'
import { toDateKey } from './utils'

export interface DayTrendPoint {
  date: string
  label: string
  present: number
  absent: number
  leave: number
}

export function buildTrend(records: AttendanceRecord[], days: number): DayTrendPoint[] {
  const byDate = new Map<string, AttendanceRecord[]>()
  records.forEach((r) => {
    const list = byDate.get(r.date) ?? []
    list.push(r)
    byDate.set(r.date, list)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const points: DayTrendPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const day = d.getDay()
    if (day === 0 || day === 6) continue
    const dateStr = toDateKey(d)
    const dayRecords = byDate.get(dateStr) ?? []
    points.push({
      date: dateStr,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      present: dayRecords.filter((r) => ['present', 'late', 'wfh', 'half-day'].includes(r.status)).length,
      absent: dayRecords.filter((r) => r.status === 'absent').length,
      leave: dayRecords.filter((r) => r.status === 'leave').length,
    })
  }

  return points
}

export function statusDistribution(records: AttendanceRecord[]): { status: AttendanceStatus; count: number }[] {
  const counts: Record<string, number> = {}
  records.forEach((r) => {
    counts[r.status] = (counts[r.status] ?? 0) + 1
  })
  return Object.entries(counts).map(([status, count]) => ({ status: status as AttendanceStatus, count }))
}
