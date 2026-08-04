import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Trash2, UserPlus } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'

export function Team() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const employees = useDataStore((s) => s.employees)
  const team = useDataStore((s) => s.getTeam(managerId))
  const getTodayRecord = useDataStore((s) => s.getTodayRecord)
  const removeEmployee = useDataStore((s) => s.removeEmployee)
  const updateEmployee = useDataStore((s) => s.updateEmployee)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const unassigned = employees.filter((e) => e.managerId === null && e.id !== managerId)

  async function handleClaim(id: string) {
    setClaimingId(id)
    try {
      await updateEmployee(id, { managerId })
    } finally {
      setClaimingId(null)
    }
  }

  async function handleRemove(id: string, name: string) {
    if (!confirm(`Remove ${name} from your team?`)) return
    await removeEmployee(id)
  }

  return (
    <AppShell title="Team" subtitle={`${team.length} people report to you.`}>
      <div className="space-y-6">
        {unassigned.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              Unassigned sign-ups ({unassigned.length})
            </h3>
            <div className="space-y-2">
              {unassigned.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={person.name} color={person.color} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{person.name}</p>
                      <p className="text-xs text-slate-400">{person.email}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleClaim(person.id)} disabled={claimingId === person.id}>
                    <UserPlus className="h-3.5 w-3.5" /> Add to my team
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((member) => {
            const record = getTodayRecord(member.id)
            return (
              <Card key={member.id} className="group relative p-5 transition-shadow hover:shadow-glow">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemove(member.id, member.name)
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

        {team.length === 0 && unassigned.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-700">
            No teammates yet. Once someone signs up, they'll appear here to add to your team.
          </p>
        )}
      </div>
    </AppShell>
  )
}
