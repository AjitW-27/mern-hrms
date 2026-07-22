const Role = require("../../models/roleModel");
const { buildAccess, getDefaultRolePermissions, MODULES, ACTIONS, createEmptyMatrix } = require("../../config/accessControl");
const asyncHandler = require("../../utils/asyncHandler");
const audit = require("../../utils/audit");

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

const normalizeMatrix = (payload, roleCode) => {
  if (!payload) return getDefaultRolePermissions(roleCode);
  if (Array.isArray(payload)) {
    const matrix = createEmptyMatrix();
    for (const code of payload) {
      const [module, action] = String(code).split(":");
      if (!matrix[module]) matrix[module] = {};
      matrix[module][action] = true;
    }
    return matrix;
  }
  if (payload.matrix) return payload.matrix;
  if (payload.permissions && typeof payload.permissions === "object" && !Array.isArray(payload.permissions)) return payload.permissions;
  return payload;
};

const getAll = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  const search = String(req.query.search || "").trim();
  const isActive = req.query.isActive;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }
  if (isActive === "true") query.isActive = true;
  if (isActive === "false") query.isActive = false;

  const [total, data] = await Promise.all([
    Role.countDocuments(query),
    Role.find(query).sort({ level: 1, createdAt: 1 }).skip((page - 1) * limit).limit(limit).lean()
  ]);

  res.json({
    success: true,
    data: data.map(roleToPlain),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

const getOne = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }
  res.json({ success: true, data: roleToPlain(role) });
});

const create = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim().toLowerCase();
  if (!name) {
    return res.status(400).json({ success: false, message: "Role name is required" });
  }

  const code = sanitizeRoleCode(req.body.code || name);
  const exists = await Role.findOne({ $or: [{ code }, { name }] });
  if (exists) {
    return res.status(400).json({ success: false, message: "Role already exists" });
  }

  const role = await Role.create({
    name,
    code,
    description: req.body.description || "",
    permissions: normalizeMatrix(req.body.permissions || req.body.matrix, code),
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

const update = asyncHandler(async (req, res) => {
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
    role.permissions = normalizeMatrix(req.body.permissions || req.body.matrix, role.code);
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

const deleteOne = asyncHandler(async (req, res) => {
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

const updatePermissions = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }
  if (role.isSystemRole) {
    return res.status(400).json({ success: false, message: "System roles cannot be modified" });
  }

  const before = role.toObject({ flattenMaps: true });
  role.permissions = normalizeMatrix(req.body.permissions || req.body.matrix, role.code);
  role.updatedBy = req.user?._id;
  await role.save();

  await audit({
    actor: req.user?._id,
    action: "update_permissions",
    entityType: "Role",
    entityId: role._id,
    before,
    after: role.toObject({ flattenMaps: true }),
    metadata: { module: "roles" },
    req
  });

  res.json({ success: true, data: roleToPlain(role) });
});

const clone = asyncHandler(async (req, res) => {
  const source = await Role.findById(req.params.id);
  if (!source) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }

  const name = String(req.body.name || "").trim().toLowerCase();
  const code = sanitizeRoleCode(req.body.code || name);
  if (!name) {
    return res.status(400).json({ success: false, message: "New role name is required" });
  }

  const exists = await Role.findOne({ $or: [{ name }, { code }] });
  if (exists) {
    return res.status(400).json({ success: false, message: "Role already exists" });
  }

  const role = await Role.create({
    name,
    code,
    description: req.body.description || source.description || "",
    permissions: source.permissions,
    level: req.body.level || source.level || 100,
    isSystemRole: false,
    organization: req.body.organization || source.organization || null,
    createdBy: req.user?._id,
    updatedBy: req.user?._id
  });

  res.status(201).json({ success: true, data: roleToPlain(role) });
});

const registry = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      modules: MODULES,
      actions: ACTIONS
    }
  });
});

module.exports = {
  getAll,
  getOne,
  create,
  update,
  deleteOne,
  updatePermissions,
  clone,
  registry
};
