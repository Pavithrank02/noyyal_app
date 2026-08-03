import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayTrendPoint } from '@/lib/stats'
import { statusColors } from './colors'

export function AttendanceTrendChart({ data }: { data: DayTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={statusColors.present} stopOpacity={0.35} />
            <stop offset="95%" stopColor={statusColors.present} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="absentFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={statusColors.absent} stopOpacity={0.35} />
            <stop offset="95%" stopColor={statusColors.absent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-slate-400"
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-400" axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.25)',
            fontSize: 12,
            background: 'rgba(255,255,255,0.95)',
          }}
        />
        <Area type="monotone" dataKey="present" name="Present" stroke={statusColors.present} strokeWidth={2} fill="url(#presentFill)" />
        <Area type="monotone" dataKey="absent" name="Absent" stroke={statusColors.absent} strokeWidth={2} fill="url(#absentFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
