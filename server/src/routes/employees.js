import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { Employee } from '../models/Employee.js'
import { Attendance } from '../models/Attendance.js'
import { StatusReport } from '../models/StatusReport.js'
import { nextColor } from '../lib/colors.js'
import { getVisibleEmployeeIds } from '../lib/scope.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const employeesRouter = Router()

employeesRouter.use(requireAuth)

// Employees see only themselves; managers see themselves + their direct team.
employeesRouter.get('/', async (req, res) => {
  const visibleIds = await getVisibleEmployeeIds(req.employee)
  const employees = await Employee.find({ _id: { $in: visibleIds } })
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

// A manager can only edit/remove their own direct reports, not anyone company-wide.
async function assertManagesEmployee(req, res, id) {
  const target = await Employee.findById(id)
  if (!target) {
    res.status(404).json({ error: 'Employee not found.' })
    return null
  }
  if (String(target.managerId) !== req.employee.id) {
    res.status(403).json({ error: 'You can only manage your own team.' })
    return null
  }
  return target
}

employeesRouter.patch('/:id', requireRole('manager'), async (req, res) => {
  if (!(await assertManagesEmployee(req, res, req.params.id))) return

  const { name, department, title, role, managerId } = req.body
  const patch = {}
  if (name !== undefined) patch.name = name
  if (department !== undefined) patch.department = department
  if (title !== undefined) patch.title = title
  if (role !== undefined) patch.role = role
  if (managerId !== undefined) patch.managerId = managerId

  const employee = await Employee.findByIdAndUpdate(req.params.id, patch, { new: true })
  res.json(employee)
})

// Only managers can change a password — their own, or a direct report's
// (which can itself be another manager). Employees can't change anyone's
// password, including their own; they ask their manager to reset it.
employeesRouter.patch('/:id/password', requireRole('manager'), async (req, res) => {
  const { password } = req.body
  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' })
  }

  const isSelf = req.params.id === req.employee.id
  if (!isSelf && !(await assertManagesEmployee(req, res, req.params.id))) return

  const passwordHash = await bcrypt.hash(password, 10)
  await Employee.findByIdAndUpdate(req.params.id, { passwordHash })
  res.status(204).end()
})

employeesRouter.delete('/:id', requireRole('manager'), async (req, res) => {
  if (!(await assertManagesEmployee(req, res, req.params.id))) return

  await Employee.findByIdAndDelete(req.params.id)
  await Promise.all([
    Attendance.deleteMany({ employeeId: req.params.id }),
    StatusReport.deleteMany({ employeeId: req.params.id }),
  ])
  res.status(204).end()
})
