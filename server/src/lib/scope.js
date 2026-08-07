import { Employee } from '../models/Employee.js'

// The employee _ids (as strings) a requester is allowed to see data for:
// themselves, plus their direct reports if they're a manager. Employees only
// ever see their own data; managers see their own team's.
export async function getVisibleEmployeeIds(requester) {
  if (requester.role !== 'manager') return [requester.id]
  const team = await Employee.find({ managerId: requester.id }).select('_id')
  return [requester.id, ...team.map((e) => e._id.toString())]
}
