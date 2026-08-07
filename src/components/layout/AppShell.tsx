import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col overflow-y-auto">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
