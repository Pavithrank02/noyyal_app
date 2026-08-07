import { useState } from 'react'
import { KeyRound, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Avatar } from '@/components/ui/Avatar'
import { ChangePasswordDialog } from '@/components/ui/ChangePasswordDialog'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const currentEmployeeId = useAuthStore((s) => s.currentEmployeeId)
  const logout = useAuthStore((s) => s.logout)
  const employee = useDataStore((s) => (currentEmployeeId ? s.getEmployee(currentEmployeeId) : undefined))
  const changePassword = useDataStore((s) => s.changePassword)
  const [changingPassword, setChangingPassword] = useState(false)

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70 sm:px-8 sm:py-5">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
          {title}
        </h1>
        <p className="truncate text-xs text-slate-400 sm:text-sm">{subtitle ?? today}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        {employee && (
          <div className="flex items-center gap-1.5 lg:hidden">
            <Avatar name={employee.name} color={employee.color} size="sm" />
            {employee.role === 'manager' && (
              <button
                onClick={() => setChangingPassword(true)}
                aria-label="Change password"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <KeyRound className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={logout}
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {employee && employee.role === 'manager' && (
        <ChangePasswordDialog
          open={changingPassword}
          title="Change my password"
          onSubmit={async (password) => {
            await changePassword(employee.id, password)
            setChangingPassword(false)
          }}
          onCancel={() => setChangingPassword(false)}
        />
      )}
    </header>
  )
}
