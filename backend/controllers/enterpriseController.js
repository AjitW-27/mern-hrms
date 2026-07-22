const asyncHandler = require("../utils/asyncHandler");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const Payroll = require("../models/payrollModel");
const Leave = require("../models/leaveModule");
const {
  Branch,
  Designation,
  Job,
  Candidate,
  Interview,
  OnboardingTask,
  LeavePolicy,
  Shift,
  AttendanceRegularization,
  SalaryStructure,
  Payslip,
  ReportExport
} = require("../models/enterpriseModels");

const registry = {
  branches: { Model: Branch, populate: "organization manager" },
  designations: { Model: Designation, populate: "department" },
  jobs: { Model: Job, populate: "department designation branch postedBy" },
  candidates: { Model: Candidate, populate: "job owner" },
  interviews: { Model: Interview, populate: "candidate job interviewers" },
  onboardingTasks: { Model: OnboardingTask, populate: "employee candidate assignedTo" },
  leavePolicies: { Model: LeavePolicy },
  shifts: { Model: Shift },
  regularizations: { Model: AttendanceRegularization, populate: "employee attendance reviewedBy" },
  salaryStructures: { Model: SalaryStructure, populate: "employee" },
  payslips: { Model: Payslip, populate: "employee generatedBy" },
  reportExports: { Model: ReportExport, populate: "requestedBy" }
};

const getConfig = (resource) => {
  const config = registry[resource];
  if (!config) {
    const err = new Error(`Unknown enterprise resource: ${resource}`);
    err.statusCode = 404;
    throw err;
  }
  return config;
};

const list = (resource) => asyncHandler(async (req, res) => {
  const { Model, populate } = getConfig(resource);
  const { page = 1, limit = 20, search, status } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const query = Model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  if (populate) query.populate(populate);

  const [data, total] = await Promise.all([query, Model.countDocuments(filter)]);
  res.json({ success: true, data, total, page: Number(page), totalPages: Math.ceil(total / limit) });
});

const create = (resource) => asyncHandler(async (req, res) => {
  const { Model, populate } = getConfig(resource);
  const payload = { ...req.body };
  if (["jobs", "reportExports"].includes(resource)) payload.postedBy = payload.postedBy || req.user._id;
  if (resource === "reportExports") payload.requestedBy = req.user._id;
  if (resource === "payslips") payload.generatedBy = req.user._id;

  const item = await Model.create(payload);
  const data = populate ? await item.populate(populate) : item;
  res.status(201).json({ success: true, message: `${resource} created`, data });
});

const getById = (resource) => asyncHandler(async (req, res) => {
  const { Model, populate } = getConfig(resource);
  const query = Model.findById(req.params.id);
  if (populate) query.populate(populate);
  const item = await query;
  if (!item) return res.status(404).json({ success: false, message: `${resource} not found` });
  res.json({ success: true, data: item });
});

const update = (resource) => asyncHandler(async (req, res) => {
  const { Model, populate } = getConfig(resource);
  const query = Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (populate) query.populate(populate);
  const item = await query;
  if (!item) return res.status(404).json({ success: false, message: `${resource} not found` });
  res.json({ success: true, message: `${resource} updated`, data: item });
});

const remove = (resource) => asyncHandler(async (req, res) => {
  const { Model } = getConfig(resource);
  const item = await Model.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: `${resource} not found` });
  res.json({ success: true, message: `${resource} deleted` });
});

const approveRegularization = asyncHandler(async (req, res) => {
  const regularization = await AttendanceRegularization.findById(req.params.id);
  if (!regularization) return res.status(404).json({ success: false, message: "Regularization not found" });

  regularization.status = req.body.status || "Approved";
  regularization.reviewedBy = req.user._id;
  regularization.reviewedAt = new Date();
  regularization.reviewerComment = req.body.comment;
  await regularization.save();

  if (regularization.status === "Approved") {
    await Attendance.findOneAndUpdate(
      { employeeId: regularization.employee, date: regularization.date },
      {
        employeeId: regularization.employee,
        date: regularization.date,
        status: "Present",
        checkIn: regularization.requestedCheckIn,
        checkOut: regularization.requestedCheckOut,
        punchSource: "Manual",
        isManualOverride: true,
        overrideBy: req.user._id,
        overrideReason: regularization.reason
      },
      { upsert: true, new: true }
    );
  }

  res.json({ success: true, message: "Regularization reviewed", data: regularization });
});

const generatePayslip = asyncHandler(async (req, res) => {
  const { employeeId, month, year } = req.body;
  const salary = await SalaryStructure.findOne({ employee: employeeId, isActive: true }).sort({ effectiveFrom: -1 });
  if (!salary) return res.status(404).json({ success: false, message: "Active salary structure not found" });

  const grossPay = salary.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalDeductions = salary.deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const payslip = await Payslip.findOneAndUpdate(
    { employee: employeeId, month, year },
    { employee: employeeId, month, year, grossPay, totalDeductions, netPay: grossPay - totalDeductions, status: "Generated", generatedBy: req.user._id },
    { upsert: true, new: true, runValidators: true }
  ).populate("employee generatedBy");

  res.status(201).json({ success: true, message: "Payslip generated", data: payslip });
});

const hrSummaryReport = asyncHandler(async (req, res) => {
  const year = Number(req.query.year || new Date().getFullYear());
  const [employees, attendance, leaves, payroll] = await Promise.all([
    Employee.aggregate([{ $group: { _id: "$department", employees: { $sum: 1 }, active: { $sum: { $cond: ["$isActive", 1, 0] } } } }]),
    Attendance.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Leave.aggregate([{ $match: { fromDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Payroll.aggregate([{ $match: { year } }, { $group: { _id: "$month", totalNet: { $sum: "$netSalary" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
  ]);

  res.json({ success: true, year, data: { employees, attendance, leaves, payroll } });
});

module.exports = {
  list,
  create,
  getById,
  update,
  remove,
  approveRegularization,
  generatePayslip,
  hrSummaryReport
};
