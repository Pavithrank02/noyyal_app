import type { AttendanceStatus } from '@/types'

export const statusColors: Record<AttendanceStatus, string> = {
  present: '#10b981',
  late: '#f59e0b',
  absent: '#f43f5e',
  leave: '#8b5cf6',
  wfh: '#0ea5e9',
  'half-day': '#f97316',
}

export const statusLabels: Record<AttendanceStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  leave: 'On Leave',
  wfh: 'WFH',
  'half-day': 'Half Day',
}
