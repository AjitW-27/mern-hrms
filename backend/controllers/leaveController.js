const Leave = require("../models/leaveModule");
const Employee = require("../models/employeeModel");
const { createNotification } = require("../utils/notificationHelper");
const { sendEmail } = require("../utils/emailService");

// ─── APPLY LEAVE ──────────────────────────────────────────────────────────────
const applyLeave = async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, reason, isHalfDay, halfDayPeriod } = req.body;

        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found" });

        // Check leave balance
        const balance = employee.leaveBalance[leaveType] || 0;
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const days = isHalfDay ? 0.5 : Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

        if (leaveType !== "unpaid" && balance < days) {
            return res.status(400).json({
                success: false,
                message: `Insufficient ${leaveType} leave balance. Available: ${balance}, Requested: ${days}`
            });
        }

        // Check for overlapping leaves
        const overlap = await Leave.findOne({
            employee: employee._id,
            status: { $in: ["pending", "approved"] },
            $or: [
                { fromDate: { $lte: to }, toDate: { $gte: from } }
            ]
        });
        if (overlap) {
            return res.status(400).json({ success: false, message: "You already have a leave request overlapping these dates" });
        }

        const supportingDoc = req.file ? `/uploads/documents/${req.file.filename}` : null;

        const leave = await Leave.create({
            employee: employee._id,
            leaveType, fromDate, toDate, reason, isHalfDay,
            halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
            supportingDocument: supportingDoc
        });

        // Notify manager / HR
        await createNotification({
            recipientRole: ["admin", "hr"],
            title: "New Leave Application",
            message: `${employee.fullName} has applied for ${days} day(s) of ${leaveType} leave from ${fromDate} to ${toDate}.`,
            type: "leave",
            relatedId: leave._id,
            relatedModel: "Leave"
        });

        res.status(201).json({ success: true, message: "Leave applied successfully", data: leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET MY LEAVES ────────────────────────────────────────────────────────────
const getMyLeaves = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found" });

        const { status, year } = req.query;
        const filter = { employee: employee._id };
        if (status) filter.status = status;
        if (year) {
            filter.fromDate = {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            };
        }

        const leaves = await Leave.find(filter)
            .populate("approvedBy", "name")
            .sort({ createdAt: -1 });

        res.json({ success: true, leaveBalance: employee.leaveBalance, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET ALL LEAVES (HR/Admin) ────────────────────────────────────────────────
const getAllLeaves = async (req, res) => {
    try {
        const { status, department, leaveType, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (leaveType) filter.leaveType = leaveType;

        let query = Leave.find(filter)
            .populate({
                path: "employee",
                select: "fullName employeeId department designation avatar",
                match: department ? { department } : {}
            })
            .populate("approvedBy", "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        let leaves = await query;
        leaves = leaves.filter(l => l.employee != null); // Remove if department filter removed employee

        const total = await Leave.countDocuments(filter);

        res.json({ success: true, total, page: Number(page), data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── UPDATE LEAVE STATUS (Approve / Reject) ──────────────────────────────────
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, comment } = req.body;

        const leave = await Leave.findById(req.params.id).populate("employee");
        if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

        if (leave.status !== "pending") {
            return res.status(400).json({ success: false, message: `Leave already ${leave.status}` });
        }

        leave.status = status;
        leave.comment = comment;
        leave.approvedBy = req.user._id;
        leave.approvedAt = new Date();
        await leave.save();

        // If approved → deduct from leave balance
        if (status === "approved") {
            const balanceField = `leaveBalance.${leave.leaveType}`;
            await Employee.findByIdAndUpdate(leave.employee._id, {
                $inc: { [balanceField]: -leave.totalDays }
            });
        }

        // Notify employee
        const employeeUser = await require("../models/userModel").findById(leave.employee.userId);
        if (employeeUser) {
            await createNotification({
                recipientId: employeeUser._id,
                title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: `Your ${leave.leaveType} leave from ${leave.fromDate.toDateString()} to ${leave.toDate.toDateString()} has been ${status}.${comment ? ` Remark: ${comment}` : ""}`,
                type: "leave",
                relatedId: leave._id,
                relatedModel: "Leave"
            });

            // Send email notification
            try {
                await sendEmail({
                    to: employeeUser.email,
                    subject: `Leave ${status} - HRMS`,
                    html: `<p>Hi ${leave.employee.fullName},</p>
                           <p>Your leave request has been <b style="color:${status === 'approved' ? 'green' : 'red'}">${status}</b>.</p>
                           ${comment ? `<p><b>Remark:</b> ${comment}</p>` : ""}
                           <p><b>Period:</b> ${leave.fromDate.toDateString()} - ${leave.toDate.toDateString()}</p>`
                });
            } catch (e) {}
        }

        res.json({ success: true, message: `Leave ${status} successfully`, data: leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── CANCEL LEAVE ─────────────────────────────────────────────────────────────
const cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate("employee");
        if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

        const employee = await Employee.findOne({ userId: req.user._id });
        const isOwner = leave.employee._id.toString() === employee?._id?.toString();
        const isPrivileged = ["admin", "hr"].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ success: false, message: "Not authorized to cancel this leave" });
        }

        if (["rejected", "cancelled"].includes(leave.status)) {
            return res.status(400).json({ success: false, message: "Cannot cancel an already rejected/cancelled leave" });
        }

        // Restore balance if was approved
        if (leave.status === "approved") {
            const balanceField = `leaveBalance.${leave.leaveType}`;
            await Employee.findByIdAndUpdate(leave.employee._id, {
                $inc: { [balanceField]: leave.totalDays }
            });
        }

        leave.status = "cancelled";
        leave.cancelledAt = new Date();
        leave.cancelReason = req.body.reason;
        await leave.save();

        res.json({ success: true, message: "Leave cancelled successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── LEAVE STATS ──────────────────────────────────────────────────────────────
const getLeaveStats = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const stats = await Leave.aggregate([
            {
                $match: {
                    fromDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
                }
            },
            {
                $group: {
                    _id: { status: "$status", leaveType: "$leaveType" },
                    count: { $sum: 1 },
                    totalDays: { $sum: "$totalDays" }
                }
            }
        ]);

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, cancelLeave, getLeaveStats };
