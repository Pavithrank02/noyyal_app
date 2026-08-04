import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD, matches the frontend's local-date key
  checkIn: { type: Date, default: null },
  checkOut: { type: Date, default: null },
  status: {
    type: String,
    enum: ['present', 'late', 'absent', 'leave', 'wfh', 'half-day'],
    required: true,
  },
  hoursWorked: { type: Number, default: 0 },
})

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true })

attendanceSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    ret.employeeId = ret.employeeId.toString()
    ret.checkIn = ret.checkIn ? ret.checkIn.toISOString() : null
    ret.checkOut = ret.checkOut ? ret.checkOut.toISOString() : null
    delete ret._id
    delete ret.__v
  },
})

export const Attendance = mongoose.model('Attendance', attendanceSchema)
