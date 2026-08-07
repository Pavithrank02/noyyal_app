import { create } from 'zustand'
import { api } from '@/lib/api'
import type { AttendanceRecord, AttendanceStatus, Employee, Holiday, LeaveRequest, LeaveStatus, StatusReport } from '@/types'
import { isSunday, todayISO } from '@/lib/utils'

interface DataState {
  employees: Employee[]
  attendance: AttendanceRecord[]
  reports: StatusReport[]
  leaveRequests: LeaveRequest[]
  holidays: Holiday[]
  status: 'idle' | 'loading' | 'ready'

  fetchAll: () => Promise<void>
  reset: () => void

  getEmployee: (id: string) => Employee | undefined
  getTeam: (managerId: string) => Employee[]
  getTodayRecord: (employeeId: string) => AttendanceRecord | undefined
  getAttendanceForEmployee: (employeeId: string) => AttendanceRecord[]
  getAttendanceForDate: (date: string) => AttendanceRecord[]
  getReportsForEmployee: (employeeId: string) => StatusReport[]
  getReportsForDate: (date: string) => StatusReport[]
  getReportForEmployeeDate: (employeeId: string, date: string) => StatusReport | undefined
  getLeaveRequestsForEmployee: (employeeId: string) => LeaveRequest[]
  getLeaveRequestsForTeam: (managerId: string) => LeaveRequest[]
  isHoliday: (date: string) => boolean
  getHolidayName: (date: string) => string | undefined

  addEmployee: (data: {
    employeeId: string
    name: string
    password: string
    department?: string
    title?: string
    role?: 'employee' | 'manager'
    managerId?: string
  }) => Promise<void>
  updateEmployee: (id: string, patch: Partial<Pick<Employee, 'name' | 'department' | 'title' | 'role' | 'managerId'>>) => Promise<void>
  removeEmployee: (id: string) => Promise<void>
  changePassword: (id: string, password: string) => Promise<void>

  checkIn: (employeeId: string) => Promise<void>
  checkOut: (employeeId: string) => Promise<void>
  setManualStatus: (employeeId: string, date: string, status: AttendanceStatus) => Promise<void>
  submitReport: (report: Omit<StatusReport, 'id' | 'submittedAt'>) => Promise<void>
  deleteAttendanceRecord: (id: string) => Promise<void>
  deleteReport: (id: string) => Promise<void>

  submitLeaveRequest: (data: { startDate: string; endDate: string; reason: string }) => Promise<void>
  decideLeaveRequest: (id: string, status: Extract<LeaveStatus, 'approved' | 'rejected'>) => Promise<void>
  deleteLeaveRequest: (id: string) => Promise<void>

  addHoliday: (data: { date: string; name: string }) => Promise<void>
  removeHoliday: (id: string) => Promise<void>
}

