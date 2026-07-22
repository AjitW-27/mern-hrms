const AuditLog = require("../models/auditLogModel");

const audit = async ({
  organization = null,
  actor,
  action,
  entityType,
  entityId = null,
  before = null,
  after = null,
  metadata = {},
  req = null
}) => {
  try {
    if (!actor || !action || !entityType) return null;

    return await AuditLog.create({
      organization,
      actor,
      action,
      entityType,
      entityId,
      before,
      after,
      metadata,
      ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || req?.ipAddress || null,
      userAgent: req?.headers?.["user-agent"] || null
    });
  } catch (error) {
    return null;
  }
};

module.exports = audit;
