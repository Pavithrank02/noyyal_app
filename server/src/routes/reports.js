import { Router } from 'express'
import { StatusReport } from '../models/StatusReport.js'
import { Employee } from '../models/Employee.js'
import { getVisibleEmployeeIds } from '../lib/scope.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const reportsRouter = Router()

reportsRouter.use(requireAuth)

// Employees only see their own reports; managers see their own + their team's.
reportsRouter.get('/', async (req, res) => {
  const visibleIds = await getVisibleEmployeeIds(req.employee)
  const { employeeId } = req.query

  if (employeeId) {
    if (!visibleIds.includes(employeeId)) {
      return res.status(403).json({ error: "You can't view that employee's reports." })
    }
    const reports = await StatusReport.find({ employeeId }).sort({ date: -1 })
    return res.json(reports)
  }

  const reports = await StatusReport.find({ employeeId: { $in: visibleIds } }).sort({ date: -1 })
  res.json(reports)
})

reportsRouter.post('/', async (req, res) => {
  const { date, summary, tasksCompleted, blockers, hoursWorked } = req.body
  if (!date || !summary) {
    return res.status(400).json({ error: 'date and summary are required.' })
  }

  const report = await StatusReport.findOneAndUpdate(
    { employeeId: req.employee.id, date },
    {
      employeeId: req.employee.id,
      date,
      summary,
      tasksCompleted: tasksCompleted ?? [],
      blockers: blockers ?? '',
      hoursWorked: hoursWorked ?? 0,
      submittedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  res.json(report)
})

// Only managers can delete report data, and only for their own team.
reportsRouter.delete('/:id', requireRole('manager'), async (req, res) => {
  const report = await StatusReport.findById(req.params.id)
  if (!report) return res.status(404).json({ error: 'Report not found.' })

  const target = await Employee.findById(report.employeeId)
  if (!target || String(target.managerId) !== req.employee.id) {
    return res.status(403).json({ error: 'You can only delete reports for your own team.' })
  }

  await report.deleteOne()
  res.status(204).end()
})
