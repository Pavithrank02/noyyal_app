import { Router } from 'express'
import { Attendance } from '../models/Attendance.js'
import { Employee } from '../models/Employee.js'
import { getVisibleEmployeeIds } from '../lib/scope.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const attendanceRouter = Router()

attendanceRouter.use(requireAuth)

// The caller supplies `date` (their local YYYY-MM-DD) since "today" depends on
// the user's timezone, not the server's — see src/lib/utils.ts's toDateKey.
// Employees only see their own records; managers see their own + their team's.
attendanceRouter.get('/', async (req, res) => {
  const visibleIds = await getVisibleEmployeeIds(req.employee)
  const { employeeId } = req.query

  if (employeeId) {
    if (!visibleIds.includes(employeeId)) {
      return res.status(403).json({ error: "You can't view that employee's attendance." })
    }
    const records = await Attendance.find({ employeeId }).sort({ date: -1 })
    return res.json(records)
  }

  const records = await Attendance.find({ employeeId: { $in: visibleIds } }).sort({ date: -1 })
  res.json(records)
})

attendanceRouter.post('/check-in', async (req, res) => {
  // `localMinutes` is minutes-since-midnight in the employee's own timezone
  // (computed client-side), not the server's — Render runs in UTC, so
  // deriving "9:30 AM" from the server's own clock would be wrong for
  // everyone. Same reasoning as `date` above.
  const { date, localMinutes } = req.body
  if (!date) return res.status(400).json({ error: 'date is required.' })

  const existing = await Attendance.findOne({ employeeId: req.employee.id, date })
  if (existing) return res.json(existing)

  const now = new Date()
  // 30-minute grace period from 9:00 AM — check in after 9:30 counts as late.
  const minutesSinceMidnight = typeof localMinutes === 'number' ? localMinutes : now.getHours() * 60 + now.getMinutes()
  const isLate = minutesSinceMidnight > 9 * 60 + 30
  const record = await Attendance.create({
    employeeId: req.employee.id,
    date,
    checkIn: now,
    checkOut: null,
    status: isLate ? 'late' : 'present',
    hoursWorked: 0,
  })
  res.status(201).json(record)
})

attendanceRouter.post('/check-out', async (req, res) => {
  const { date } = req.body
  if (!date) return res.status(400).json({ error: 'date is required.' })

  const record = await Attendance.findOne({ employeeId: req.employee.id, date })
  if (!record || !record.checkIn || record.checkOut) return res.json(record)

  const now = new Date()
  const hours = (now.getTime() - record.checkIn.getTime()) / 3600000
  record.checkOut = now
  record.hoursWorked = Math.round(hours * 10) / 10
  await record.save()
  res.json(record)
})

// Manager sets/overrides a status for someone on their team.
attendanceRouter.patch('/manual', async (req, res) => {
  const { employeeId, date, status } = req.body
  if (!employeeId || !date || !status) {
    return res.status(400).json({ error: 'employeeId, date, and status are required.' })
  }

  if (employeeId !== req.employee.id) {
    const target = await Employee.findById(employeeId)
    if (!target || String(target.managerId) !== req.employee.id) {
      return res.status(403).json({ error: 'You can only set status for your own team.' })
    }
  }

  const record = await Attendance.findOneAndUpdate(
    { employeeId, date },
    { employeeId, date, status, checkIn: null, checkOut: null, hoursWorked: 0 },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  res.json(record)
})

// Only managers can delete attendance data, and only for their own team.
attendanceRouter.delete('/:id', requireRole('manager'), async (req, res) => {
  const record = await Attendance.findById(req.params.id)
  if (!record) return res.status(404).json({ error: 'Attendance record not found.' })

  const target = await Employee.findById(record.employeeId)
  if (!target || String(target.managerId) !== req.employee.id) {
    return res.status(403).json({ error: 'You can only delete records for your own team.' })
  }

  await record.deleteOne()
  res.status(204).end()
})
