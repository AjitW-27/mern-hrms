const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: ["Travel", "Food", "Office Supplies", "Other"] },
    billReceiptUrl: { type: String }, // AWS S3 or Cloudinary link
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);