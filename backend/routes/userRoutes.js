const express = require("express");
const router = express.Router();
const { protect, authorize, permit } = require("../middleware/authMiddleware");
const controller = require("../controllers/userController");

router.use(protect);
router.use(authorize("superadmin", "admin", "hr"));

router
  .route("/")
  .get(permit("users", "read"), controller.listUsers)
  .post(permit("users", "create"), controller.createUser);

router
  .route("/:id")
  .get(permit("users", "read"), controller.getUser)
  .put(permit("users", "update"), controller.updateUser)
  .delete(permit("users", "delete"), controller.deleteUser);

router.patch("/:id/role", permit("users", "update"), controller.assignRole);
router.post("/:id/reset-password", permit("users", "update"), controller.adminResetPassword);
router.put("/:id/employee", permit("users", "update"), permit("employees", "update"), controller.linkEmployee);

module.exports = router;
