import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { Employee } from '../models/Employee.js'
import { nextColor } from '../lib/colors.js'
import { COOKIE_NAME, requireAuth, setAuthCookie, signToken } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  if (!name?.trim() || !email?.trim() || !password || password.length < 4) {
    return res.status(400).json({ error: 'Name, email, and a password of at least 4 characters are required.' })
  }

  const existing = await Employee.findOne({ email: email.trim().toLowerCase() })
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' })

  const employeeCount = await Employee.countDocuments()
  const passwordHash = await bcrypt.hash(password, 10)

  const employee = await Employee.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: employeeCount === 0 ? 'manager' : 'employee',
    managerId: null,
    color: nextColor(employeeCount),
  })

  setAuthCookie(res, signToken(employee.id))
  res.status(201).json(employee)
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body
  const employee = await Employee.findOne({ email: email?.trim().toLowerCase() })
  if (!employee || !(await bcrypt.compare(password ?? '', employee.passwordHash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }
  setAuthCookie(res, signToken(employee.id))
  res.json(employee)
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME)
  res.status(204).end()
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.employee)
})
