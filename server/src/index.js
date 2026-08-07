import 'dotenv/config'
import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { authRouter } from './routes/auth.js'
import { employeesRouter } from './routes/employees.js'
import { attendanceRouter } from './routes/attendance.js'
import { reportsRouter } from './routes/reports.js'
import { leaveRequestsRouter } from './routes/leaveRequests.js'
import { holidaysRouter } from './routes/holidays.js'

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_ORIGIN']
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env var ${key}`)
    process.exit(1)
  }
}

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/auth', authRouter)
app.use('/api/employees', employeesRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/leave-requests', leaveRequestsRouter)
app.use('/api/holidays', holidaysRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.code === 11000) return res.status(409).json({ error: 'That record already exists.' })
  res.status(500).json({ error: 'Something went wrong.' })
})

const port = process.env.PORT || 4000

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => console.log(`Noyyal API listening on :${port}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  })
