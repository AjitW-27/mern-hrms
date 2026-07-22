const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Organization = require("../models/organizationModel");
const AuditLog = require("../models/auditLogModel");
const asyncHandler = require("../utils/asyncHandler");
const audit = require("../utils/audit");
const { buildAccess, getDefaultRolePermissions, MODULES, ACTIONS, flattenPermissions, createEmptyMatrix } = require("../config/accessControl");

const sanitizeRoleCode = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
const roleToPlain = (role) => {
  if (!role) return null;
  const plain = role.toObject ? role.toObject({ flattenMaps: true }) : { ...role };
  if (plain.permissions && typeof plain.permissions.get === "function") {
    const mapped = {};
    for (const [module, perms] of plain.permissions.entries()) mapped[module] = perms;
    plain.permissions = mapped;
  }
  return plain;
};

const normalizePermissionsPayload = (payload, fallbackRoleCode) => {
  if (!payload) return getDefaultRolePermissions(fallbackRoleCode || "employee");
  if (Array.isArray(payload)) {
    const matrix = createEmptyMatrix();
    for (const item of payload) {
      const [module, action] = String(item).split(":");
      if (!matrix[module]) matrix[module] = {};
      matrix[module][action] = true;
    }
    return matrix;
  }
  if (payload.matrix) return payload.matrix;
  if (payload.permissions && typeof payload.permissions === "object" && !Array.isArray(payload.permissions)) return payload.permissions;
  return payload;
};

const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  const search = String(req.query.search || "").trim();
  const role = String(req.query.role || "").trim().toLowerCase();
  const isActive = req.query.isActive;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobileNo: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } }
    ];
  }
  if (role) query.role = role;
  if (isActive === "true") query.isActive = true;
  if (isActive === "false") query.isActive = false;

  const skip = (page - 1) * limit;

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("organization", "name code")
      .populate("employeeRef", "employeeId fullName designation department avatar")
      .lean()
  ]);

  res.json({
    success: true,
    data: users,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, mobileNo, role, organization, department, employeeRef, avatar, isActive = true } = req.body;
  if (!name || !email || !mobileNo) {
    return res.status(400).json({ success: false, message: "name, email and mobileNo are required" });
  }

  const normalizedRole = sanitizeRoleCode(role || "employee");
  const validRole = await Role.findOne({ $or: [{ code: normalizedRole }, { name: normalizedRole }] });
  if (!validRole && !["superadmin","admin","hr","manager","employee"].includes(normalizedRole)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) {
    return res.status(400).json({ success: false, message: "User already exists with this email" });
  }

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    password: password || process.env.DEFAULT_TEMP_PASSWORD || "Temp@12345",
    mobileNo: String(mobileNo).trim(),
    role: normalizedRole,
    organization: organization || null,
    department: department || null,
    employeeRef: employeeRef || null,
    avatar: avatar || null,
    isActive: Boolean(isActive)
  });

  await audit({
    actor: req.user?._id,
    action: "create",
    entityType: "User",
    entityId: user._id,
    after: user.toObject(),
    metadata: { module: "users" },
    req
  });

  const created = await User.findById(user._id).populate("organization", "name code").populate("employeeRef", "employeeId fullName designation department avatar");
  res.status(201).json({ success: true, data: created });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const before = user.toObject();

  const patch = ["name", "email", "mobileNo", "department", "organization", "employeeRef", "avatar", "isActive"];
  patch.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  if (req.body.role !== undefined) {
    user.role = sanitizeRoleCode(req.body.role);
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  await user.save();

  await audit({
    actor: req.user?._id,
    action: "update",
    entityType: "User",
    entityId: user._id,
    before,
    after: user.toObject(),
    metadata: { module: "users" },
    req
  });

  const updated = await User.findById(user._id).populate("organization", "name code").populate("employeeRef", "employeeId fullName designation department avatar");
  res.json({ success: true, data: updated });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const before = user.toObject();
  user.isActive = false;
  await user.save();

  await audit({
    actor: req.user?._id,
    action: "deactivate",
    entityType: "User",
    entityId: user._id,
    before,
    after: user.toObject(),
    metadata: { module: "users" },
    req
  });

  res.json({ success: true, message: "User deactivated" });
});

