const mongoose = require("mongoose");

const ref = (model) => ({ type: mongoose.Schema.Types.ObjectId, ref: model });

const branchSchema = new mongoose.Schema({
  organization: ref("Organization"),
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  address: String,
  city: String,
  state: String,
  country: { type: String, default: "India" },
  timezone: { type: String, default: "Asia/Kolkata" },
  manager: ref("Employee"),
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
branchSchema.index({ organization: 1, code: 1 }, { unique: true });

const designationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true, unique: true },
  department: ref("Department"),
  level: { type: Number, default: 1 },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: ref("Department"),
  designation: ref("Designation"),
  branch: ref("Branch"),
  openings: { type: Number, default: 1 },
  employmentType: { type: String, enum: ["Full-time", "Part-time", "Contract", "Intern"], default: "Full-time" },
  status: { type: String, enum: ["Draft", "Open", "On Hold", "Closed"], default: "Open" },
  description: String,
  requirements: [String],
  budgetMin: Number,
  budgetMax: Number,
  postedBy: ref("User"),
  closingDate: Date
}, { timestamps: true });

const candidateSchema = new mongoose.Schema({
  job: ref("Job"),
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: String,
  resumeUrl: String,
  source: String,
  stage: {
    type: String,
    enum: ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"],
    default: "Applied"
  },
  rating: { type: Number, min: 1, max: 5 },
  notes: String,
  owner: ref("User")
}, { timestamps: true });

const interviewSchema = new mongoose.Schema({
  candidate: { ...ref("Candidate"), required: true },
  job: ref("Job"),
  round: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  interviewers: [ref("User")],
  mode: { type: String, enum: ["Phone", "Video", "In Person"], default: "Video" },
  status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
  feedback: String,
  score: { type: Number, min: 1, max: 10 }
}, { timestamps: true });

const onboardingTaskSchema = new mongoose.Schema({
  employee: ref("Employee"),
  candidate: ref("Candidate"),
  title: { type: String, required: true },
  category: { type: String, enum: ["HR", "IT", "Finance", "Manager", "Document"], default: "HR" },
  dueDate: Date,
  status: { type: String, enum: ["Pending", "In Progress", "Completed", "Blocked"], default: "Pending" },
  assignedTo: ref("User"),
  completedAt: Date,
  documents: [{ name: String, url: String, verified: { type: Boolean, default: false } }]
}, { timestamps: true });

const leavePolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  leaveType: { type: String, required: true },
  annualQuota: { type: Number, default: 0 },
  carryForwardLimit: { type: Number, default: 0 },
  requiresApproval: { type: Boolean, default: true },
  approverRoles: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true, unique: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  graceMinutes: { type: Number, default: 10 },
  weeklyOffDays: { type: [String], default: ["Saturday", "Sunday"] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const attendanceRegularizationSchema = new mongoose.Schema({
  employee: { ...ref("Employee"), required: true },
  attendance: ref("Attendance"),
  date: { type: String, required: true },
  requestedCheckIn: String,
  requestedCheckOut: String,
  reason: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  reviewedBy: ref("User"),
  reviewedAt: Date,
  reviewerComment: String
}, { timestamps: true });

const salaryStructureSchema = new mongoose.Schema({
  employee: { ...ref("Employee"), required: true },
  effectiveFrom: { type: Date, required: true },
  earnings: [{ name: String, amount: Number }],
  deductions: [{ name: String, amount: Number }],
  ctc: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const payslipSchema = new mongoose.Schema({
  employee: { ...ref("Employee"), required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  grossPay: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netPay: { type: Number, default: 0 },
  status: { type: String, enum: ["Draft", "Generated", "Paid"], default: "Draft" },
  generatedBy: ref("User"),
  paidAt: Date
}, { timestamps: true });
payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const reportExportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  requestedBy: ref("User"),
  filters: Object,
  status: { type: String, enum: ["Queued", "Ready", "Failed"], default: "Queued" },
  fileUrl: String
}, { timestamps: true });

module.exports = {
  Branch: mongoose.models.Branch || mongoose.model("Branch", branchSchema),
  Designation: mongoose.models.Designation || mongoose.model("Designation", designationSchema),
  Job: mongoose.models.Job || mongoose.model("Job", jobSchema),
  Candidate: mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema),
  Interview: mongoose.models.Interview || mongoose.model("Interview", interviewSchema),
  OnboardingTask: mongoose.models.OnboardingTask || mongoose.model("OnboardingTask", onboardingTaskSchema),
  LeavePolicy: mongoose.models.LeavePolicy || mongoose.model("LeavePolicy", leavePolicySchema),
  Shift: mongoose.models.Shift || mongoose.model("Shift", shiftSchema),
  AttendanceRegularization: mongoose.models.AttendanceRegularization || mongoose.model("AttendanceRegularization", attendanceRegularizationSchema),
  SalaryStructure: mongoose.models.SalaryStructure || mongoose.model("SalaryStructure", salaryStructureSchema),
  Payslip: mongoose.models.Payslip || mongoose.model("Payslip", payslipSchema),
  ReportExport: mongoose.models.ReportExport || mongoose.model("ReportExport", reportExportSchema)
};
