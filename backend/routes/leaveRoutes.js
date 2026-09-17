const express = require("express");
const router = express.Router();
const { protect, authorize, permit } = require("../middleware/authMiddleware");
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, cancelLeave, getLeaveStats } = require("../controllers/leaveController");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);
router.get("/stats", authorize("admin", "hr"), getLeaveStats);
router.get("/my", permit("leave", "read"), getMyLeaves);
router.post("/apply", permit("leave", "create"), (req,res,next)=>{req.uploadFolder="documents";next();}, upload.single("supportingDocument"), applyLeave);
router.get("/", authorize("admin", "hr", "manager"), getAllLeaves);
router.put("/:id/status", authorize("admin", "hr", "manager"), updateLeaveStatus);
router.put("/:id/cancel", permit("leave", "update"), cancelLeave);

module.exports = router;
