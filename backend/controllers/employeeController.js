const Employee = require("../models/employeeModel");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const { createNotification } = require("../utils/notificationHelper");
const { sendEmail } = require("../utils/emailService");
const bcrypt = require("bcryptjs");
const Asset = require("../models/assetModel");
const asyncHandler = require("../utils/asyncHandler");

// ADD EMPLOYEE
const addEmployee = asyncHandler(async (req, res) => {
    let {
        fullName, email, mobileNo, designation, role, department,
        dateOfBirth, gender, joiningDate, employmentType, employmentStatus, salary,
        bankDetails, address, emergencyContact, biometricId,
        reportsTo, workLocation, shiftTiming,
        assetGiven, assetDetails
    } = req.body;

    const exists = await Employee.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Employee with this email already exists" });

    // Normalize Employment Type string formatting defensively
    if (employmentType === "Full Time") employmentType = "Full-time";
    if (employmentType === "Part Time") employmentType = "Part-time";

    const normalizedRole = String(role || "employee").trim().toLowerCase().replace(/\s+/g, "_");
    const roleDoc = await Role.findOne({ $or: [{ code: normalizedRole }, { name: normalizedRole }] }).select("code name isActive").lean();
    if (!roleDoc && !["employee", "manager", "hr", "admin", "superadmin"].includes(normalizedRole)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
    }
    if (roleDoc?.isActive === false) {
        return res.status(400).json({ success: false, message: "Selected role is inactive" });
    }

    const avatarPath = req.file ? `/uploads/employees/${req.file.filename}` : null;

    const employee = await Employee.create({
        fullName, email, mobileNo, designation, role: normalizedRole, department,
        dateOfBirth, gender, joiningDate: joiningDate || new Date(),
        employmentType: employmentType || "Full-time",
        employmentStatus: employmentStatus || "Active",
        salary, bankDetails, address, emergencyContact, biometricId,
        reportsTo: reportsTo || undefined,
        workLocation, shiftTiming,
        avatar: avatarPath
    });

    const tempPassword = Math.random().toString(36).slice(-10);
    const user = await User.create({
        name: fullName,
        email,
        password: tempPassword,
        mobileNo,
        department,
        role: normalizedRole,
        employeeRef: employee._id
    });

    employee.userId = user._id;
    await employee.save();

    if (assetGiven && assetDetails) {
        await Asset.create({
            ...assetDetails,
            assignedTo: employee._id,
            status: "Assigned",
            assignedDate: new Date()
        });
    }

    try {
        await sendEmail({
            to: email,
            subject: `Welcome to the Team - Your Login Credentials`,
            html: `
                <h2>Welcome aboard, ${fullName}! 🎉</h2>
                <p>Your HRMS account has been created. Use the following credentials to log in:</p>
                <table>
                    <tr><td><b>Email:</b></td><td>${email}</td></tr>
                    <tr><td><b>Password:</b></td><td>${tempPassword}</td></tr>
                    <tr><td><b>Employee ID:</b></td><td>${employee.employeeId}</td></tr>
                </table>
                <p style="color:red">Please change your password after first login.</p>
                <p>Login: <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
            `
        });
    } catch (emailErr) {
        console.error("Welcome email error:", emailErr.message);
    }

    res.status(201).json({
        success: true,
        message: "Employee added successfully",
        data: employee,
        tempPassword
    });
});

