const Payroll = require("../models/payrollModel");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const { Settings } = require("../models/otherModel");
const { createNotification } = require("../utils/notificationHelper");
const { sendEmail } = require("../utils/emailService");

// ─── GENERATE PAYROLL FOR A MONTH ─────────────────────────────────────────────
const generatePayroll = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month || !year) return res.status(400).json({ success: false, message: "month and year are required" });

        const settings = await Settings.findOne();
        const pfPercent = settings?.payroll?.pfPercentage || 12;
        const esiPercent = settings?.payroll?.esiPercentage || 1.75;
        const pfLimit = settings?.payroll?.pfLimit || 15000;

        const employees = await Employee.find({ isActive: true });

        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

        const results = { generated: [], skipped: [] };

        for (const emp of employees) {
            // Skip if payroll already generated
            const exists = await Payroll.findOne({ employeeId: emp._id, month, year });
            if (exists) {
                results.skipped.push(emp.employeeId);
                continue;
            }

            // Get attendance for the month
            const attendanceRecords = await Attendance.find({ employeeId: emp._id, date: { $gte: startDate, $lte: endDate } });
            const presentDays = attendanceRecords.filter(a => ["Present", "Late"].includes(a.status)).length;
            const absentDays = attendanceRecords.filter(a => a.status === "Absent").length;
            const leaveDays = attendanceRecords.filter(a => a.status === "On Leave").length;
            const workingDays = presentDays + absentDays + leaveDays;

            // Get base salary
            const basic = emp.salary?.basic || 0;
            const hra = emp.salary?.hra || 0;
            const da = emp.salary?.da || 0;
            const ta = emp.salary?.ta || 0;
            const otherAllowances = emp.salary?.otherAllowances || 0;

            // LOP (Loss of Pay) calculation
            const dailyRate = basic / (workingDays || 26);
            const lopDays = Math.max(0, absentDays - 1); // 1 day free absence per month typically
            const lopDeduction = dailyRate * lopDays;

            // PF: 12% of basic (capped at pfLimit)
            const pfBase = Math.min(basic, pfLimit);
            const pf = (pfBase * pfPercent) / 100;

            // ESI: 1.75% of gross (if gross <= 21000)
            const grossForESI = basic + hra + da + ta + otherAllowances;
            const esi = grossForESI <= 21000 ? (grossForESI * esiPercent) / 100 : 0;

            const payrollData = {
                employeeId: emp._id,
                month, year,
                earnings: {
                    basicSalary: basic,
                    hra, da, ta,
                    otherAllowances
                },
                deductions: {
                    pf: Math.round(pf),
                    esi: Math.round(esi),
                    lopDeduction: Math.round(lopDeduction),
                    tds: emp.salary?.tds || 0
                },
                attendance: {
                    workingDays,
                    presentDays,
                    absentDays,
                    leaveDays
                },
                processedBy: req.user._id,
                status: "Pending"
            };

            const payroll = await Payroll.create(payrollData);
            results.generated.push({ employeeId: emp.employeeId, netSalary: payroll.netSalary });
        }

        res.json({
            success: true,
            message: `Payroll generated for ${results.generated.length} employees. ${results.skipped.length} skipped.`,
            results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET PAYROLLS ─────────────────────────────────────────────────────────────
const getPayrolls = async (req, res) => {
    try {
        const { month, year, status, employeeId, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (month) filter.month = Number(month);
        if (year) filter.year = Number(year);
        if (status) filter.status = status;
        if (employeeId) filter.employeeId = employeeId;

        const [payrolls, total] = await Promise.all([
            Payroll.find(filter)
                .populate("employeeId", "fullName employeeId department designation")
                .populate("processedBy", "name")
                .populate("approvedBy", "name")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit)),
            Payroll.countDocuments(filter)
        ]);

        // Summary
        const summary = await Payroll.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalGross: { $sum: "$grossSalary" },
                    totalDeductions: { $sum: "$totalDeductions" },
                    totalNet: { $sum: "$netSalary" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({ success: true, total, page: Number(page), summary: summary[0] || {}, data: payrolls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET MY PAYROLL ───────────────────────────────────────────────────────────
const getMyPayroll = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        const payrolls = await Payroll.find({ employeeId: employee._id })
            .sort({ year: -1, month: -1 })
            .limit(12);

        res.json({ success: true, data: payrolls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── APPROVE PAYROLL ──────────────────────────────────────────────────────────
const approvePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            { status: "Approved", approvedBy: req.user._id },
            { new: true }
        ).populate("employeeId", "fullName email");

        if (!payroll) return res.status(404).json({ success: false, message: "Payroll not found" });

        res.json({ success: true, message: "Payroll approved", data: payroll });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── MARK AS PAID ─────────────────────────────────────────────────────────────
const markPayrollPaid = async (req, res) => {
    try {
        const { paymentMode, transactionId } = req.body;
        const payroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            { status: "Paid", paymentDate: new Date(), paymentMode, transactionId },
            { new: true }
        ).populate("employeeId");

        if (!payroll) return res.status(404).json({ success: false, message: "Payroll not found" });

        // Notify employee
        const emp = payroll.employeeId;
        const userRecord = await require("../models/userModel").findOne({ _id: emp.userId });

        if (userRecord) {
            await createNotification({
                recipientId: userRecord._id,
                title: "Salary Credited",
                message: `Your salary of ₹${payroll.netSalary.toLocaleString("en-IN")} for ${payroll.payPeriod} has been credited.`,
                type: "payroll",
                relatedId: payroll._id,
                relatedModel: "Payroll"
            });
        }

        res.json({ success: true, message: "Payroll marked as paid", data: payroll });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── BULK APPROVE ─────────────────────────────────────────────────────────────
const bulkApprovePayroll = async (req, res) => {
    try {
        const { month, year } = req.body;
        const result = await Payroll.updateMany(
            { month, year, status: "Pending" },
            { status: "Approved", approvedBy: req.user._id }
        );
        res.json({ success: true, message: `${result.modifiedCount} payrolls approved`, modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { generatePayroll, getPayrolls, getMyPayroll, approvePayroll, markPayrollPaid, bulkApprovePayroll };
