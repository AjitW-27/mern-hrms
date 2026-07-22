const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getNotifications, markAllRead } = require("../controllers/otherControllers");

router.use(protect); // Only logged-in users
router.get("/", getNotifications);
router.put("/mark-read", markAllRead);

module.exports = router;