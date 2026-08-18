import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { Employee } from '../models/Employee.js'
import { nextColor } from '../lib/colors.js'
import { COOKIE_NAME, requireAuth, setAuthCookie, signToken } from '../middleware/auth.js'

export const authRouter = Router()

// One-time bootstrap: creates the first (admin/manager) account. Every
// employee after that is created by a manager via POST /api/employees,
// not self-signup, so this route refuses once any employee exists.
authRouter.post('/signup', async (req, res) => {
  const employeeCount = await Employee.countDocuments()
  if (employeeCount > 0) {
    return res.status(403).json({ error: 'Setup already complete. Ask your admin to create your account.' })
  }

  const { name, employeeId, password } = req.body
  if (!name?.trim() || !employeeId?.trim() || !password || password.length < 4) {
    return res.status(400).json({ error: 'Name, employee ID, and a password of at least 4 characters are required.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const employee = await Employee.create({
    name: name.trim(),
    employeeId: employeeId.trim(),
    passwordHash,
    role: 'manager',
    managerId: null,
    color: nextColor(0),
  })

  setAuthCookie(res, signToken(employee.id))
  res.status(201).json(employee)
})

authRouter.post('/login', async (req, res) => {
  const { employeeId, password } = req.body
  const employee = await Employee.findOne({ employeeId: employeeId?.trim() })
  if (!employee || !(await bcrypt.compare(password ?? '', employee.passwordHash))) {
    return res.status(401).json({ error: 'Incorrect employee ID or password.' })
  }
  setAuthCookie(res, signToken(employee.id))
  res.json(employee)
})

// Self-service reset for the manager/admin account only — a manager has no
// one above them to ask for a reset the way employees ask their manager
// (see POST /api/employees/:id/password). No verification step by design.
authRouter.post('/forgot-password', async (req, res) => {
  const { employeeId, password } = req.body
  if (!employeeId?.trim() || !password || password.length < 4) {
    return res.status(400).json({ error: 'Employee ID and a password of at least 4 characters are required.' })
  }

  const employee = await Employee.findOne({ employeeId: employeeId.trim(), role: 'manager' })
  if (!employee) {
    return res.status(404).json({ error: 'No admin account found with that employee ID.' })
  }

  employee.passwordHash = await bcrypt.hash(password, 10)
  await employee.save()
  res.status(204).end()
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME)
  res.status(204).end()
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.employee)
})
