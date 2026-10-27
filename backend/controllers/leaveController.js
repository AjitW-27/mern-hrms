const Leave = require("../models/leaveModule");
const Employee = require("../models/employeeModel");
const User = require("../models/userModel");
const { createNotification } = require("../utils/notificationHelper");
const { sendEmail } = require("../utils/emailService");
const { getUserRoleCode } = require("../middleware/authMiddleware");

// Helper to reliably find and link employee for the logged in user
const getEmployeeForUser = async (user) => {
    if (!user) return null;

    const { resolveEmployee, saveLinkedUser } = require("../services/employeeLinkService");
    let employee;
    try {
        employee = await resolveEmployee({ userId: user._id, email: user.email, employeeRef: user.employeeRef, required: true });
        if (employee && (!employee.userId || !user.employeeRef)) {
            const account = await User.findById(user._id);
            if (account) await saveLinkedUser(account, employee);
        }
    } catch (error) {
        if ([400, 409].includes(error.statusCode)) return null;
        throw error;
    }

    return employee;
};

// ─── APPLY LEAVE ──────────────────────────────────────────────────────────────
const applyLeave = async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, reason, halfDayPeriod, managerId } = req.body;
        const isHalfDay = req.body.isHalfDay === true || req.body.isHalfDay === "true";

        const employee = await getEmployeeForUser(req.user);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found for this account. Ensure your employee record has the same email."
            });
        }

        // Default balance safety check
        const balances = employee.leaveBalance || { sick: 12, casual: 12, earned: 15, unpaid: 0 };
        const balance = balances[leaveType] !== undefined ? balances[leaveType] : 15;

        const from = new Date(fromDate);
        const to = new Date(toDate);
        const days = isHalfDay ? 0.5 : Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

        if (!["sick", "casual", "earned", "unpaid"].includes(leaveType) || !Number.isFinite(days) || days <= 0 || to < from) return res.status(400).json({ success: false, message: "Provide a valid leave type and date range" });
        let approver;
        const managerEmployeeId = managerId || employee.reportsTo;
        if (managerEmployeeId) {
            const manager = await Employee.findById(managerEmployeeId).select("userId role");
            if (!manager?.userId || !["admin", "hr", "manager", "superadmin", "super_admin"].includes(manager.role)) return res.status(400).json({ success: false, message: "Select a manager with a linked approver account" });
            approver = manager.userId;
        }

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
            $or: [{ fromDate: { $lte: to }, toDate: { $gte: from } }]
        });

        if (overlap) {
            return res.status(400).json({
                success: false,
                message: "You already have a leave request overlapping these dates"
            });
        }

        const supportingDoc = req.file ? `/uploads/documents/${req.file.filename}` : null;

        const leave = await Leave.create({
            employee: employee._id,
            leaveType,
            fromDate,
            toDate,
            reason,
            isHalfDay,
            halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
            supportingDocument: supportingDoc,
            totalDays: days,
            approver,
        });


        // Notify manager / HR
        try {
            await createNotification({
                ...(approver ? { recipientId: approver } : { recipientRole: ["admin", "hr"] }),
                io: req.app?.get?.("io"),
                title: "New Leave Application",
                message: `${employee.fullName || "An employee"} has applied for ${days} day(s) of ${leaveType} leave.`,
                type: "leave",
                relatedId: leave._id,
                relatedModel: "Leave"
            });
        } catch (notifErr) {
            console.warn("Notification error:", notifErr.message);
        }

        res.status(201).json({ success: true, message: "Leave applied successfully", data: leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET MY LEAVES ────────────────────────────────────────────────────────────
const getMyLeaves = async (req, res) => {
    try {
        const employee = await getEmployeeForUser(req.user);
        if (!employee) {
            return res.json({ success: true, employeeLinked: false, leaveBalance: {}, data: [], message: "Your account is not linked to an employee profile. Please contact HR." });
        }

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

        const leaveBalance = employee.leaveBalance || {
            sick: 12,
            casual: 12,
            earned: 15,
            unpaid: 0
        };

        res.json({ success: true, employeeLinked: true, leaveBalance, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET ALL LEAVES (HR/Admin) ────────────────────────────────────────────────
const getAllLeaves = async (req, res) => {
    try {
        const { status, department, leaveType, page = 1, limit = 20 } = req.query;
        const filter = (req.userRole || getUserRoleCode(req.user)) === "manager" ? { approver: req.user._id } : {};
        if (status) filter.status = status;
        if (leaveType) filter.leaveType = leaveType;

        let query = Leave.find(filter)
            .populate({
                path: "employee",
                select: "fullName employeeId department designation avatar email",
                match: department ? { department } : {}
            })
            .populate("approvedBy", "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        let leaves = await query;
        leaves = leaves.filter((l) => l.employee != null);

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
        if (!["approved", "rejected"].includes(status)) return res.status(400).json({ success: false, message: "Choose approved or rejected" });
        const leave = await Leave.findById(req.params.id).populate("employee");
        if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

        // Only pending leaves can be updated
        if (leave.status !== "pending") {
            return res.status(400).json({ success: false, message: `Leave already ${leave.status}` });
        }

        // Authorization logic
        const isPrivileged = ["admin", "hr", "superadmin", "super_admin"].includes(req.userRole || getUserRoleCode(req.user));
        const isOwner = leave.employee?.userId?.toString() === req.user._id.toString();
        const isApprover = leave.approver && leave.approver.toString() === req.user._id.toString();
        if (!isPrivileged) {
            if (isOwner) {
                return res.status(403).json({ success: false, message: "Employees cannot approve their own leave requests" });
            }
            if (!isApprover) {
                return res.status(403).json({ success: false, message: "Not authorized to approve this leave" });
            }
        }

        // Claim the pending decision in the database before changing the balance.
        // A second request with a stale document must not deduct again.
        const decisionAt = new Date();
        const claimed = await Leave.updateOne({ _id: leave._id, status: "pending" }, {
            $set: { status, comment, approvedBy: req.user._id, approvedAt: decisionAt },
        });
        if (claimed.modifiedCount !== 1) return res.status(409).json({ success: false, message: "This leave request was already processed. Refresh to see its current status." });
        leave.status = status;
        leave.comment = comment;
        leave.approvedBy = req.user._id;
        leave.approvedAt = decisionAt;
        // Deduct balance only once
        if (status === "approved" && leave.leaveType !== "unpaid" && !leave.balanceDeducted && leave.employee) {
            const balanceField = `leaveBalance.${leave.leaveType}`;
            await Employee.findByIdAndUpdate(leave.employee._id, {
                $inc: { [balanceField]: -leave.totalDays || -1 },
            });
            leave.balanceDeducted = true;
        }
        await leave.save();

        // Notification (include io if available)
        const io = req.app && typeof req.app.get === "function" ? req.app.get("io") : undefined;
        try {
            if (leave.employee?.userId) {
                const employeeUser = await User.findById(leave.employee.userId);
                if (employeeUser) {
                    await createNotification({
                        recipientId: employeeUser._id,
                        title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                        message: `Your ${leave.leaveType} leave has been ${status}.${comment ? ` Remark: ${comment}` : ""}`,
                        type: "leave",
                        relatedId: leave._id,
                        relatedModel: "Leave",
                        io,
                    });
                    await sendEmail({
                        to: employeeUser.email,
                        subject: `Leave ${status} - HRMS`,
                        html: `<p>Hi ${leave.employee.fullName},</p><p>Your leave request has been <b style="color:${status === 'approved' ? 'green' : 'red'}">${status}</b>.</p>${comment ? `<p><b>Remark:</b> ${comment}</p>` : ""}`,
                    }).catch(() => {});
                }
            }
        } catch (notifErr) {
            console.warn("Notification/Email error:", notifErr.message);
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

        const employee = await getEmployeeForUser(req.user);
        const isOwner = employee && leave.employee?._id?.toString() === employee._id.toString();
        const isPrivileged = ["admin", "hr"].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ success: false, message: "Not authorized to cancel this leave" });
        }

        if (["rejected", "cancelled"].includes(leave.status)) {
            return res.status(400).json({ success: false, message: "Cannot cancel an already rejected/cancelled leave" });
        }

        // Restore balance if was approved
        if (leave.status === "approved" && leave.leaveType !== "unpaid" && leave.employee) {
            const balanceField = `leaveBalance.${leave.leaveType}`;
            await Employee.findByIdAndUpdate(leave.employee._id, {
                $inc: { [balanceField]: leave.totalDays || 1 }
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

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus,
    cancelLeave,
    getLeaveStats
};
