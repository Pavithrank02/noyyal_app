import mongoose from 'mongoose'

const holidaySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  name: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
})

holidaySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    ret.createdBy = ret.createdBy.toString()
    delete ret._id
    delete ret.__v
  },
})

export const Holiday = mongoose.model('Holiday', holidaySchema)
