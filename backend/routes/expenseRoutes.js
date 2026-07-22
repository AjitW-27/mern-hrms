const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { addExpense, getMyExpenses, getAllExpenses, updateExpenseStatus } = require("../controllers/expenseController");

router.use(protect);
router.post("/apply", addExpense);
router.get("/my-expenses", getMyExpenses);
router.get("/", authorizeRoles("superadmin", "admin", "hr", "manager"), getAllExpenses);
router.put("/:id/status", authorizeRoles("superadmin", "admin", "hr", "manager"), updateExpenseStatus);

module.exports = router;