export const useDataStore = create<DataState>()((set, get) => ({
  employees: [],
  attendance: [],
  reports: [],
  leaveRequests: [],
  holidays: [],
  status: 'idle',

  fetchAll: async () => {
    set({ status: 'loading' })
    const [employees, attendance, reports, leaveRequests, holidays] = await Promise.all([
      api.get<Employee[]>('/api/employees'),
      api.get<AttendanceRecord[]>('/api/attendance'),
      api.get<StatusReport[]>('/api/reports'),
      api.get<LeaveRequest[]>('/api/leave-requests'),
      api.get<Holiday[]>('/api/holidays'),
    ])
    set({ employees, attendance, reports, leaveRequests, holidays, status: 'ready' })
  },

  reset: () => set({ employees: [], attendance: [], reports: [], leaveRequests: [], holidays: [], status: 'idle' }),

  getEmployee: (id) => get().employees.find((e) => e.id === id),
  getTeam: (managerId) => get().employees.filter((e) => e.managerId === managerId),

  getTodayRecord: (employeeId) => {
    const date = todayISO()
    return get().attendance.find((a) => a.employeeId === employeeId && a.date === date)
  },
  getAttendanceForEmployee: (employeeId) =>
    get()
      .attendance.filter((a) => a.employeeId === employeeId)
      .sort((a, b) => b.date.localeCompare(a.date)),
  getAttendanceForDate: (date) => get().attendance.filter((a) => a.date === date),

  getReportsForEmployee: (employeeId) =>
    get()
      .reports.filter((r) => r.employeeId === employeeId)
      .sort((a, b) => b.date.localeCompare(a.date)),
  getReportsForDate: (date) => get().reports.filter((r) => r.date === date),
  getReportForEmployeeDate: (employeeId, date) =>
    get().reports.find((r) => r.employeeId === employeeId && r.date === date),
  getLeaveRequestsForEmployee: (employeeId) =>
    get()
      .leaveRequests.filter((r) => r.employeeId === employeeId)
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
  getLeaveRequestsForTeam: (managerId) => {
    const teamIds = new Set(get().employees.filter((e) => e.managerId === managerId).map((e) => e.id))
    return get()
      .leaveRequests.filter((r) => teamIds.has(r.employeeId))
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  },
  isHoliday: (date) => isSunday(date) || get().holidays.some((h) => h.date === date),
  getHolidayName: (date) => {
    if (isSunday(date)) return 'Sunday'
    return get().holidays.find((h) => h.date === date)?.name
  },

  addEmployee: async (data) => {
    const employee = await api.post<Employee>('/api/employees', data)
    set((state) => ({ employees: [...state.employees, employee] }))
  },

  updateEmployee: async (id, patch) => {
    const updated = await api.patch<Employee>(`/api/employees/${id}`, patch)
    set((state) => ({ employees: state.employees.map((e) => (e.id === id ? updated : e)) }))
  },

  removeEmployee: async (id) => {
    await api.delete(`/api/employees/${id}`)
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
      attendance: state.attendance.filter((a) => a.employeeId !== id),
      reports: state.reports.filter((r) => r.employeeId !== id),
    }))
  },

  changePassword: async (id, password) => {
    await api.patch(`/api/employees/${id}/password`, { password })
  },

  checkIn: async (_employeeId) => {
    const date = todayISO()
    const now = new Date()
    const localMinutes = now.getHours() * 60 + now.getMinutes()
    const record = await api.post<AttendanceRecord>('/api/attendance/check-in', { date, localMinutes })
    set((state) => ({
      attendance: state.attendance.some((a) => a.id === record.id)
        ? state.attendance.map((a) => (a.id === record.id ? record : a))
        : [...state.attendance, record],
    }))
  },

  checkOut: async (employeeId) => {
    const date = todayISO()
    const record = await api.post<AttendanceRecord>('/api/attendance/check-out', { date })
    set((state) => ({ attendance: state.attendance.map((a) => (a.employeeId === employeeId && a.date === date ? record : a)) }))
  },

  setManualStatus: async (employeeId, date, status) => {
    const record = await api.patch<AttendanceRecord>('/api/attendance/manual', { employeeId, date, status })
    set((state) => ({
      attendance: state.attendance.some((a) => a.id === record.id)
        ? state.attendance.map((a) => (a.id === record.id ? record : a))
        : [...state.attendance, record],
    }))
  },

  submitReport: async (report) => {
    const saved = await api.post<StatusReport>('/api/reports', report)
    set((state) => ({
      reports: state.reports.some((r) => r.id === saved.id)
        ? state.reports.map((r) => (r.id === saved.id ? saved : r))
        : [...state.reports, saved],
    }))
  },

  deleteAttendanceRecord: async (id) => {
    await api.delete(`/api/attendance/${id}`)
    set((state) => ({ attendance: state.attendance.filter((a) => a.id !== id) }))
  },

  deleteReport: async (id) => {
    await api.delete(`/api/reports/${id}`)
    set((state) => ({ reports: state.reports.filter((r) => r.id !== id) }))
  },

  submitLeaveRequest: async (data) => {
    const request = await api.post<LeaveRequest>('/api/leave-requests', data)
    set((state) => ({ leaveRequests: [request, ...state.leaveRequests] }))
  },

  decideLeaveRequest: async (id, status) => {
    const updated = await api.patch<LeaveRequest>(`/api/leave-requests/${id}`, { status })
    set((state) => ({ leaveRequests: state.leaveRequests.map((r) => (r.id === id ? updated : r)) }))
    // Both approving and un-approving mutate attendance server-side (marking
    // or reverting 'leave' days), so refresh regardless of the new status.
    const attendance = await api.get<AttendanceRecord[]>('/api/attendance')
    set({ attendance })
  },

  deleteLeaveRequest: async (id) => {
    const wasApproved = get().leaveRequests.find((r) => r.id === id)?.status === 'approved'
    await api.delete(`/api/leave-requests/${id}`)
    set((state) => ({ leaveRequests: state.leaveRequests.filter((r) => r.id !== id) }))
    if (wasApproved) {
      const attendance = await api.get<AttendanceRecord[]>('/api/attendance')
      set({ attendance })
    }
  },

  addHoliday: async (data) => {
    const holiday = await api.post<Holiday>('/api/holidays', data)
    set((state) => ({ holidays: [...state.holidays, holiday].sort((a, b) => a.date.localeCompare(b.date)) }))
  },

  removeHoliday: async (id) => {
    await api.delete(`/api/holidays/${id}`)
    set((state) => ({ holidays: state.holidays.filter((h) => h.id !== id) }))
  },
}))
