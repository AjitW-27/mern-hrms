const express = require("express");
const router = express.Router();
const { protect, authorize, permit } = require("../middleware/authMiddleware");
const { getAttendanceReport, getPayrollReport, getLeaveReport } = require("../controllers/otherControllers");

router.use(protect, authorize("superadmin", "admin", "hr"), permit("reports", "read"));

router.get("/attendance", getAttendanceReport);
router.get("/payroll", getPayrollReport);
router.get("/leave", getLeaveReport);

module.exports = router;
