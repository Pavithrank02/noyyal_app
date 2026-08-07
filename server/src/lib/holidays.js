import { Holiday } from '../models/Holiday.js'

// Dates are plain YYYY-MM-DD calendar strings (see the `date`-field comments
// throughout this codebase) — parse as UTC so day-of-week doesn't shift
// depending on the server's own timezone.
export function isSunday(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay() === 0
}

// Every Sunday is automatically a holiday; anything else has to be an
// explicit entry in the Holiday collection.
export async function isHolidayDate(dateStr) {
  if (isSunday(dateStr)) return true
  const existing = await Holiday.findOne({ date: dateStr })
  return !!existing
}

export async function filterOutHolidays(dates) {
  if (dates.length === 0) return []
  const customHolidays = await Holiday.find({ date: { $in: dates } }).select('date')
  const customHolidaySet = new Set(customHolidays.map((h) => h.date))
  return dates.filter((date) => !isSunday(date) && !customHolidaySet.has(date))
}
