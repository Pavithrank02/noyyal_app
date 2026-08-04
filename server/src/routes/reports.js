import { Router } from 'express'
import { StatusReport } from '../models/StatusReport.js'
import { requireAuth } from '../middleware/auth.js'

export const reportsRouter = Router()

reportsRouter.use(requireAuth)

reportsRouter.get('/', async (req, res) => {
  const { employeeId } = req.query
  const filter = employeeId ? { employeeId } : {}
  const reports = await StatusReport.find(filter).sort({ date: -1 })
  res.json(reports)
})

reportsRouter.post('/', async (req, res) => {
  const { date, summary, tasksCompleted, blockers, hoursWorked, workMode, mood } = req.body
  if (!date || !summary || !workMode || !mood) {
    return res.status(400).json({ error: 'date, summary, workMode, and mood are required.' })
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
      workMode,
      mood,
      submittedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  res.json(report)
})
