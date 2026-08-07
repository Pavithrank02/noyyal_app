import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Trash2, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import type { Role } from '@/types'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:text-sm'
const labelClass = 'mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400'

function AddTeammateForm({ onDone }: { onDone: () => void }) {
  const addEmployee = useDataStore((s) => s.addEmployee)

  const [employeeId, setEmployeeId] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [title, setTitle] = useState('')
  const [role, setRole] = useState<Role>('employee')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await addEmployee({
        employeeId: employeeId.trim(),
        name: name.trim(),
        password,
        department: department.trim(),
        title: title.trim(),
        role,
      })
      onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Add teammate</h3>
        <button
          type="button"
          onClick={onDone}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Employee ID</label>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputClass}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
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
        </div>
        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          <Plus className="h-4 w-4" /> {submitting ? 'Adding…' : 'Add teammate'}
        </Button>
      </form>
    </Card>
  )
}

export function Team() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const team = useDataStore((s) => s.getTeam(managerId))
  const getTodayRecord = useDataStore((s) => s.getTodayRecord)
  const removeEmployee = useDataStore((s) => s.removeEmployee)
  const [showAdd, setShowAdd] = useState(false)
  const [removing, setRemoving] = useState<{ id: string; name: string } | null>(null)

  async function confirmRemove() {
    if (!removing) return
    const { id } = removing
    setRemoving(null)
    await removeEmployee(id)
  }

  return (
    <AppShell title="Team" subtitle={`${team.length} people report to you.`}>
      <div className="space-y-4">
        {showAdd ? (
          <AddTeammateForm onDone={() => setShowAdd(false)} />
        ) : (
          <div className="flex justify-end">
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" /> Add teammate
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((member) => {
            const record = getTodayRecord(member.id)
            return (
              <Card key={member.id} className="group relative p-4 transition-shadow hover:shadow-glow sm:p-5">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setRemoving({ id: member.id, name: member.name })
                  }}
                  aria-label={`Remove ${member.name}`}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Link to={`/team/${member.id}`}>
                  <div className="flex items-start justify-between pr-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} color={member.color} size="lg" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.title || 'No title set'}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{member.department || 'No department set'}</span>
                    <StatusBadge status={record?.status ?? 'absent'} />
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>

        {team.length === 0 && !showAdd && (
          <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-700">
            No teammates yet. Add your first one to get started.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.name ?? 'this teammate'}?`}
        message="They'll lose access and their attendance/report history will be removed too."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </AppShell>
  )
}
