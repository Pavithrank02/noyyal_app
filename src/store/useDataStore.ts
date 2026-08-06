import { create } from 'zustand'
import { api } from '@/lib/api'
import type { AttendanceRecord, AttendanceStatus, Employee, StatusReport } from '@/types'
import { todayISO } from '@/lib/utils'

interface DataState {
  employees: Employee[]
  attendance: AttendanceRecord[]
  reports: StatusReport[]
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

  checkIn: (employeeId: string) => Promise<void>
  checkOut: (employeeId: string) => Promise<void>
  setManualStatus: (employeeId: string, date: string, status: AttendanceStatus) => Promise<void>
  submitReport: (report: Omit<StatusReport, 'id' | 'submittedAt'>) => Promise<void>
}

export const useDataStore = create<DataState>()((set, get) => ({
  employees: [],
  attendance: [],
  reports: [],
  status: 'idle',

  fetchAll: async () => {
    set({ status: 'loading' })
    const [employees, attendance, reports] = await Promise.all([
      api.get<Employee[]>('/api/employees'),
      api.get<AttendanceRecord[]>('/api/attendance'),
      api.get<StatusReport[]>('/api/reports'),
    ])
    set({ employees, attendance, reports, status: 'ready' })
  },

  reset: () => set({ employees: [], attendance: [], reports: [], status: 'idle' }),

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

  checkIn: async (_employeeId) => {
    const date = todayISO()
    const record = await api.post<AttendanceRecord>('/api/attendance/check-in', { date })
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
}))
