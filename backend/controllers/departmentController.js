const Department = require("../models/departmentModel");
const Employee = require("../models/employeeModel");
const asyncHandler = require("../utils/asyncHandler");

const addDepartment = asyncHandler(async (req, res) => {
    const existing = await Department.findOne({ name: req.body.name });
    if (existing) {
        return res.status(400).json({ success: false, message: "Department already exists" });
    }
    const newDept = await Department.create(req.body);
    res.status(201).json({ success: true, data: newDept });
});

const getDepartments = asyncHandler(async (req, res) => {
    const depts = await Department.find().sort({ createdAt: -1 }).lean();

    const departmentsWithStats = await Promise.all(
        depts.map(async (dept) => {
            const employees = await Employee.find({ department: dept.name });
            const memberInitials = employees.map(emp => emp.fullName ? emp.fullName[0].toUpperCase() : "");
            return {
                ...dept,
                count: employees.length,
                members: memberInitials
            };
        })
    );

    res.status(200).json({ success: true, data: departmentsWithStats });
});

const updateDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ success: false, message: "Department not found" });
    res.json({ success: true, data: department });
});

const deleteDepartment = asyncHandler(async (req, res) => {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: "Department not found" });
    res.json({ success: true, message: "Department deleted" });
});

module.exports = {
    addDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
    getAll: getDepartments,
    createOne: addDepartment,
    updateOne: updateDepartment,
    deleteOne: deleteDepartment
};
