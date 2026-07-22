const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getSettings, updateSettings } = require("../controllers/settingController");

router.use(protect, authorizeRoles("superadmin", "admin"));
router.get("/", getSettings);
router.put("/", updateSettings);

module.exports = router;
