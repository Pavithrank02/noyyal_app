import type { AttendanceRecord, AttendanceStatus, Employee, Mood, StatusReport, WorkMode } from '@/types'
import { toDateKey } from './utils'

// Small deterministic PRNG so demo data is stable across reloads until the user
// generates their own records by using the app.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(42)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]

export const employees: Employee[] = [
  {
    id: 'mgr-1',
    name: 'Anitha Raj',
    email: 'anitha.raj@noyyal.app',
    role: 'manager',
    department: 'Engineering',
    title: 'Engineering Manager',
    color: '#6366f1',
    managerId: null,
  },
  {
    id: 'emp-1',
    name: 'Kathir Arumparam',
    email: 'kathir@noyyal.app',
    role: 'employee',
    department: 'Engineering',
    title: 'Frontend Engineer',
    color: '#06b6d4',
    managerId: 'mgr-1',
  },
  {
    id: 'emp-2',
    name: 'Divya Shankar',
    email: 'divya.shankar@noyyal.app',
    role: 'employee',
    department: 'Engineering',
    title: 'Backend Engineer',
    color: '#f97316',
    managerId: 'mgr-1',
  },
  {
    id: 'emp-3',
    name: 'Rahul Menon',
    email: 'rahul.menon@noyyal.app',
    role: 'employee',
    department: 'Design',
    title: 'Product Designer',
    color: '#22c55e',
    managerId: 'mgr-1',
  },
  {
    id: 'emp-4',
    name: 'Priya Natarajan',
    email: 'priya.n@noyyal.app',
    role: 'employee',
    department: 'QA',
    title: 'QA Engineer',
    color: '#eab308',
    managerId: 'mgr-1',
  },
  {
    id: 'emp-5',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@noyyal.app',
    role: 'employee',
    department: 'Engineering',
    title: 'DevOps Engineer',
    color: '#ec4899',
    managerId: 'mgr-1',
  },
]

const taskBank = [
  'Reviewed pull requests',
  'Fixed attendance sync bug',
  'Paired on dashboard charts',
  'Wrote unit tests',
  'Updated API documentation',
  'Attended sprint planning',
  'Refined onboarding flow',
  'Investigated production alert',
  'Deployed release candidate',
  'Met with stakeholders',
  'Optimized database queries',
  'Polished mobile layout',
]

const blockerBank = [
  '',
  '',
  '',
  'Waiting on design sign-off',
  'Blocked on staging environment access',
  'Need clarification on requirements',
]

const moods: Mood[] = ['great', 'steady', 'stretched']
const modes: WorkMode[] = ['office', 'wfh', 'hybrid']

function isWeekday(d: Date) {
  const day = d.getDay()
  return day !== 0 && day !== 6
}

const toDateStr = toDateKey

export function generateSeedData(days = 42): {
  attendance: AttendanceRecord[]
  reports: StatusReport[]
} {
  const attendance: AttendanceRecord[] = []
  const reports: StatusReport[] = []
  const staff = employees.filter((e) => e.role === 'employee')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    if (!isWeekday(date)) continue
    const dateStr = toDateStr(date)
    const isToday = i === 0

    for (const emp of staff) {
      const roll = rand()
      let status: AttendanceStatus = 'present'
      if (roll < 0.05) status = 'absent'
      else if (roll < 0.1) status = 'leave'
      else if (roll < 0.18) status = 'late'
      else if (roll < 0.32) status = 'wfh'
      else if (roll < 0.36) status = 'half-day'

      if (isToday && rand() < 0.4) {
        // leave "today" partly open (checked in, not out yet) for realism
        status = status === 'absent' || status === 'leave' ? status : 'present'
      }

      let checkIn: string | null = null
      let checkOut: string | null = null
      let hoursWorked = 0

      if (status !== 'absent' && status !== 'leave') {
        const baseHour = status === 'late' ? 10 : 9
        const inMinutes = Math.floor(rand() * 30)
        const inDate = new Date(date)
        inDate.setHours(baseHour, inMinutes, 0, 0)
        checkIn = inDate.toISOString()

        const isOpenToday = isToday && rand() < 0.35
        if (!isOpenToday) {
          const workHours = status === 'half-day' ? 4 + rand() * 1 : 7.5 + rand() * 1.5
          const outDate = new Date(inDate.getTime() + workHours * 3600 * 1000)
          checkOut = outDate.toISOString()
          hoursWorked = Math.round(workHours * 10) / 10
        }
      }

      attendance.push({
        id: `att-${emp.id}-${dateStr}`,
        employeeId: emp.id,
        date: dateStr,
        checkIn,
        checkOut,
        status,
        hoursWorked,
      })

      if (status !== 'absent' && status !== 'leave' && (checkOut || !isToday) && rand() < 0.85) {
        const taskCount = 2 + Math.floor(rand() * 3)
        const tasks = Array.from(new Set(Array.from({ length: taskCount }, () => pick(taskBank))))
        reports.push({
          id: `rep-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          date: dateStr,
          summary: `${tasks[0]} and ${taskCount > 1 ? 'more' : 'wrapped up for the day'}.`,
          tasksCompleted: tasks,
          blockers: pick(blockerBank),
          hoursWorked: hoursWorked || 7.5,
          workMode: status === 'wfh' ? 'wfh' : pick(modes),
          mood: pick(moods),
          submittedAt: new Date(date.setHours(18, Math.floor(rand() * 40))).toISOString(),
        })
      }
    }
  }

  return { attendance, reports }
}
