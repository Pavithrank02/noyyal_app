import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'

export function Team() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const team = useDataStore((s) => s.getTeam(managerId))
  const getTodayRecord = useDataStore((s) => s.getTodayRecord)

  return (
    <AppShell title="Team" subtitle={`${team.length} people report to you.`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {team.map((member) => {
          const record = getTodayRecord(member.id)
          return (
            <Link key={member.id} to={`/team/${member.id}`}>
              <Card className="group p-5 transition-shadow hover:shadow-glow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} color={member.color} size="lg" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.title}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{member.department}</span>
                  <StatusBadge status={record?.status ?? 'absent'} />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </AppShell>
  )
}
