export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500 dark:border-slate-700 dark:border-t-brand-400" />
    </div>
  )
}