const assignRole = asyncHandler(async (req, res) => {
  const { roleId, roleCode } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  let roleDoc = null;
  if (roleId) {
    roleDoc = await Role.findById(roleId);
  } else if (roleCode) {
    roleDoc = await Role.findOne({ $or: [{ code: sanitizeRoleCode(roleCode) }, { name: sanitizeRoleCode(roleCode) }] });
  }

  const targetRole = sanitizeRoleCode(roleDoc?.code || roleDoc?.name || roleCode);
  if (!targetRole) {
    return res.status(400).json({ success: false, message: "roleId or roleCode is required" });
  }

  const before = user.toObject();
  user.role = targetRole;
  await user.save();

  await audit({
    actor: req.user?._id,
    action: "assign_role",
    entityType: "User",
    entityId: user._id,
    before,
    after: user.toObject(),
    metadata: { module: "users", role: targetRole },
    req
  });

  const updated = await User.findById(user._id).populate("organization", "name code").populate("employeeRef", "employeeId fullName designation department avatar");
  res.json({ success: true, data: updated });
});

const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort({ level: 1, createdAt: 1 }).lean();
  res.json({ success: true, data: roles.map(roleToPlain) });
});

const createRole = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim().toLowerCase();
  if (!name) {
    return res.status(400).json({ success: false, message: "Role name is required" });
  }

  const code = sanitizeRoleCode(req.body.code || name);
  const exists = await Role.findOne({ $or: [{ code }, { name }] });
  if (exists) {
    return res.status(400).json({ success: false, message: "Role already exists" });
  }

  const permissions = normalizePermissionsPayload(req.body.permissions || req.body.matrix, code);
  const role = await Role.create({
    name,
    code,
    description: req.body.description || "",
    permissions,
    level: req.body.level || 100,
    isSystemRole: Boolean(req.body.isSystemRole),
    organization: req.body.organization || null,
    createdBy: req.user?._id,
    updatedBy: req.user?._id
  });

  await audit({
    actor: req.user?._id,
    action: "create",
    entityType: "Role",
    entityId: role._id,
    after: role.toObject({ flattenMaps: true }),
    metadata: { module: "roles" },
    req
  });

  res.status(201).json({ success: true, data: roleToPlain(role) });
});

const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }
  if (role.isSystemRole) {
    return res.status(400).json({ success: false, message: "System roles cannot be modified" });
  }

  const before = role.toObject({ flattenMaps: true });

  if (req.body.name !== undefined) role.name = String(req.body.name).trim().toLowerCase();
  if (req.body.code !== undefined) role.code = sanitizeRoleCode(req.body.code);
  if (req.body.description !== undefined) role.description = req.body.description;
  if (req.body.level !== undefined) role.level = Number(req.body.level);
  if (req.body.isActive !== undefined) role.isActive = Boolean(req.body.isActive);
  if (req.body.permissions !== undefined || req.body.matrix !== undefined) {
    role.permissions = normalizePermissionsPayload(req.body.permissions || req.body.matrix, role.code);
  }
  role.updatedBy = req.user?._id;

  await role.save();

  await audit({
    actor: req.user?._id,
    action: "update",
    entityType: "Role",
    entityId: role._id,
    before,
    after: role.toObject({ flattenMaps: true }),
    metadata: { module: "roles" },
    req
  });

  res.json({ success: true, data: roleToPlain(role) });
});

const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }
  if (role.isSystemRole) {
    return res.status(400).json({ success: false, message: "System roles cannot be deleted" });
  }

  const before = role.toObject({ flattenMaps: true });
  role.isActive = false;
  await role.save();

  await audit({
    actor: req.user?._id,
    action: "deactivate",
    entityType: "Role",
    entityId: role._id,
    before,
    after: role.toObject({ flattenMaps: true }),
    metadata: { module: "roles" },
    req
  });

  res.json({ success: true, message: "Role deactivated" });
});

const getOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findOne().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: org });
});

const updateOrganization = asyncHandler(async (req, res) => {
  let org = await Organization.findOne();
  if (!org) {
    org = await Organization.create(req.body);
  } else {
    const before = org.toObject();
    Object.assign(org, req.body);
    await org.save();

    await audit({
      actor: req.user?._id,
      action: "update",
      entityType: "Organization",
      entityId: org._id,
      before,
      after: org.toObject(),
      metadata: { module: "organizations" },
      req
    });
  }

  res.json({ success: true, data: org });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 200);
  const entityType = String(req.query.entityType || "").trim();
  const action = String(req.query.action || "").trim();
  const search = String(req.query.search || "").trim();

  const query = {};
  if (entityType) query.entityType = entityType;
  if (action) query.action = action;
  if (search) query.$or = [
    { entityType: { $regex: search, $options: "i" } },
    { action: { $regex: search, $options: "i" } }
  ];

  const [total, data] = await Promise.all([
    AuditLog.countDocuments(query),
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("actor", "name email role")
      .populate("organization", "name code")
      .lean()
  ]);

  res.json({ success: true, data, page, limit, total, totalPages: Math.ceil(total / limit) });
});

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getOrganization,
  updateOrganization,
  getAuditLogs
};
