import jwt from 'jsonwebtoken'
import { Employee } from '../models/Employee.js'

export const COOKIE_NAME = 'noyyal_token'

export function signToken(employeeId) {
  return jwt.sign({ sub: employeeId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

export function setAuthCookie(res, token) {
  // The browser only ever talks to one origin (Netlify proxies /auth and /api
  // to this server — see netlify.toml), so this is always a same-site cookie.
  // That matters: Safari blocks third-party (cross-site) cookies by default.
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME]
    if (!token) return res.status(401).json({ error: 'Not authenticated' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const employee = await Employee.findById(payload.sub)
    if (!employee) return res.status(401).json({ error: 'Not authenticated' })
    req.employee = employee
    next()
  } catch {
    res.status(401).json({ error: 'Not authenticated' })
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.employee.role !== role) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}
