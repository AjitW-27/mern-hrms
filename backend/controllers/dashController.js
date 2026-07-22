// controllers/dashController.js
const Employee = require("../models/employeeModel");
const Department = require("../models/departmentModel");
const Project = require("../models/projectModel");
const Attendance = require("../models/attendanceModel");
const Leave = require("../models/leaveModule");
const { Announcement, Holiday } = require("../models/otherModel");

// Try to require Payroll (two models exist in project)
let Payroll;
try {
    Payroll = require("../models/payrollModel");
} catch {
    Payroll = require("../models/payrollModels.example");
}

// ═══════════════════════════════════════════════════════════════
// GET DASHBOARD SUMMARY — role-aware, fully dynamic
// ═══════════════════════════════════════════════════════════════
exports.getDashboardSummary = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const userRole = req.user?.role || "employee";

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // ── Run all queries in parallel ──────────────────────────────────────
        const [
            totalEmployees,
            totalDepartments,
            activeProjects,
            payrollAgg,
            todayPresent,
            todayAbsent,
            todayLate,
            pendingLeaves,
            departmentDist,
            recentEmployees,
            recentProjects,
            announcements,
            upcomingHolidays,
            monthlyAttendanceTrend,
            leaveTypeDist,
            monthlyPayrollTrend,
            newJoineesThisMonth,
            genderDist,
            employmentTypeDist,
            projectStatusDist,
        ] = await Promise.all([
            Employee.countDocuments({ isActive: true }),
            Department.countDocuments({ isActive: true }),
            Project.countDocuments({ status: "In Progress" }),

            Payroll.aggregate([{ $group: { _id: null, total: { $sum: "$netSalary" } } }]).catch(() => []),

            Attendance.countDocuments({ date: today, status: { $in: ["Present", "Late"] } }),
            Attendance.countDocuments({ date: today, status: "Absent" }),
            Attendance.countDocuments({ date: today, status: "Late" }),

            Leave.countDocuments({ status: "pending" }),

            Employee.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: "$department", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            Employee.find({ isActive: true })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("fullName department designation joiningDate avatar employeeId"),

            Project.find()
                .sort({ createdAt: -1 })
                .limit(3)
                .select("name status progress deadline client"),

            Announcement.find({ isActive: true })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("postedBy", "name")
                .catch(() => []),

            Holiday.find({
                date: { $gte: now, $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
                isActive: true
            }).sort({ date: 1 }).limit(5).catch(() => []),

            // Last 7 days attendance trend
            Attendance.aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                        }
                    }
                },
                { $group: { _id: { date: "$date", status: "$status" }, count: { $sum: 1 } } },
                { $sort: { "_id.date": 1 } }
            ]).catch(() => []),

            Leave.aggregate([
                { $group: { _id: "$leaveType", count: { $sum: 1 } } }
            ]).catch(() => []),

            // Last 6 months payroll
            Payroll.aggregate([
                { $group: { _id: { month: "$month", year: "$year" }, total: { $sum: "$netSalary" }, count: { $sum: 1 } } },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 6 }
            ]).catch(() => []),

            Employee.countDocuments({
                joiningDate: {
                    $gte: new Date(currentYear, currentMonth - 1, 1),
                    $lt: new Date(currentYear, currentMonth, 1)
                }
            }),

            Employee.aggregate([
                { $match: { isActive: true, gender: { $exists: true } } },
                { $group: { _id: "$gender", count: { $sum: 1 } } }
            ]),

            Employee.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: "$employmentType", count: { $sum: 1 } } }
            ]),

            Project.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
        ]);

        // ── Process attendance trend ─────────────────────────────────────────
        const attMap = {};
        monthlyAttendanceTrend.forEach(item => {
            const d = item._id.date;
            if (!attMap[d]) attMap[d] = { date: d, Present: 0, Absent: 0, Late: 0 };
            const s = item._id.status;
            if (["Present"].includes(s)) attMap[d].Present += item.count;
            if (s === "Absent") attMap[d].Absent += item.count;
            if (s === "Late") { attMap[d].Late += item.count; attMap[d].Present += item.count; }
        });
        const attendanceTrend = Object.values(attMap).map(d => ({
            ...d,
            date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
        }));

        // ── Process payroll trend ────────────────────────────────────────────
        const payrollTrend = monthlyPayrollTrend.map(item => ({
            month: monthNames[(item._id.month || 1) - 1],
            total: Math.round(item.total || 0),
            count: item.count
        }));

        // ── Recent activities ────────────────────────────────────────────────
        const recentActivities = [
            ...recentEmployees.map(e => ({
                type: "employee",
                content: `${e.fullName} joined ${e.department}`,
                subContent: e.designation,
                time: e.createdAt,
                icon: "user"
            })),
            ...recentProjects.map(p => ({
                type: "project",
                content: `Project "${p.name}" — ${p.status}`,
                subContent: p.client || "",
                time: p.createdAt,
                icon: "briefcase"
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

        const attendanceRate = totalEmployees > 0
            ? Math.round((todayPresent / totalEmployees) * 100) : 0;

        const response = {
            success: true,
            kpis: {
                totalEmployees,
                totalDepartments,
                activeProjects,
                totalPayroll: payrollAgg[0]?.total || 0,
                todayPresent,
                todayAbsent,
                todayLate,
                pendingLeaves,
                attendanceRate,
                newJoineesThisMonth,
            },
            charts: {
                departmentDistribution: departmentDist.map(d => ({
                    name: d._id || "Unknown",
                    value: d.count
                })),
                attendanceTrend,
                leaveTypeDistribution: leaveTypeDist.map(l => ({
                    name: (l._id || "other").charAt(0).toUpperCase() + (l._id || "other").slice(1),
                    value: l.count
                })),
                payrollTrend,
                genderDistribution: genderDist.map(g => ({
                    name: g._id || "Not Specified",
                    value: g.count
                })),
                employmentTypeDistribution: employmentTypeDist.map(e => ({
                    name: e._id || "Unknown",
                    value: e.count
                })),
                projectStatusDistribution: projectStatusDist.map(p => ({
                    name: p._id || "Unknown",
                    value: p.count
                }))
            },
            feed: {
                recentActivities,
                announcements: announcements.map(a => ({
                    _id: a._id,
                    title: a.title,
                    message: a.message,
                    audience: a.audience,
                    postedBy: a.postedBy?.name || "HR Team",
                    createdAt: a.createdAt
                })),
                upcomingHolidays: upcomingHolidays.map(h => ({
                    _id: h._id,
                    name: h.name,
                    date: h.date,
                    type: h.type
                }))
            }
        };

        // Role-based data filtering
        if (userRole === "employee") {
            delete response.kpis.totalPayroll;
            delete response.kpis.pendingLeaves;
            delete response.kpis.todayAbsent;
            delete response.charts.payrollTrend;
        }

        res.status(200).json(response);

    } catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({ success: false, message: "Error fetching dashboard data", error: error.message });
    }
};
