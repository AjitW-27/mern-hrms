const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { addAsset, getAssets, assignAsset, updateAsset, deleteAsset } = require("../controllers/assetController");

router.use(protect);
router.get("/", authorizeRoles("superadmin", "admin", "hr"), getAssets);
router.post("/", authorizeRoles("superadmin", "admin", "hr"), addAsset);
router.put("/:id", authorizeRoles("superadmin", "admin", "hr"), updateAsset);
router.delete("/:id", authorizeRoles("superadmin", "admin", "hr"), deleteAsset);
router.put("/:id/assign", authorizeRoles("superadmin", "admin", "hr"), assignAsset);

module.exports = router;
