import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { employees } from '@/store/useDataStore'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Login() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  function handleSelect(id: string) {
    login(id)
    navigate('/', { replace: true })
  }

  const manager = employees.find((e) => e.role === 'manager')
  const staff = employees.filter((e) => e.role === 'employee')

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-400/20 blur-3xl" />
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-400 text-2xl font-bold text-white shadow-glow">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome to Noyyal</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Attendance &amp; work status reporting, made effortless.
          </p>
        </div>

        <Card className="p-5">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Demo workspace &middot; choose a profile
          </p>

          {manager && (
            <button
              onClick={() => handleSelect(manager.id)}
              className="mb-3 flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:bg-brand-500/10"
            >
              <Avatar name={manager.name} color={manager.color} size="lg" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{manager.name}</p>
                <p className="text-xs text-slate-400">{manager.title} &middot; Manager view</p>
              </div>
            </button>
          )}

          <div className="mb-2 mt-1 h-px bg-slate-100 dark:bg-slate-800" />

          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {staff.map((e) => (
              <button
                key={e.id}
                onClick={() => handleSelect(e.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:bg-brand-500/10"
              >
                <Avatar name={e.name} color={e.color} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{e.name}</p>
                  <p className="text-xs text-slate-400">{e.title}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-400">
          No password needed &mdash; this demo signs you in by profile selection.
        </p>
      </div>
    </div>
  )
}
