import mongoose from 'mongoose'

const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true }, // YYYY-MM-DD
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  decidedAt: { type: Date, default: null },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
})

leaveRequestSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    ret.employeeId = ret.employeeId.toString()
    ret.decidedBy = ret.decidedBy ? ret.decidedBy.toString() : null
    ret.requestedAt = ret.requestedAt.toISOString()
    ret.decidedAt = ret.decidedAt ? ret.decidedAt.toISOString() : null
    delete ret._id
    delete ret.__v
  },
})

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema)
