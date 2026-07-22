const Employee = require("../models/employeeModel");
const Department = require("../models/departmentModel");
const Project = require("../models/projectModel");
const Payroll = require("../models/payrollModel");
const Attendance = require("../models/attendanceModel");
const Leave = require("../models/leaveModule");
const { Announcement, Performance, Document, Holiday, Notification, Settings } = require("../models/otherModel");
const { createNotification } = require("../utils/notificationHelper");

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTMENT CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const addDepartment = async (req, res) => {
    try {
        const dept = await Department.create(req.body);
        res.status(201).json({ success: true, message: "Department created", data: dept });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDepartments = async (req, res) => {
    try {
        const depts = await Department.find({ isActive: true }).populate("head", "fullName designation").lean();
        const enriched = await Promise.all(depts.map(async (dept) => {
            const employees = await Employee.find({ department: dept.name, isActive: true }).select("fullName avatar");
            return { ...dept, employeeCount: employees.length, members: employees.slice(0, 5) };
        }));
        res.json({ success: true, data: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!dept) return res.status(404).json({ success: false, message: "Department not found" });
        res.json({ success: true, message: "Department updated", data: dept });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const empCount = await Employee.countDocuments({ department: (await Department.findById(req.params.id))?.name });
        if (empCount > 0) return res.status(400).json({ success: false, message: `Cannot delete: ${empCount} employees belong to this department` });
        await Department.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Department deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECT CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const addProject = async (req, res) => {
    try {
        const progressMap = { "Not Started": 0, "In Progress": 50, "Completed": 100, "Delayed": 30, "On Hold": 0, "Cancelled": 0 };
        const project = await Project.create({ ...req.body, progress: req.body.progress ?? progressMap[req.body.status] ?? 0 });
        res.status(201).json({ success: true, message: "Project created", data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProjects = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, search } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { client: { $regex: search, $options: "i" } }];

        const [projects, total] = await Promise.all([
            Project.find(filter).populate("projectManager", "fullName").populate("teamMembers", "fullName avatar").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
            Project.countDocuments(filter)
        ]);
        res.json({ success: true, total, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        res.json({ success: true, message: "Project updated", data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addProjectTask = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        project.tasks.push(req.body);
        await project.save();
        res.json({ success: true, message: "Task added", data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const getDashboardSummary = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const [totalEmployees, totalDepartments, activeProjects, payrollData,
            todayPresent, pendingLeaves, departmentDist, recentEmployees,
            recentProjects, monthlyPayroll
        ] = await Promise.all([
            Employee.countDocuments({ isActive: true }),
            Department.countDocuments({ isActive: true }),
            Project.countDocuments({ status: "In Progress" }),
            Payroll.aggregate([{ $group: { _id: null, total: { $sum: "$netSalary" } } }]),
            Attendance.countDocuments({ date: today, status: { $in: ["Present", "Late"] } }),
            Leave.countDocuments({ status: "pending" }),
            Employee.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$department", count: { $sum: 1 } } }]),
            Employee.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select("fullName department designation joiningDate avatar employeeId"),
            Project.find().sort({ createdAt: -1 }).limit(3).select("name status progress deadline client"),
            Payroll.aggregate([
                { $match: { month: currentMonth, year: currentYear } },
                { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$netSalary" } } }
            ])
        ]);

        const recentActivities = [
            ...recentEmployees.map(e => ({ type: "employee", content: `${e.fullName} joined ${e.department}`, time: e.createdAt, icon: "user" })),
            ...recentProjects.map(p => ({ type: "project", content: `Project "${p.name}" is ${p.status}`, time: p.createdAt, icon: "briefcase" }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        res.json({
            success: true,
            kpis: {
                totalEmployees,
                totalDepartments,
                activeProjects,
                totalPayroll: payrollData[0]?.total || 0,
                todayPresent,
                pendingLeaves
            },
            charts: { departmentDistribution: departmentDist },
            feed: { recentActivities, recentEmployees, recentProjects },
            payroll: { monthlyBreakdown: monthlyPayroll }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENT CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const createAnnouncement = async (req, res) => {
    try {
        const ann = await Announcement.create({ ...req.body, postedBy: req.user._id });
        // Broadcast via socket
        req.app.get("io").emit("new_announcement", ann);
        res.status(201).json({ success: true, data: ann });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAnnouncements = async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.user.role === "employee") {
            filter.$or = [
                { audience: "All" },
                { audience: "Department", targetDepartment: req.user.department },
                { audience: "Role", targetRole: req.user.role }
            ];
        }
        const announcements = await Announcement.find(filter).populate("postedBy", "name").sort({ createdAt: -1 }).limit(20);
        res.json({ success: true, data: announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const createPerformanceReview = async (req, res) => {
    try {
        const review = await Performance.create({ ...req.body, reviewer: req.user._id });
        res.status(201).json({ success: true, message: "Review created", data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPerformanceReviews = async (req, res) => {
    try {
        const { employeeId, year, status } = req.query;
        const filter = {};
        if (employeeId) filter.employee = employeeId;
        if (year) filter.reviewPeriod = { $regex: year };
        if (status) filter.status = status;

        const reviews = await Performance.find(filter)
            .populate("employee", "fullName employeeId department")
            .populate("reviewer", "name")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const acknowledgeReview = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        const review = await Performance.findOneAndUpdate(
            { _id: req.params.id, employee: employee?._id },
            { status: "Acknowledged", acknowledgedAt: new Date(), employeeComments: req.body.comments },
            { new: true }
        );
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });
        res.json({ success: true, message: "Review acknowledged", data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "File is required" });
        const doc = await Document.create({
            employee: req.body.employeeId || (await Employee.findOne({ userId: req.user._id }))?._id,
            documentType: req.body.documentType,
            fileName: req.file.originalname,
            filePath: `/uploads/documents/${req.file.filename}`,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            description: req.body.description,
            uploadedBy: req.user._id
        });
        res.status(201).json({ success: true, message: "Document uploaded", data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDocuments = async (req, res) => {
    try {
        const { employeeId, documentType } = req.query;
        const filter = {};
        if (employeeId) filter.employee = employeeId;
        if (documentType) filter.documentType = documentType;

        // Employee can only see own docs
        if (req.user.role === "employee") {
            const emp = await Employee.findOne({ userId: req.user._id });
            filter.employee = emp?._id;
        }

        const docs = await Document.find(filter).populate("employee", "fullName employeeId").populate("uploadedBy", "name").sort({ createdAt: -1 });
        res.json({ success: true, data: docs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOLIDAY CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const addHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.create(req.body);
        res.status(201).json({ success: true, data: holiday });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getHolidays = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        const holidays = await Holiday.find({ year: Number(year), isActive: true }).sort({ date: 1 });
        res.json({ success: true, data: holidays });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteHoliday = async (req, res) => {
    try {
        await Holiday.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Holiday deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
        const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
        res.json({ success: true, unreadCount, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json({ success: true, message: "Settings updated", data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

const getAttendanceReport = async (req, res) => {
    try {
        const { month, year, department } = req.query;
        const start = `${year}-${String(month).padStart(2, "0")}-01`;
        const end = `${year}-${String(month).padStart(2, "0")}-31`;

        let empFilter = { isActive: true };
        if (department) empFilter.department = department;
        const employees = await Employee.find(empFilter).select("_id fullName employeeId department designation");

        const report = await Promise.all(employees.map(async (emp) => {
            const records = await Attendance.find({ employeeId: emp._id, date: { $gte: start, $lte: end } });
            return {
                employee: { id: emp._id, name: emp.fullName, employeeId: emp.employeeId, department: emp.department },
                present: records.filter(r => r.status === "Present").length,
                absent: records.filter(r => r.status === "Absent").length,
                late: records.filter(r => r.status === "Late").length,
                halfDay: records.filter(r => r.status === "Half Day").length,
                onLeave: records.filter(r => r.status === "On Leave").length,
                total: records.length
            };
        }));

        res.json({ success: true, period: `${month}/${year}`, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPayrollReport = async (req, res) => {
    try {
        const { year } = req.query;
        const data = await Payroll.aggregate([
            { $match: { year: Number(year) } },
            {
                $group: {
                    _id: "$month",
                    totalGross: { $sum: "$grossSalary" },
                    totalDeductions: { $sum: "$totalDeductions" },
                    totalNet: { $sum: "$netSalary" },
                    employeeCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json({ success: true, year, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getLeaveReport = async (req, res) => {
    try {
        const { year, department } = req.query;
        let matchStage = { fromDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } };

        const data = await Leave.aggregate([
            { $match: matchStage },
            { $lookup: { from: "employees", localField: "employee", foreignField: "_id", as: "empData" } },
            { $unwind: "$empData" },
            ...(department ? [{ $match: { "empData.department": department } }] : []),
            {
                $group: {
                    _id: { leaveType: "$leaveType", status: "$status" },
                    count: { $sum: 1 },
                    totalDays: { $sum: "$totalDays" }
                }
            }
        ]);

        res.json({ success: true, year, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    // Department
    addDepartment, getDepartments, updateDepartment, deleteDepartment,
    // Project
    addProject, getProjects, updateProject, deleteProject, addProjectTask,
    // Dashboard
    getDashboardSummary,
    // Announcement
    createAnnouncement, getAnnouncements,
    // Performance
    createPerformanceReview, getPerformanceReviews, acknowledgeReview,
    // Document
    uploadDocument, getDocuments,
    // Holiday
    addHoliday, getHolidays, deleteHoliday,
    // Notification
    getNotifications, markAllRead,
    // Settings
    getSettings, updateSettings,
    // Reports
    getAttendanceReport, getPayrollReport, getLeaveReport
};
