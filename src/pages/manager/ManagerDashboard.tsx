import { useMemo } from 'react'
import { CalendarX2, Clock3, UserCheck, Users } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { StatTile } from '@/components/ui/StatTile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TeamStatusList } from '@/components/attendance/TeamStatusList'
import { AttendanceTrendChart } from '@/components/charts/AttendanceTrendChart'
import { StatusPieChart } from '@/components/charts/StatusPieChart'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { buildTrend, statusDistribution } from '@/lib/stats'
import { todayISO } from '@/lib/utils'

export function ManagerDashboard() {
  const managerId = useAuthStore((s) => s.currentEmployeeId)!
  const team = useDataStore((s) => s.getTeam(managerId))
  const attendance = useDataStore((s) => s.attendance)

  const teamIds = useMemo(() => new Set(team.map((t) => t.id)), [team])
  const teamAttendance = useMemo(() => attendance.filter((a) => teamIds.has(a.employeeId)), [attendance, teamIds])

  const today = todayISO()
  const todayRecords = useMemo(() => teamAttendance.filter((a) => a.date === today), [teamAttendance, today])

  const stats = useMemo(() => {
    const present = todayRecords.filter((r) => ['present', 'late', 'wfh', 'half-day'].includes(r.status)).length
    const absent = todayRecords.filter((r) => r.status === 'absent').length
    const leave = todayRecords.filter((r) => r.status === 'leave').length
    const totalHours = todayRecords.reduce((s, r) => s + r.hoursWorked, 0)
    const avgHours = todayRecords.length ? totalHours / todayRecords.length : 0
    return { present, absent, leave, avgHours }
  }, [todayRecords])

  const trend = useMemo(() => buildTrend(teamAttendance, 14), [teamAttendance])
  const distribution = useMemo(() => statusDistribution(todayRecords), [todayRecords])

  return (
    <AppShell title="Team Overview" subtitle={`Live snapshot for ${team.length} team members.`}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Present today" value={`${stats.present}/${team.length}`} icon={UserCheck} tone="emerald" />
        <StatTile label="Absent today" value={`${stats.absent}`} icon={CalendarX2} tone="rose" />
        <StatTile label="On leave" value={`${stats.leave}`} icon={Users} tone="sky" />
        <StatTile label="Avg hours today" value={`${stats.avgHours.toFixed(1)}h`} icon={Clock3} tone="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Attendance trend &middot; last 14 working days</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTrendChart data={trend} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's status split</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={distribution} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Team status today</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <TeamStatusList team={team} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
