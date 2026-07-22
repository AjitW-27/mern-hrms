const AuditLog = require("../models/auditLogModel");
const asyncHandler = require("../utils/asyncHandler");

const listAuditLogs = asyncHandler(async (req, res) => {
  const { actor, entityType, from, to, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (actor) filter.actor = actor;
  if (entityType) filter.entityType = entityType;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const [data, total] = await Promise.all([
    AuditLog.find(filter).populate("actor", "name email role").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    AuditLog.countDocuments(filter)
  ]);

  res.json({ success: true, data, total, page: Number(page), totalPages: Math.ceil(total / limit) });
});

module.exports = { listAuditLogs };
