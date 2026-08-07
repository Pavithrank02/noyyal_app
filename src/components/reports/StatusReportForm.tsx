import { useState, type FormEvent } from 'react'
import { Clock3, Plus, Send, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDataStore } from '@/store/useDataStore'
import { formatHours, todayISO } from '@/lib/utils'

export function StatusReportForm({ employeeId }: { employeeId: string }) {
  const date = todayISO()
  const existing = useDataStore((s) => s.getReportForEmployeeDate(employeeId, date))
  const todayRecord = useDataStore((s) => s.getTodayRecord(employeeId))
  const submitReport = useDataStore((s) => s.submitReport)

  const [summary, setSummary] = useState(existing?.summary ?? '')
  const [tasks, setTasks] = useState<string[]>(existing?.tasksCompleted ?? [''])
  const [blockers, setBlockers] = useState(existing?.blockers ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Hours worked is no longer typed in — it's whatever check-in/check-out
  // has recorded for today, same source as the CheckInCard's live counter.
  const hoursWorked = todayRecord?.hoursWorked ?? 0
  const hasCheckedOut = !!todayRecord?.checkOut

  function updateTask(i: number, value: string) {
    setTasks((prev) => prev.map((t, idx) => (idx === i ? value : t)))
  }

  function removeTask(i: number) {
    setTasks((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await submitReport({
        employeeId,
        date,
        summary,
        tasksCompleted: tasks.map((t) => t.trim()).filter(Boolean),
        blockers,
        hoursWorked,
      })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 2500)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existing ? "Update today's status report" : "Submit today's status report"}</CardTitle>
        {submitted && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved ✓</span>}
        {error && <span className="text-xs font-medium text-rose-500">{error}</span>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={2}
              placeholder="What did you focus on today?"
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition-colors sm:text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Tasks completed
            </label>
            <div className="space-y-2">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={task}
                    onChange={(e) => updateTask(i, e.target.value)}
                    placeholder={`Task ${i + 1}`}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition-colors sm:text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(i)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTasks((prev) => [...prev, ''])}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <Plus className="h-3.5 w-3.5" /> Add task
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Hours worked
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
              <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
              {hasCheckedOut ? (
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatHours(hoursWorked)}
                </span>
              ) : (
                <span className="text-sm text-slate-400">Recorded automatically once you check out</span>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Blockers <span className="text-slate-300">(optional)</span>
            </label>
            <input
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Anything slowing you down?"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition-colors sm:text-sm placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Send className="h-4 w-4" /> {existing ? 'Update report' : 'Submit report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
