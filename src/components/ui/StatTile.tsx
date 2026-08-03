import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from './Card'

interface StatTileProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: 'brand' | 'emerald' | 'amber' | 'rose' | 'sky'
  hint?: string
}

const toneStyles = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
}

export function StatTile({ label, value, icon: Icon, tone = 'brand', hint }: StatTileProps) {
  return (
    <Card className="animate-fade-in p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', toneStyles[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}
