const express = require("express");
const router = express.Router();
const { protect, authorize, permit } = require("../middleware/authMiddleware");
const controller = require("../controllers/organizationController");

router.use(protect);

router
  .route("/")
  .get(permit("organization", "read"), controller.listOrganizations)
  .post(authorize("superadmin", "admin"), permit("organization", "create"), controller.createOrganization);

router
  .route("/:id")
  .get(permit("organization", "read"), controller.getOrganization)
  .put(authorize("superadmin", "admin"), permit("organization", "update"), controller.updateOrganization)
  .delete(authorize("superadmin"), permit("organization", "delete"), controller.deleteOrganization);

module.exports = router;