// GET EMPLOYEES
const getEmployees = asyncHandler(async (req, res) => {
    const { search, department, role, designation, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (search) {
        filter.$or = [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { employeeId: { $regex: search, $options: "i" } }
        ];
    }
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (designation) filter.designation = { $regex: String(designation).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const sortField = ["fullName", "employeeId", "joiningDate"].includes(req.query.sort) ? req.query.sort : "createdAt";
    const sortDirection = req.query.sort ? (req.query.order === "desc" ? -1 : 1) : -1;

    const [total, data] = await Promise.all([
        Employee.countDocuments(filter),
        Employee.find(filter)
            .populate("reportsTo", "fullName")
            .sort({ [sortField]: sortDirection, _id: 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
    ]);

    res.json({ success: true, data, page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) });
});

const getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    res.json({ success: true, data: employee });
});

const updateEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    const patch = { ...req.body };
    delete patch._id;
    delete patch.userId;
    delete patch.employeeId;
    delete patch.createdAt;
    delete patch.updatedAt;

    if (patch.role !== undefined) {
        patch.role = String(patch.role).trim().toLowerCase().replace(/\s+/g, "_");
        const roleDoc = await Role.findOne({ $or: [{ code: patch.role }, { name: patch.role }] }).select("code name isActive").lean();
        if (!roleDoc && !["employee", "manager", "hr", "admin", "superadmin"].includes(patch.role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }
        if (roleDoc?.isActive === false) return res.status(400).json({ success: false, message: "Selected role is inactive" });
    }

    Object.assign(employee, patch);
    await employee.save();

    if (employee.userId) {
        const userPatch = {};
        if (patch.fullName !== undefined) userPatch.name = patch.fullName;
        if (patch.email !== undefined) userPatch.email = patch.email;
        if (patch.mobileNo !== undefined) userPatch.mobileNo = patch.mobileNo;
        if (patch.department !== undefined) userPatch.department = patch.department;
        if (patch.role !== undefined) userPatch.role = patch.role;
        if (patch.isActive !== undefined) userPatch.isActive = patch.isActive;
        if (Object.keys(userPatch).length) await User.findByIdAndUpdate(employee.userId, userPatch, { runValidators: true });
    }

    res.json({ success: true, data: employee });
});

const deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    employee.isActive = false;
    await employee.save();
    res.json({ success: true, message: "Employee deactivated" });
});

const updateLeaveBalance = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    employee.leaveBalance = {
        ...(employee.leaveBalance || {}),
        ...(req.body.leaveBalance || req.body)
    };
    await employee.save();
    res.json({ success: true, data: employee });
});

const getEmployeeStats = asyncHandler(async (req, res) => {
    const total = await Employee.countDocuments();
    const active = await Employee.countDocuments({ isActive: true });
    const inactive = total - active;

    const [byDept, byType, recentJoiners] = await Promise.all([
        Employee.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }]),
        Employee.aggregate([{ $group: { _id: "$employmentType", count: { $sum: 1 } } }]),
        Employee.find({ isActive: true }).sort({ joiningDate: -1 }).limit(5).select("fullName department designation joiningDate avatar")
    ]);

    res.json({
        success: true,
        data: { total, active, inactive, byDepartment: byDept, byEmploymentType: byType, recentJoiners }
    });
});

const bulkImportEmployees = asyncHandler(async (req, res) => {
    const employees = req.body.employees;
    if (!Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({ success: false, message: "employees array is required" });
    }

    const results = { success: [], failed: [] };

    for (const emp of employees) {
        try {
            const existing = await Employee.findOne({ email: emp.email });
            if (existing) {
                results.failed.push({ email: emp.email, reason: "Email already exists" });
                continue;
            }
            const created = await Employee.create(emp);
            results.success.push(created.employeeId);
        } catch (err) {
            results.failed.push({ email: emp.email, reason: err.message });
        }
    }

    res.json({
        success: true,
        message: `Imported ${results.success.length} employees. ${results.failed.length} failed.`,
        results
    });
});

module.exports = {
    addEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    updateLeaveBalance,
    getEmployeeStats,
    bulkImportEmployees,
    getAll: getEmployees,
    createOne: addEmployee,
    updateOne: updateEmployee,
    deleteOne: deleteEmployee,
    bulkUploadEmployees: bulkImportEmployees,
    getEmployeeProfile: getEmployeeById,
    getEmployeeDocuments: asyncHandler(async (req, res) => res.json({ success: true, data: [] })),
    uploadDocument: asyncHandler(async (req, res) => res.status(501).json({ success: false, message: "Document upload is not implemented yet" }))
};
