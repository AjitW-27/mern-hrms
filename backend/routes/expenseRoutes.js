const express = require("express");
const router = express.Router();
const { protect, authorizeRoles, permit } = require("../middleware/authMiddleware");
const { addExpense, getMyExpenses, getAllExpenses, updateExpenseStatus } = require("../controllers/expenseController");

router.use(protect);
router.post("/apply", permit("expenses", "create"), addExpense);
router.get("/my-expenses", permit("expenses", "read"), getMyExpenses);
router.get("/", authorizeRoles("superadmin", "admin", "hr", "manager"), getAllExpenses);
router.put("/:id/status", authorizeRoles("superadmin", "admin", "hr", "manager"), updateExpenseStatus);

module.exports = router;
