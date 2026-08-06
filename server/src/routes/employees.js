import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { Employee } from '../models/Employee.js'
import { Attendance } from '../models/Attendance.js'
import { StatusReport } from '../models/StatusReport.js'
import { nextColor } from '../lib/colors.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const employeesRouter = Router()

employeesRouter.use(requireAuth)

employeesRouter.get('/', async (_req, res) => {
  const employees = await Employee.find()
  res.json(employees)
})

employeesRouter.post('/', requireRole('manager'), async (req, res) => {
  const { employeeId, name, password, department, title, role, managerId } = req.body
  if (!employeeId?.trim() || !name?.trim() || !password || password.length < 4) {
    return res.status(400).json({ error: 'Employee ID, name, and a password of at least 4 characters are required.' })
  }

  const existing = await Employee.findOne({ employeeId: employeeId.trim() })
  if (existing) return res.status(409).json({ error: 'That employee ID is already in use.' })

  const employeeCount = await Employee.countDocuments()
  const passwordHash = await bcrypt.hash(password, 10)

  const employee = await Employee.create({
    employeeId: employeeId.trim(),
    name: name.trim(),
    passwordHash,
    department: department ?? '',
    title: title ?? '',
    role: role === 'manager' ? 'manager' : 'employee',
    managerId: managerId ?? req.employee.id,
    color: nextColor(employeeCount),
  })

  res.status(201).json(employee)
})

employeesRouter.patch('/:id', requireRole('manager'), async (req, res) => {
  const { name, department, title, role, managerId } = req.body
  const patch = {}
  if (name !== undefined) patch.name = name
  if (department !== undefined) patch.department = department
  if (title !== undefined) patch.title = title
  if (role !== undefined) patch.role = role
  if (managerId !== undefined) patch.managerId = managerId

  const employee = await Employee.findByIdAndUpdate(req.params.id, patch, { new: true })
  if (!employee) return res.status(404).json({ error: 'Employee not found.' })
  res.json(employee)
})

employeesRouter.delete('/:id', requireRole('manager'), async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id)
  if (!employee) return res.status(404).json({ error: 'Employee not found.' })
  await Promise.all([
    Attendance.deleteMany({ employeeId: req.params.id }),
    StatusReport.deleteMany({ employeeId: req.params.id }),
  ])
  res.status(204).end()
})
