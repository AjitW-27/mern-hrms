const express = require("express");
const router = express.Router();

const controller = require("../../controllers/rbac/permission.controller");
const authenticate = require("../../auth/middleware/authenticate");
const { authorizeRoles } = require("../../middleware/authMiddleware");

router.use(authenticate, authorizeRoles("superadmin", "admin", "hr"));

router.get("/", controller.getAll);
router.get("/modules", controller.getModules);
router.get("/matrix", controller.getMatrixTemplate);

module.exports = router;
