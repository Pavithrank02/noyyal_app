import mongoose from 'mongoose'

const statusReportSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  summary: { type: String, required: true },
  tasksCompleted: { type: [String], default: [] },
  blockers: { type: String, default: '' },
  hoursWorked: { type: Number, default: 0 },
  workMode: { type: String, enum: ['office', 'wfh', 'hybrid'], required: true },
  mood: { type: String, enum: ['great', 'steady', 'stretched'], required: true },
  submittedAt: { type: Date, default: Date.now },
})

statusReportSchema.index({ employeeId: 1, date: 1 }, { unique: true })

statusReportSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    ret.employeeId = ret.employeeId.toString()
    ret.submittedAt = ret.submittedAt.toISOString()
    delete ret._id
    delete ret.__v
  },
})

export const StatusReport = mongoose.model('StatusReport', statusReportSchema)
