const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const { getNotifications, markAllRead } = require("../controllers/otherControllers");

router.use(protect); // Only logged-in users
router.get("/", permit("notifications", "read"), getNotifications);
router.put("/mark-read", permit("notifications", "update"), markAllRead);

module.exports = router;