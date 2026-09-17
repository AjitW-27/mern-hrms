const crypto = require("crypto");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const asyncHandler = require("../utils/asyncHandler");
const { sendEmail } = require("../utils/emailService");

const safeSelect = "-password -refreshToken -refreshTokenVersion -resetPasswordToken -emailVerificationToken -twoFactorSecret";

const normalizeRole = (value) => String(value || "employee").trim().toLowerCase().replace(/\s+/g, "_");

const validateAssignedRole = async (value) => {
  const roleCode = normalizeRole(value);
  const role = await Role.findOne({ $or: [{ code: roleCode }, { name: roleCode }] }).select("code name isActive").lean();
  if (role && role.isActive === false) {
    const error = new Error("Cannot assign an inactive role");
    error.statusCode = 400;
    throw error;
  }
  if (!role && !["superadmin", "admin", "hr", "manager", "employee"].includes(roleCode)) {
    const error = new Error("Selected role does not exist");
    error.statusCode = 400;
    throw error;
  }
  return roleCode;
};

const listUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
    { mobileNo: { $regex: search, $options: "i" } }
  ];

  const [data, total] = await Promise.all([
    User.find(filter).select(safeSelect).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(filter)
  ]);

  res.json({ success: true, data, total, page: Number(page), totalPages: Math.ceil(total / limit) });
});

const createUser = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.role = await validateAssignedRole(payload.role);
  const user = await User.create(payload);
  res.status(201).json({ success: true, message: "User created", data: user });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(safeSelect).populate("employeeRef organization");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  if (req.body.role !== undefined) req.body.role = await validateAssignedRole(req.body.role);
  const blocked = ["password", "refreshToken", "resetPasswordToken", "emailVerificationToken"];
  blocked.forEach((key) => delete req.body[key]);
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select(safeSelect);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User updated", data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select(safeSelect);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User deactivated", data: user });
});

const assignRole = asyncHandler(async (req, res) => {
  const role = await validateAssignedRole(req.body.role);
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select(safeSelect);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "Role assigned", data: user });
});

const adminResetPassword = asyncHandler(async (req, res) => {
  const newPassword = req.body.password || crypto.randomBytes(8).toString("hex");
  const user = await User.findById(req.params.id).select("+password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  user.password = newPassword;
  user.refreshToken = null;
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  if (req.body.emailUser !== false) {
    await sendEmail({
      to: user.email,
      subject: "HRMS password reset",
      html: `<p>Your HRMS password was reset by HR/Admin.</p><p>Temporary password: <b>${newPassword}</b></p>`
    }).catch(() => {});
  }

  res.json({ success: true, message: "Password reset", tempPassword: req.body.password ? undefined : newPassword });
});

module.exports = {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  assignRole,
  adminResetPassword
};
