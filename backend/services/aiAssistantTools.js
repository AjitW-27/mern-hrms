const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const Leave = require("../models/leaveModule");
const Payroll = require("../models/payrollModel");
const logger = require("../utils/logger");
const { permit } = require("../middleware/authMiddleware");
const { Holiday } = require("../models/otherModel");

const privilegedRoles = new Set(["admin", "hr", "manager", "superadmin", "super_admin"]);
const safeDate = (value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || "")) ? String(value) : null;
const employeeForUser = (user) => {
  const clauses = [{ userId: user._id }];
  const ref = user.employeeRef?._id || user.employeeRef || user.employee_id;
  if (ref && /^[a-f0-9]{24}$/i.test(String(ref))) clauses.unshift({ _id: ref });
  if (user.employeeId) clauses.push({ employeeId: user.employeeId });
  if (user.email?.trim()) clauses.push({ email: new RegExp(`^${user.email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
  return Employee.findOne({ $or: clauses }).select("fullName employeeId department designation joiningDate dateOfBirth leaveBalance isActive").lean();
};
const missingProfile = req => ({ message: ["admin", "hr", "superadmin", "super_admin"].includes(req.userRole) ? "Which employee? Your admin account has no personal employee profile. Ask for headcount by department, who is on leave today, pending approvals, or upcoming holidays. HR can link your profile from Users > Link employee." : "Your account is not linked to an employee profile. Please contact HR." });
const isPrivileged = (req) => privilegedRoles.has(String(req.userRole || "").toLowerCase());

const definitions = [
  { type: "function", name: "get_my_profile", description: "Get the authenticated user's basic employee profile.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { type: "function", name: "get_my_leave_summary", description: "Get the authenticated user's leave balance and recent leave request counts.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { type: "function", name: "get_my_attendance", description: "Get the authenticated user's attendance summary for a month. month must be YYYY-MM, or omitted for the current month.", parameters: { type: "object", properties: { month: { type: "string", pattern: "^\\d{4}-\\d{2}$" } }, additionalProperties: false } },
  { type: "function", name: "get_upcoming_holidays", description: "Get up to five upcoming active company holidays.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { type: "function", name: "get_workforce_summary", description: "Get active employee counts and department totals. Available only to HR, managers, and administrators.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { type: "function", name: "search_employee_directory", description: "Search the authorized employee directory by name, employee ID, department, or designation. Returns only basic work directory fields.", parameters: { type: "object", properties: { query: { type: "string", minLength: 1, maxLength: 80 } }, required: ["query"], additionalProperties: false } },
  { type: "function", name: "get_pending_leave_summary", description: "Get aggregate pending leave counts. Available only to HR, managers, and administrators.", parameters: { type: "object", properties: {}, additionalProperties: false } },
];
definitions.push(...[
  ["get_my_leave_history", "Get the current employee's last 10 leave requests."],
  ["get_my_payslip", "Get the current employee's latest payslip summary; never another employee's payroll."],
  ["get_team_on_leave", "Get authorized team members on approved leave today; managers are limited to direct reports."],
  ["get_people_dates", "Get upcoming authorized employee birthdays and work anniversaries, without birth years."],
  ["get_org_today", "Get organization attendance today and headcount; HR and administrators only."],
].map(([name, description]) => ({ type: "function", name, description, parameters: { type: "object", properties: {}, additionalProperties: false } })));

async function runTool(req, name, args = {}) {
  const definition = definitions.find((tool) => tool.name === name);
  if (!definition) return { error: "That data action is not available." };
  if (!args || typeof args !== "object" || Array.isArray(args)) return { error: "The requested tool arguments are invalid." };
  const allowed = Object.keys(definition.parameters.properties || {});
  if (Object.keys(args).some((key) => !allowed.includes(key))) return { error: "The requested tool arguments are invalid." };
  if (!req.user?._id) return { error: "Authentication is required." };
  const modules = { get_my_profile: "employees", get_my_leave_summary: "leave", get_my_leave_history: "leave", get_my_payslip: "payroll", get_my_attendance: "attendance", get_upcoming_holidays: "dashboard", get_workforce_summary: "employees", search_employee_directory: "employees", get_pending_leave_summary: "leave", get_team_on_leave: "leave", get_people_dates: "employees", get_org_today: "attendance" };
  const requiredModules = name === "get_org_today" ? ["attendance", "employees", "leave"] : name === "get_team_on_leave" ? ["leave", "employees"] : [modules[name]];
  for (const module of requiredModules) {
  const allowedAccess = await new Promise((resolve, reject) => {
    const response = { status() { return this; }, json() { resolve(false); } };
    Promise.resolve(permit(module, "read")(req, response, error => error ? reject(error) : resolve(true))).catch(reject);
  });
  if (!allowedAccess) return { error: "You do not have permission to access this HRMS information." };
  }
  const employee = name.startsWith("get_my_") ? await employeeForUser(req.user) : null;
  if (name.startsWith("get_my_") && !employee) {
    logger.info("ai.profile.unlinked");
    return missingProfile(req);
  }
  if (name === "get_my_profile") return { employeeId: employee.employeeId, name: employee.fullName, department: employee.department, designation: employee.designation, joiningDate: employee.joiningDate };
  if (name === "get_my_leave_history") {
    const leaves = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 }).limit(10).select("leaveType fromDate toDate status totalDays comment").lean();
    return { leaves };
  }
  if (name === "get_my_payslip") {
    const payroll = await Payroll.findOne({ employeeId: employee._id, status: { $in: ["Approved", "Paid"] } }).sort({ year: -1, month: -1 }).select("payPeriod month year grossSalary totalDeductions netSalary status").lean();
    return payroll ? { payslip: payroll } : { message: "No approved or paid payslip is available for your employee profile." };
  }
  if (name === "get_my_leave_summary") {
    if (!employee) return { message: "No linked employee profile is available." };
    const requests = await Leave.aggregate([{ $match: { employee: employee._id } }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
    return { leaveBalance: employee.leaveBalance || {}, requests: Object.fromEntries(requests.map((item) => [item._id, item.count])) };
  }
  if (name === "get_my_attendance") {
    if (!employee) return { message: "No linked employee profile is available." };
    const month = safeDate(args.month) || new Date().toLocaleDateString("en-CA").slice(0, 7);
    const records = await Attendance.aggregate([{ $match: { employeeId: employee._id, date: args.period === "today" ? new Date().toLocaleDateString("en-CA") : { $gte: `${month}-01`, $lte: `${month}-31` } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
    return { month, ...(args.period === "today" ? { date: new Date().toLocaleDateString("en-CA") } : {}), summary: Object.fromEntries(records.map((item) => [item._id, item.count])) };
  }
  if (name === "get_upcoming_holidays") {
    const holidays = await Holiday.find({ isActive: true, date: { $gte: new Date() } }).sort({ date: 1 }).limit(5).select("name date type").lean();
    return { holidays: holidays.map((item) => ({ name: item.name, date: item.date, type: item.type })) };
  }
  if (name === "get_team_on_leave") {
    if (!isPrivileged(req)) return { error: "You can view your own leave history. Team leave information requires manager or HR permission." };
    let scope = {};
    if (req.userRole === "manager") {
      const manager = await employeeForUser(req.user);
      if (!manager) return missingProfile(req);
      const reports = await Employee.find({ reportsTo: manager._id, isActive: true }).select("_id").lean();
      scope = { employee: { $in: reports.map(item => item._id) } };
    }
    const start = new Date(); start.setHours(0, 0, 0, 0); const end = new Date(start); end.setDate(end.getDate() + 1);
    const leaves = await Leave.find({ ...scope, status: "approved", fromDate: { $lt: end }, toDate: { $gte: start } }).populate("employee", "fullName department").select("employee fromDate toDate").limit(30).lean();
    return { onLeave: leaves.filter(item => item.employee).map(item => ({ name: item.employee.fullName, department: item.employee.department, until: item.toDate })) };
  }
  if (req.userRole === "manager" && name !== "get_pending_leave_summary") return { error: "Organization-wide directory and workforce summaries are available to HR and administrators only." };
  if (!isPrivileged(req)) return { error: "You do not have permission to access this organization-level information." };
  if (name === "get_org_today") {
    const today = new Date().toLocaleDateString("en-CA");
    const [totalEmployees, presentToday, pendingRequests] = await Promise.all([Employee.countDocuments({ isActive: true }), Attendance.countDocuments({ date: today, status: { $in: ["Present", "Late"] } }), Leave.countDocuments({ status: "pending" })]);
    return { date: today, totalEmployees, presentToday, pendingRequests };
  }
  if (name === "get_people_dates") {
    const now = new Date(); const dates = [];
    const people = await Employee.find({ isActive: true }).select("fullName dateOfBirth joiningDate").lean();
    people.forEach(person => ["dateOfBirth", "joiningDate"].forEach(field => {
      if (!person[field]) return;
      const original = new Date(person[field]); const next = new Date(now.getFullYear(), original.getMonth(), original.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); if (next < today) next.setFullYear(next.getFullYear() + 1);
      if ((next - today) / 86400000 <= 30) dates.push({ name: person.fullName, event: field === "dateOfBirth" ? "Birthday" : "Work anniversary", date: next.toLocaleDateString("en-CA") });
    }));
    return { upcoming: dates.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 20) };
  }
  if (name === "get_workforce_summary") {
    const [activeEmployees, departments] = await Promise.all([Employee.countDocuments({ isActive: true }), Employee.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$department", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }])]);
    return { activeEmployees, departments: departments.map((item) => ({ name: item._id || "Unassigned", count: item.count })) };
  }
  if (name === "get_pending_leave_summary") return { pendingRequests: await Leave.countDocuments({ status: "pending", ...(req.userRole === "manager" ? { approver: req.user._id } : {}) }) };
  const query = String(args.query || "").trim();
  if (!query || query.length > 80) return { error: "Provide a search phrase of up to 80 characters." };
  const matcher = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const people = await Employee.find({ isActive: true, $or: [{ fullName: matcher }, { employeeId: matcher }, { department: matcher }, { designation: matcher }] }).select("fullName employeeId department designation employmentStatus").limit(10).lean();
  return { employees: people.map((item) => ({ name: item.fullName, employeeId: item.employeeId, department: item.department, designation: item.designation, status: item.employmentStatus })) };
}

definitions.find(item => item.name === "get_my_attendance").parameters.properties.period = { type: "string", enum: ["today", "month"] };
module.exports = { definitions, runTool, employeeForUser };
