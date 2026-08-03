import { useState, type FormEvent } from 'react'
import { Plus, Send, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDataStore } from '@/store/useDataStore'
import { todayISO } from '@/lib/utils'
import type { Mood, WorkMode } from '@/types'

const moodOptions: { value: Mood; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '🟢' },
  { value: 'steady', label: 'Steady', emoji: '🔵' },
  { value: 'stretched', label: 'Stretched', emoji: '🟠' },
]

const modeOptions: { value: WorkMode; label: string }[] = [
  { value: 'office', label: 'Office' },
  { value: 'wfh', label: 'WFH' },
  { value: 'hybrid', label: 'Hybrid' },
]

export function StatusReportForm({ employeeId }: { employeeId: string }) {
  const date = todayISO()
  const existing = useDataStore((s) => s.getReportForEmployeeDate(employeeId, date))
  const submitReport = useDataStore((s) => s.submitReport)

  const [summary, setSummary] = useState(existing?.summary ?? '')
  const [tasks, setTasks] = useState<string[]>(existing?.tasksCompleted ?? [''])
  const [blockers, setBlockers] = useState(existing?.blockers ?? '')
  const [hoursWorked, setHoursWorked] = useState(existing?.hoursWorked ?? 8)
  const [workMode, setWorkMode] = useState<WorkMode>(existing?.workMode ?? 'office')
  const [mood, setMood] = useState<Mood>(existing?.mood ?? 'steady')
  const [submitted, setSubmitted] = useState(false)

  function updateTask(i: number, value: string) {
    setTasks((prev) => prev.map((t, idx) => (idx === i ? value : t)))
  }

  function removeTask(i: number) {
    setTasks((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submitReport({
      employeeId,
      date,
      summary,
      tasksCompleted: tasks.map((t) => t.trim()).filter(Boolean),
      blockers,
      hoursWorked,
      workMode,
      mood,
    })
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existing ? "Update today's status report" : "Submit today's status report"}</CardTitle>
        {submitted && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved ✓</span>}
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
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Hours worked
              </label>
              <input
                type="number"
                min={0}
                max={16}
                step={0.5}
                value={hoursWorked}
                onChange={(e) => setHoursWorked(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Work mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {modeOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              How's your day going?
            </label>
            <div className="flex gap-2">
              {moodOptions.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    mood === m.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
