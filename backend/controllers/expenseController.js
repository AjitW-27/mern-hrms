const Expense = require("../models/expenseModel");

// 1. Employee Applies for Expense Claim
const addExpense = async (req, res) => {
    try {
        const { amount, category, billReceiptUrl, reason } = req.body;

        if (!amount || !category) {
            return res.status(400).json({ message: "Amount and category are required" });
        }

        const newExpense = new Expense({
            employee: req.user.id, // Comes from protect middleware
            amount,
            category,
            reason,
            billReceiptUrl, // Store AWS S3 / Cloudinary link from frontend
            status: "Pending"
        });

        await newExpense.save();
        res.status(201).json({ message: "Expense claim submitted successfully", data: newExpense });
    } catch (error) {
        res.status(500).json({ message: "Error submitting expense", error: error.message });
    }
};

// 2. Employee views their own claims
const getMyExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ employee: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your expenses", error: error.message });
    }
};

// 3. HR/Admin views all claims
const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find()
            .populate("employee", "fullName email department")
            .populate("approvedBy", "fullName")
            .sort({ createdAt: -1 });

        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching all expenses", error: error.message });
    }
};

// 4. HR/Manager Approves or Rejects the claim
const updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body; // Status: "Approved" or "Rejected"

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: "Expense record not found" });
        }

        expense.status = status;
        expense.remarks = remarks; // Optional: Manager's comment
        expense.approvedBy = req.user.id; // Manager/HR who is approving

        await expense.save();
        res.status(200).json({ message: `Expense ${status} successfully`, data: expense });
    } catch (error) {
        res.status(500).json({ message: "Error updating expense status", error: error.message });
    }
};

module.exports = { addExpense, getMyExpenses, getAllExpenses, updateExpenseStatus };