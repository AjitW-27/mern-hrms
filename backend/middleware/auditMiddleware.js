const AuditLog = require("../models/auditLogModel");

const auditMiddleware = (req, res, next) => {
  const startedAt = Date.now();
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    if (req.user && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      AuditLog.create({
        actor: req.user._id,
        action: `${req.method} ${req.originalUrl}`,
        entityType: req.baseUrl || req.path,
        entityId: req.params.id,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        metadata: {
          status: res.statusCode >= 400 ? "failed" : "success",
          durationMs: Date.now() - startedAt,
          body: req.method === "DELETE" ? undefined : req.body,
          responseMessage: payload?.message
        }
      }).catch(() => {});
    }

    return originalJson(payload);
  };

  next();
};

module.exports = auditMiddleware;
