const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getSettings, updateSettings } = require("../controllers/settingController");

router.get("/", protect, getSettings);
router.put("/", protect, authorizeRoles("superadmin", "admin", "hr"), updateSettings);

module.exports = router;
