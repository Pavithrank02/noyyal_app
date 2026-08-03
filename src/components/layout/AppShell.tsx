import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
