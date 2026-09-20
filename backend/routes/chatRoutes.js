const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const controller = require("../controllers/chatController");

router.use(protect);
router.get("/hr-bot", permit("communication", "read"), controller.getHrBotProfile);
router.post("/hr-bot", permit("communication", "create"), controller.handleHrBotMessage);

module.exports = router;
