import { Router } from 'express'
import { LeaveRequest } from '../models/LeaveRequest.js'
import { Attendance } from '../models/Attendance.js'
import { Employee } from '../models/Employee.js'
import { getVisibleEmployeeIds } from '../lib/scope.js'
import { filterOutHolidays } from '../lib/holidays.js'
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

// Marks each working day in the range as 'leave' (Sundays/holidays are
// skipped — no point spending a leave day on a day off you already had).
// Used when a request becomes approved.
async function markAttendanceAsLeave(employeeId, startDate, endDate) {
  const dates = await filterOutHolidays(datesBetween(startDate, endDate))
  await Promise.all(
    dates.map((date) =>
      Attendance.findOneAndUpdate(
        { employeeId, date },
        { employeeId, date, status: 'leave', checkIn: null, checkOut: null, hoursWorked: 0 },
        { upsert: true, setDefaultsOnInsert: true },
      ),
    ),
  )
}

// Removes the auto-created 'leave' attendance records for the range. Only
// touches records still marked 'leave', so a later manual override elsewhere
// isn't clobbered. Used when un-approving or deleting an approved request.
async function revertLeaveAttendance(employeeId, startDate, endDate) {
  const dates = datesBetween(startDate, endDate)
  await Attendance.deleteMany({ employeeId, date: { $in: dates }, status: 'leave' })
}

async function assertOwnsRequest(req, request) {
  const target = await Employee.findById(request.employeeId)
  return target && String(target.managerId) === req.employee.id
}

// Employees only see their own requests; managers see their own + their team's.
leaveRequestsRouter.get('/', async (req, res) => {
  const visibleIds = await getVisibleEmployeeIds(req.employee)
  const { employeeId } = req.query

  if (employeeId) {
    if (!visibleIds.includes(employeeId)) {
      return res.status(403).json({ error: "You can't view that employee's leave requests." })
    }
    const requests = await LeaveRequest.find({ employeeId }).sort({ requestedAt: -1 })
    return res.json(requests)
  }

  const requests = await LeaveRequest.find({ employeeId: { $in: visibleIds } }).sort({ requestedAt: -1 })
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

// Managers can decide a pending request, or change their mind later — on both
// the pending queue and history, this same route re-decides the request.
leaveRequestsRouter.patch('/:id', requireRole('manager'), async (req, res) => {
  const { status } = req.body
  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: "status must be 'approved' or 'rejected'." })
  }

  const request = await LeaveRequest.findById(req.params.id)
  if (!request) return res.status(404).json({ error: 'Leave request not found.' })
  if (!(await assertOwnsRequest(req, request))) {
    return res.status(403).json({ error: 'You can only decide on requests from your own team.' })
  }

  const wasApproved = request.status === 'approved'
  request.status = status
  request.decidedAt = new Date()
  request.decidedBy = req.employee.id
  await request.save()

  if (status === 'approved') {
    await markAttendanceAsLeave(request.employeeId, request.startDate, request.endDate)
  } else if (wasApproved) {
    await revertLeaveAttendance(request.employeeId, request.startDate, request.endDate)
  }

  res.json(request)
})

// Only managers can delete leave request history, and only for their own team.
leaveRequestsRouter.delete('/:id', requireRole('manager'), async (req, res) => {
  const request = await LeaveRequest.findById(req.params.id)
  if (!request) return res.status(404).json({ error: 'Leave request not found.' })
  if (!(await assertOwnsRequest(req, request))) {
    return res.status(403).json({ error: 'You can only delete requests from your own team.' })
  }

  if (request.status === 'approved') {
    await revertLeaveAttendance(request.employeeId, request.startDate, request.endDate)
  }
  await request.deleteOne()
  res.status(204).end()
})
