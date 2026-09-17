const express = require("express");
const router = express.Router();
const { protect, authorize, permit } = require("../middleware/authMiddleware");
const controller = require("../controllers/organizationController");

router.use(protect);

router
  .route("/")
  .get(permit("organizations", "read"), controller.listOrganizations)
  .post(authorize("superadmin", "admin"), permit("organizations", "create"), controller.createOrganization);

router
  .route("/:id")
  .get(permit("organizations", "read"), controller.getOrganization)
  .put(authorize("superadmin", "admin"), permit("organizations", "update"), controller.updateOrganization)
  .delete(authorize("superadmin"), permit("organizations", "delete"), controller.deleteOrganization);

module.exports = router;
