const express = require("express");
const router = express.Router();

// ✅ Destructured protect
const { protect } = require("../middleware/authMiddleware");

// ✅ Destructured controller
const { getDashboardSummary } = require("../controllers/dashController");

router.get("/summary", protect, getDashboardSummary);

module.exports = router;