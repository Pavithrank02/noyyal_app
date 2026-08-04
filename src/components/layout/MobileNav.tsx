import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { employeeNav, managerNav } from '@/lib/nav'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'

export function MobileNav() {
  const currentEmployeeId = useAuthStore((s) => s.currentEmployeeId)
  const employee = useDataStore((s) => (currentEmployeeId ? s.getEmployee(currentEmployeeId) : undefined))
  const nav = employee?.role === 'manager' ? managerNav : employeeNav

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t border-slate-200/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/95 lg:hidden"
      aria-label="Primary"
    >
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500',
            )
          }
        >
          <item.icon size={20} strokeWidth={2.25} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
