import { CalendarCheck2, CalendarOff, LayoutDashboard, NotebookPen, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const employeeNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck2 },
  { to: '/reports', label: 'Reports', icon: NotebookPen },
  { to: '/leave', label: 'Leave', icon: CalendarOff },
]

export const managerNav: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/team-attendance', label: 'Attendance', icon: CalendarCheck2 },
  { to: '/team-reports', label: 'Reports', icon: NotebookPen },
  { to: '/team-leave', label: 'Leave', icon: CalendarOff },
  { to: '/team', label: 'Team', icon: Users },
]
