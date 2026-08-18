import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ThemeToggle'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:text-sm'
const labelClass = 'mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400'

export function ForgotPassword() {
  const authStatus = useAuthStore((s) => s.status)
  const resetPassword = useAuthStore((s) => s.resetPassword)
  const navigate = useNavigate()

  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (authStatus === 'authenticated') return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await resetPassword(employeeId.trim(), password)
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-400/20 blur-3xl" />
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <img src="/logo-icon.png" alt="Noyyal" className="mx-auto mb-4 h-14 w-14 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Noyyal</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Attendance &amp; work status reporting, made effortless.
          </p>
        </div>

        <Card className="p-5">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <KeyRound className="h-3.5 w-3.5" /> Reset admin password
          </p>

          {done ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your password has been reset. You can log in with your new password now.
              </p>
              <Button className="w-full" size="lg" onClick={() => navigate('/login', { replace: true })}>
                Back to login
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs text-slate-400">
                This resets the password for the admin account (the manager role). Enter your employee ID and choose
                a new password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className={labelClass}>Employee ID</label>
                  <input
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    autoFocus
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={4}
                    className={inputClass}
                  />
                </div>
                {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? 'Please wait…' : 'Reset password'}
                </Button>
              </form>
            </>
          )}

          <Link
            to="/login"
            className="mt-4 block w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Back to login
          </Link>
        </Card>
      </div>
    </div>
  )
}
