export type Role = 'employee' | 'manager'

export interface Employee {
  id: string
  employeeId: string
  name: string
  role: Role
  department: string
  title: string
  color: string
  managerId: string | null
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'wfh' | 'half-day'

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  checkIn: string | null // ISO timestamp
  checkOut: string | null // ISO timestamp
  status: AttendanceStatus
  hoursWorked: number
}

export type WorkMode = 'office' | 'wfh' | 'hybrid'
export type Mood = 'great' | 'steady' | 'stretched'

export interface StatusReport {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  summary: string
  tasksCompleted: string[]
  blockers: string
  hoursWorked: number
  workMode: WorkMode
  mood: Mood
  submittedAt: string // ISO timestamp
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequest {
  id: string
  employeeId: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  reason: string
  status: LeaveStatus
  requestedAt: string // ISO timestamp
  decidedAt: string | null // ISO timestamp
  decidedBy: string | null
}

export interface Holiday {
  id: string
  date: string // YYYY-MM-DD
  name: string
  createdBy: string
}
