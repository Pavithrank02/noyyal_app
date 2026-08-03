import { NavLink } from 'react-router-dom'
import { CalendarCheck2, LayoutDashboard, LogOut, NotebookPen, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { Avatar } from '@/components/ui/Avatar'

const employeeNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/attendance', label: 'My Attendance', icon: CalendarCheck2 },
  { to: '/reports', label: 'My Reports', icon: NotebookPen },
]

const managerNav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/team-attendance', label: 'Team Attendance', icon: CalendarCheck2 },
  { to: '/team-reports', label: 'Team Reports', icon: NotebookPen },
  { to: '/team', label: 'Team', icon: Users },
]

export function Sidebar() {
  const currentEmployeeId = useAuthStore((s) => s.currentEmployeeId)
  const logout = useAuthStore((s) => s.logout)
  const employee = useDataStore((s) => (currentEmployeeId ? s.getEmployee(currentEmployeeId) : undefined))
  const nav = employee?.role === 'manager' ? managerNav : employeeNav

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white dark:border-slate-800/70 dark:bg-slate-900">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-400 font-bold text-white shadow-glow">
          N
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">Noyyal</p>
          <p className="text-[11px] leading-tight text-slate-400">Attendance &amp; Status</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {employee && (
        <div className="border-t border-slate-200/70 p-3 dark:border-slate-800/70">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar name={employee.name} color={employee.color} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{employee.name}</p>
              <p className="truncate text-xs text-slate-400">{employee.title}</p>
            </div>
            <button
              onClick={logout}
              aria-label="Log out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
