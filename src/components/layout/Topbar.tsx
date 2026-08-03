import { ThemeToggle } from '@/components/ThemeToggle'

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-8 py-5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <p className="text-sm text-slate-400">{subtitle ?? today}</p>
      </div>
      <ThemeToggle />
    </header>
  )
}
