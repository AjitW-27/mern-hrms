const Employee = require("../models/employeeModel");
const User = require("../models/userModel");
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const idOf = value => String(value?._id || value || "");
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function resolveEmployee({ userId, email, employeeRef, required }) {
  let employee = null;
  if (employeeRef) {
    if (!/^[a-f0-9]{24}$/i.test(idOf(employeeRef))) throw fail("Select a valid employee profile.");
    employee = await Employee.findById(employeeRef);
    if (!employee) throw fail("The selected employee profile no longer exists.");
  } else if (required && userId) employee = await Employee.findOne({ userId });
  if (!employee && required && email) employee = await Employee.findOne({ email: { $regex: new RegExp("^" + escapeRegex(email.trim()) + "$", "i") } });
  if (!employee) { if (required) throw fail("Select an employee profile, or use the email address of an existing employee."); return null; }
  if (employee.userId && idOf(employee.userId) !== idOf(userId)) throw fail("This employee profile is already linked to another account.", 409);
  const owner = await User.findOne({ employeeRef: employee._id, ...(userId ? { _id: { $ne: userId } } : {}) }).select("_id");
  if (owner) throw fail("This employee profile is already linked to another account.", 409);
  return employee;
}

async function saveLinkedUser(user, employee) {
  if (!employee) return user.save();
  if (user.employeeRef && idOf(user.employeeRef) !== idOf(employee._id)) throw fail("This account already has an employee link. Review the existing link before changing it.", 409);
  const previous = await Employee.findOneAndUpdate({ _id: employee._id, $or: [{ userId: null }, { userId: user._id }] }, { $set: { userId: user._id } }, { new: false });
  if (!previous) throw fail("The employee link changed. Refresh and try again.", 409);
  user.employeeRef = employee._id;
  try { return await user.save(); }
  catch (error) {
    if (!previous.userId) await Employee.updateOne({ _id: employee._id, userId: user._id }, { $unset: { userId: 1 } });
    throw error;
  }
}
module.exports = { resolveEmployee, saveLinkedUser };
