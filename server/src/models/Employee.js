import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager'], default: 'employee' },
  department: { type: String, default: '' },
  title: { type: String, default: '' },
  color: { type: String, required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
})

employeeSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    ret.managerId = ret.managerId ? ret.managerId.toString() : null
    delete ret._id
    delete ret.__v
    delete ret.passwordHash
  },
})

export const Employee = mongoose.model('Employee', employeeSchema)
