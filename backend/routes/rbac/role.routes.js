const express = require("express");
const router = express.Router();

const controller = require("../../controllers/rbac/role.controller");
const authenticate = require("../../auth/middleware/authenticate");
const { authorizeRoles } = require("../../middleware/authMiddleware");

router.use(authenticate, authorizeRoles("superadmin", "admin", "hr"));

router.get("/", controller.getAll);
router.get("/registry", controller.registry);
router.get("/:id", controller.getOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.patch("/:id/permissions", controller.updatePermissions);
router.post("/:id/clone", controller.clone);
router.delete("/:id", controller.deleteOne);

module.exports = router;
