import { Router } from 'express'
import { Holiday } from '../models/Holiday.js'
import { isSunday } from '../lib/holidays.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const holidaysRouter = Router()

holidaysRouter.use(requireAuth)

// Visible to everyone (employees see holidays on their own calendar too).
holidaysRouter.get('/', async (_req, res) => {
  const holidays = await Holiday.find().sort({ date: 1 })
  res.json(holidays)
})

holidaysRouter.post('/', requireRole('manager'), async (req, res) => {
  const { date, name } = req.body
  if (!date || !name?.trim()) {
    return res.status(400).json({ error: 'Date and a name are required.' })
  }
  if (isSunday(date)) {
    return res.status(400).json({ error: 'Every Sunday is already a holiday automatically.' })
  }

  const existing = await Holiday.findOne({ date })
  if (existing) return res.status(409).json({ error: 'That date is already marked as a holiday.' })

  const holiday = await Holiday.create({ date, name: name.trim(), createdBy: req.employee.id })
  res.status(201).json(holiday)
})

holidaysRouter.delete('/:id', requireRole('manager'), async (req, res) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id)
  if (!holiday) return res.status(404).json({ error: 'Holiday not found.' })
  res.status(204).end()
})
