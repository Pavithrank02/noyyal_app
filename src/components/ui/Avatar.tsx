import { initials } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function Avatar({ name, color, size = 'md' }: { name: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' }
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold text-white', sizes[size])}
      style={{ backgroundColor: color }}
    >
      {initials(name)}
    </div>
  )
}
