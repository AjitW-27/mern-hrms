const express = require("express");
const router = express.Router();
const { protect, authorize, permit } = require("../middleware/authMiddleware");
const { generatePayroll, getPayrolls, getMyPayroll, approvePayroll, markPayrollPaid, bulkApprovePayroll } = require("../controllers/payrollController");

router.use(protect);
router.get("/my", permit("payroll", "read"), getMyPayroll);
router.post("/generate", authorize("admin", "hr"), generatePayroll);
router.get("/", authorize("admin", "hr"), getPayrolls);
router.put("/bulk-approve", authorize("admin"), bulkApprovePayroll);
router.put("/:id/approve", authorize("admin", "hr"), approvePayroll);
router.put("/:id/mark-paid", authorize("admin", "hr"), markPayrollPaid);

module.exports = router;
