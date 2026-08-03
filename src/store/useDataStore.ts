import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AttendanceRecord, AttendanceStatus, StatusReport } from '@/types'
import { employees } from '@/lib/seed'
import { generateSeedData } from '@/lib/seed'
import { todayISO } from '@/lib/utils'

interface DataState {
  attendance: AttendanceRecord[]
  reports: StatusReport[]

  getEmployee: (id: string) => (typeof employees)[number] | undefined
  getTeam: (managerId: string) => typeof employees
  getTodayRecord: (employeeId: string) => AttendanceRecord | undefined
  getAttendanceForEmployee: (employeeId: string) => AttendanceRecord[]
  getAttendanceForDate: (date: string) => AttendanceRecord[]
  getReportsForEmployee: (employeeId: string) => StatusReport[]
  getReportsForDate: (date: string) => StatusReport[]
  getReportForEmployeeDate: (employeeId: string, date: string) => StatusReport | undefined

  checkIn: (employeeId: string) => void
  checkOut: (employeeId: string) => void
  setManualStatus: (employeeId: string, date: string, status: AttendanceStatus) => void
  submitReport: (report: Omit<StatusReport, 'id' | 'submittedAt'>) => void
  resetDemoData: () => void
}

function seedIfEmpty() {
  const { attendance, reports } = generateSeedData()
  return { attendance, reports }
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...seedIfEmpty(),

      getEmployee: (id) => employees.find((e) => e.id === id),
      getTeam: (managerId) => employees.filter((e) => e.managerId === managerId),

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

      resetDemoData: () => set(seedIfEmpty()),
    }),
    { name: 'noyyal-data-store' },
  ),
)

export { employees }
