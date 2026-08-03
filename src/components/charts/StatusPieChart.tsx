import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { AttendanceStatus } from '@/types'
import { statusColors, statusLabels } from './colors'

export function StatusPieChart({ data }: { data: { status: AttendanceStatus; count: number }[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">No data for today yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={statusColors[entry.status]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, _name, item) => [value, statusLabels[item.payload.status as AttendanceStatus]]}
          contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.25)', fontSize: 12 }}
        />
        <Legend
          formatter={(value) => statusLabels[value as AttendanceStatus]}
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
