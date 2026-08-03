import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ThemeToggle'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
const labelClass = 'mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400'

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <Card className="p-5">{children}</Card>
      </div>
    </div>
  )
}

function SetupForm() {
  const addEmployee = useDataStore((s) => s.addEmployee)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [title, setTitle] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    const employee = addEmployee({
      name: name.trim(),
      email: email.trim(),
      password,
      role: 'manager',
      department: department.trim(),
      title: title.trim(),
      managerId: null,
    })
    login(employee.id)
    navigate('/', { replace: true })
  }

  return (
    <>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5" /> Set up your workspace
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>
        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        <Button type="submit" className="w-full" size="lg">
          Create manager account
        </Button>
      </form>
    </>
  )
}

function LoginForm() {
  const verifyLogin = useDataStore((s) => s.verifyLogin)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const employee = verifyLogin(email, password)
    if (!employee) {
      setError('Incorrect email or password.')
      return
    }
    login(employee.id)
    navigate('/', { replace: true })
  }

  return (
    <>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5" /> Sign in
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
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
            className={inputClass}
          />
        </div>
        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        <Button type="submit" className="w-full" size="lg">
          Log in
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-400">New teammates are added by your manager from Team.</p>
    </>
  )
}

export function Login() {
  const hasEmployees = useDataStore((s) => s.employees.length > 0)

  if (!hasEmployees) {
    return (
      <Shell title="Welcome to Noyyal" subtitle="Attendance & work status reporting, made effortless.">
        <SetupForm />
      </Shell>
    )
  }

  return (
    <Shell title="Welcome back" subtitle="Attendance & work status reporting, made effortless.">
      <LoginForm />
    </Shell>
  )
}
