const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const { getNotifications, markAllRead, markOneRead } = require("../controllers/otherControllers");

router.use(protect); // Only logged-in users
router.get("/", permit("notifications", "read"), getNotifications);
router.put("/mark-read", permit("notifications", "update"), markAllRead);

router.put("/:id/read", permit("notifications", "update"), markOneRead);
module.exports = router;