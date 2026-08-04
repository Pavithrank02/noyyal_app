import { useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ThemeToggle'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
const labelClass = 'mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400'

function Shell({ children }: { children: ReactNode }) {
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Noyyal</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Attendance &amp; work status reporting, made effortless.
          </p>
        </div>

        <Card className="p-5">{children}</Card>
      </div>
    </div>
  )
}

export function Login() {
  const authStatus = useAuthStore((s) => s.status)
  const signUp = useAuthStore((s) => s.signUp)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (authStatus === 'authenticated') return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signUp(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Shell>
      <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'login'
              ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'signup'
              ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Sign up
        </button>
      </div>

      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5" /> {mode === 'login' ? 'Welcome back' : 'Create your account'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <div>
            <label className={labelClass}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
        )}
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            className={inputClass}
          />
        </div>
        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </Button>
      </form>

      {mode === 'signup' && (
        <p className="mt-4 text-center text-xs text-slate-400">
          The first person to sign up becomes the workspace manager. Everyone after that is added to a team from
          the Team page.
        </p>
      )}
    </Shell>
  )
}
