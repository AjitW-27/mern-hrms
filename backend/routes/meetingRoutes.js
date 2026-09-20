const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const controller = require("../controllers/meetingRoomController");

router.use(protect);
router.get("/active", permit("communication", "read"), controller.listActiveMeetings);
router.get("/:roomId", permit("communication", "read"), controller.getMeetingRoomById);
router.post("/create", permit("communication", "create"), controller.createMeetingRoom);

module.exports = router;
