const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    month: { type: Number, required: true },        // 1-12
    year: { type: Number, required: true },
    payPeriod: { type: String },                    // "January 2025"

    // ─── Earnings ──────────────────────────────────────────────────────────────
    earnings: {
        basicSalary: { type: Number, default: 0 },
        hra: { type: Number, default: 0 },
        da: { type: Number, default: 0 },
        ta: { type: Number, default: 0 },
        otherAllowances: { type: Number, default: 0 },
        bonus: { type: Number, default: 0 },
        overtimePay: { type: Number, default: 0 },
        incentives: { type: Number, default: 0 }
    },

    // ─── Deductions ────────────────────────────────────────────────────────────
    deductions: {
        pf: { type: Number, default: 0 },
        esi: { type: Number, default: 0 },
        tds: { type: Number, default: 0 },
        lopDeduction: { type: Number, default: 0 },   // Loss of pay
        loan: { type: Number, default: 0 },
        otherDeductions: { type: Number, default: 0 }
    },

    // ─── Attendance Summary ────────────────────────────────────────────────────
    attendance: {
        workingDays: { type: Number, default: 0 },
        presentDays: { type: Number, default: 0 },
        absentDays: { type: Number, default: 0 },
        leaveDays: { type: Number, default: 0 },
        overtimeHours: { type: Number, default: 0 }
    },

    grossSalary: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ["Draft", "Pending", "Approved", "Paid", "On Hold"],
        default: "Draft"
    },
    paymentDate: { type: Date },
    paymentMode: { type: String, enum: ["Bank Transfer", "Cash", "Cheque"], default: "Bank Transfer" },
    transactionId: { type: String },

    // Who approved/processed
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Payslip PDF path
    payslipPath: { type: String },

    remarks: { type: String }
}, { timestamps: true });

// Auto-calculate totals before save
payrollSchema.pre("save", function (next) {
    const e = this.earnings;
    const d = this.deductions;

    this.grossSalary = Object.values(e).reduce((sum, val) => sum + (val || 0), 0);
    this.totalDeductions = Object.values(d).reduce((sum, val) => sum + (val || 0), 0);
    this.netSalary = this.grossSalary - this.totalDeductions;

    this.payPeriod = new Date(this.year, this.month - 1, 1)
        .toLocaleString("en-IN", { month: "long", year: "numeric" });

    next();
});

// Prevent duplicate payroll for same employee same month
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
