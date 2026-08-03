import { Link } from 'react-router-dom'
import { FileCheck2, FileX2 } from 'lucide-react'
import type { Employee } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { useDataStore } from '@/store/useDataStore'
import { formatTime, todayISO } from '@/lib/utils'

export function TeamStatusList({ team }: { team: Employee[] }) {
  const getTodayRecord = useDataStore((s) => s.getTodayRecord)
  const getReportForEmployeeDate = useDataStore((s) => s.getReportForEmployeeDate)
  const today = todayISO()

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {team.map((member) => {
        const record = getTodayRecord(member.id)
        const report = getReportForEmployeeDate(member.id, today)
        return (
          <Link
            key={member.id}
            to={`/team/${member.id}`}
            className="flex items-center gap-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-lg"
          >
            <Avatar name={member.name} color={member.color} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{member.name}</p>
              <p className="truncate text-xs text-slate-400">
                {member.title} &middot; In {formatTime(record?.checkIn ?? null)}
              </p>
            </div>
            {report ? (
              <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Report submitted" />
            ) : (
              <FileX2 className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" aria-label="No report yet" />
            )}
            <StatusBadge status={record?.status ?? 'absent'} />
          </Link>
        )
      })}
    </div>
  )
}
