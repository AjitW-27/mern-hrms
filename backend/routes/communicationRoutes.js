const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const controller = require("../controllers/communicationController");

router.use(protect);

router.get("/contacts", permit("communication", "read"), controller.listContacts);
router.get("/unread-summary", permit("communication", "read"), controller.unreadSummary);
router.get("/conversations", permit("communication", "read"), controller.listConversations);
router.post("/conversations", permit("communication", "create"), controller.createConversation);
router.get("/conversations/:id/messages", permit("communication", "read"), controller.listMessages);
router.post("/conversations/:id/messages", permit("communication", "create"), controller.createMessage);
router.get("/meetings", permit("communication", "read"), controller.listMeetings);
router.post("/meetings", permit("communication", "create"), controller.createMeeting);
router.patch("/meetings/:id/cancel", permit("communication", "update"), controller.cancelMeeting);
router.get("/calls", permit("communication", "read"), controller.listCalls);
router.post("/calls", permit("communication", "create"), controller.createCall);
router.patch("/calls/:id/status", permit("communication", "update"), controller.updateCallStatus);

module.exports = router;
