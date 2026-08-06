import { Router } from 'express'
import { LeaveRequest } from '../models/LeaveRequest.js'
import { Attendance } from '../models/Attendance.js'
import { Employee } from '../models/Employee.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const leaveRequestsRouter = Router()

leaveRequestsRouter.use(requireAuth)

function datesBetween(start, end) {
  const dates = []
  const cursor = new Date(`${start}T00:00:00Z`)
  const last = new Date(`${end}T00:00:00Z`)
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

leaveRequestsRouter.get('/', async (req, res) => {
  const { employeeId } = req.query
  const filter = employeeId ? { employeeId } : {}
  const requests = await LeaveRequest.find(filter).sort({ requestedAt: -1 })
  res.json(requests)
})

leaveRequestsRouter.post('/', async (req, res) => {
  const { startDate, endDate, reason } = req.body
  if (!startDate || !endDate || !reason?.trim()) {
    return res.status(400).json({ error: 'Start date, end date, and a reason are required.' })
  }
  if (endDate < startDate) {
    return res.status(400).json({ error: 'End date must be on or after the start date.' })
  }
  if (datesBetween(startDate, endDate).length > 60) {
    return res.status(400).json({ error: 'Leave requests cannot span more than 60 days.' })
  }

  const request = await LeaveRequest.create({
    employeeId: req.employee.id,
    startDate,
    endDate,
    reason: reason.trim(),
  })
  res.status(201).json(request)
})

leaveRequestsRouter.patch('/:id', requireRole('manager'), async (req, res) => {
  const { status } = req.body
  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: "status must be 'approved' or 'rejected'." })
  }

  const request = await LeaveRequest.findById(req.params.id)
  if (!request) return res.status(404).json({ error: 'Leave request not found.' })
  if (request.status !== 'pending') return res.status(409).json({ error: 'This request was already decided.' })

  const target = await Employee.findById(request.employeeId)
  if (!target || String(target.managerId) !== req.employee.id) {
    return res.status(403).json({ error: 'You can only decide on requests from your own team.' })
  }

  request.status = status
  request.decidedAt = new Date()
  request.decidedBy = req.employee.id
  await request.save()

  if (status === 'approved') {
    const dates = datesBetween(request.startDate, request.endDate)
    await Promise.all(
      dates.map((date) =>
        Attendance.findOneAndUpdate(
          { employeeId: request.employeeId, date },
          { employeeId: request.employeeId, date, status: 'leave', checkIn: null, checkOut: null, hoursWorked: 0 },
          { upsert: true, setDefaultsOnInsert: true },
        ),
      ),
    )
  }

  res.json(request)
})
