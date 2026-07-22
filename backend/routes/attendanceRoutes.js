const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getAll,
  createOne,
  updateOne,
  deleteOne,
  punchBiometric,
  getMyAttendance,
  getAttendanceSummary
} = require("../controllers/attendanceController");

router.use(protect);

router.get("/summary", authorizeRoles("superadmin", "admin", "hr", "manager"), getAttendanceSummary);
router.get("/my", getMyAttendance);
router.get("/", authorizeRoles("superadmin", "admin", "hr", "manager"), getAll);
router.post("/", authorizeRoles("superadmin", "admin", "hr"), createOne);
router.put("/:id", authorizeRoles("superadmin", "admin", "hr"), updateOne);
router.delete("/:id", authorizeRoles("superadmin", "admin", "hr"), deleteOne);
router.post("/biometric-punch", punchBiometric);

module.exports = router;
