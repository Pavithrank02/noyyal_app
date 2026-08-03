import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AttendanceRecord, AttendanceStatus, Employee, StatusReport } from '@/types'
import { todayISO } from '@/lib/utils'

const avatarPalette = ['#6366f1', '#06b6d4', '#f97316', '#22c55e', '#eab308', '#ec4899', '#8b5cf6', '#0ea5e9']

interface DataState {
  employees: Employee[]
  attendance: AttendanceRecord[]
  reports: StatusReport[]

  getEmployee: (id: string) => Employee | undefined
  getTeam: (managerId: string) => Employee[]
  getTodayRecord: (employeeId: string) => AttendanceRecord | undefined
  getAttendanceForEmployee: (employeeId: string) => AttendanceRecord[]
  getAttendanceForDate: (date: string) => AttendanceRecord[]
  getReportsForEmployee: (employeeId: string) => StatusReport[]
  getReportsForDate: (date: string) => StatusReport[]
  getReportForEmployeeDate: (employeeId: string, date: string) => StatusReport | undefined

  verifyLogin: (email: string, password: string) => Employee | undefined
  addEmployee: (data: Omit<Employee, 'id' | 'color'>) => Employee
  updateEmployee: (id: string, patch: Partial<Omit<Employee, 'id'>>) => void
  removeEmployee: (id: string) => void

  checkIn: (employeeId: string) => void
  checkOut: (employeeId: string) => void
  setManualStatus: (employeeId: string, date: string, status: AttendanceStatus) => void
  submitReport: (report: Omit<StatusReport, 'id' | 'submittedAt'>) => void
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      employees: [],
      attendance: [],
      reports: [],

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

      verifyLogin: (email, password) =>
        get().employees.find(
          (e) => e.email.toLowerCase() === email.trim().toLowerCase() && e.password === password,
        ),

      addEmployee: (data) => {
        const employee: Employee = {
          ...data,
          id: `emp-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
          color: avatarPalette[get().employees.length % avatarPalette.length],
        }
        set((state) => ({ employees: [...state.employees, employee] }))
        return employee
      },

      updateEmployee: (id, patch) => {
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }))
      },

      removeEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
          attendance: state.attendance.filter((a) => a.employeeId !== id),
          reports: state.reports.filter((r) => r.employeeId !== id),
        }))
      },

      checkIn: (employeeId) => {
        const date = todayISO()
        set((state) => {
          const existing = state.attendance.find((a) => a.employeeId === employeeId && a.date === date)
          if (existing) return state
          const now = new Date()
          const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)
          const record: AttendanceRecord = {
            id: `att-${employeeId}-${date}`,
            employeeId,
            date,
            checkIn: now.toISOString(),
            checkOut: null,
            status: isLate ? 'late' : 'present',
            hoursWorked: 0,
          }
          return { attendance: [...state.attendance, record] }
        })
      },

      checkOut: (employeeId) => {
        const date = todayISO()
        set((state) => ({
          attendance: state.attendance.map((a) => {
            if (a.employeeId !== employeeId || a.date !== date || !a.checkIn || a.checkOut) return a
            const now = new Date()
            const hours = (now.getTime() - new Date(a.checkIn).getTime()) / 3600000
            return { ...a, checkOut: now.toISOString(), hoursWorked: Math.round(hours * 10) / 10 }
          }),
        }))
      },

      setManualStatus: (employeeId, date, status) => {
        set((state) => {
          const existing = state.attendance.find((a) => a.employeeId === employeeId && a.date === date)
          if (existing) {
            return {
              attendance: state.attendance.map((a) =>
                a.id === existing.id ? { ...a, status, checkIn: null, checkOut: null, hoursWorked: 0 } : a,
              ),
            }
          }
          const record: AttendanceRecord = {
            id: `att-${employeeId}-${date}`,
            employeeId,
            date,
            checkIn: null,
            checkOut: null,
            status,
            hoursWorked: 0,
          }
          return { attendance: [...state.attendance, record] }
        })
      },

      submitReport: (report) => {
        set((state) => {
          const withoutExisting = state.reports.filter(
            (r) => !(r.employeeId === report.employeeId && r.date === report.date),
          )
          const newReport: StatusReport = {
            ...report,
            id: `rep-${report.employeeId}-${report.date}`,
            submittedAt: new Date().toISOString(),
          }
          return { reports: [...withoutExisting, newReport] }
        })
      },
    }),
    { name: 'noyyal-data-store' },
  ),
)
