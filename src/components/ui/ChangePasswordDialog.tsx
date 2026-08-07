import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:text-sm'
const labelClass = 'mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400'

export function ChangePasswordDialog({
  open,
  title,
  onSubmit,
  onCancel,
}: {
  open: boolean
  title: string
  onSubmit: (password: string) => Promise<void>
  onCancel: () => void
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(password)
      setPassword('')
      setConfirm('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    setPassword('')
    setConfirm('')
    setError('')
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60" onClick={handleCancel} />
      <Card className="relative w-full max-w-sm animate-fade-in p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              <div>
                <label className={labelClass}>New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  autoFocus
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
                  minLength={4}
                  className={inputClass}
                />
              </div>
              {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Change password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  )
}
