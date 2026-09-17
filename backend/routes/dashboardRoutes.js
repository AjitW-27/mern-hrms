const express = require("express");
const router = express.Router();

// ✅ Destructured protect
const { protect, permit } = require("../middleware/authMiddleware");

// ✅ Destructured controller
const { getDashboardSummary } = require("../controllers/dashController");

router.get("/summary", protect, permit("dashboard", "read"), getDashboardSummary);

module.exports = router;