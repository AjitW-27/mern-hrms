const express = require("express");
const router = express.Router();
const { protect, authorize, permit } = require("../middleware/authMiddleware");
const { listAuditLogs } = require("../controllers/auditController");

router.get("/", protect, authorize("superadmin", "admin", "hr"), permit("audit", "read"), listAuditLogs);

module.exports = router;
