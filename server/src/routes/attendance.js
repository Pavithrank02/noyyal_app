import { Router } from 'express'
import { Attendance } from '../models/Attendance.js'
import { Employee } from '../models/Employee.js'
import { requireAuth } from '../middleware/auth.js'

export const attendanceRouter = Router()

attendanceRouter.use(requireAuth)

// The caller supplies `date` (their local YYYY-MM-DD) since "today" depends on
// the user's timezone, not the server's — see src/lib/utils.ts's toDateKey.
attendanceRouter.get('/', async (req, res) => {
  const { employeeId } = req.query
  const filter = employeeId ? { employeeId } : {}
  const records = await Attendance.find(filter).sort({ date: -1 })
  res.json(records)
})

attendanceRouter.post('/check-in', async (req, res) => {
  const { date } = req.body
  if (!date) return res.status(400).json({ error: 'date is required.' })

  const existing = await Attendance.findOne({ employeeId: req.employee.id, date })
  if (existing) return res.json(existing)

  const now = new Date()
  const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)
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
