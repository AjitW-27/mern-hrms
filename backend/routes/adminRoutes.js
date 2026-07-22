const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("superadmin", "admin", "hr"));

router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/role", assignRole);

router.get("/roles", getRoles);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

router.get("/organization", getOrganization);
router.put("/organization", updateOrganization);

router.get("/audit-logs", getAuditLogs);

module.exports = router;
