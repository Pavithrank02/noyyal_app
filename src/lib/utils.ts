export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

// Local calendar date as YYYY-MM-DD. Deliberately avoids toISOString(),
// which converts to UTC and rolls the date backward in any timezone ahead
// of UTC (e.g. IST), desyncing "today" from what the UI shows.
export function toDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayISO(): string {
  return toDateKey(new Date())
}

export function formatTime(iso: string | null): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function isSunday(dateStr: string): boolean {
  return new Date(`${dateStr}T00:00:00`).getDay() === 0
}

export function formatHours(hours: number): string {
  return `${hours.toFixed(1)}h`
}

// HH:MM:SS elapsed between two instants, floored at zero.
export function formatDuration(fromIso: string, toMs: number): string {
  const totalSeconds = Math.max(0, Math.floor((toMs - new Date(fromIso).getTime()) / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
