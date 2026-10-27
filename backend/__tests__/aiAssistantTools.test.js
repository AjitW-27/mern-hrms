jest.mock("../middleware/authMiddleware", () => ({ permit: jest.fn(() => async (req, res, next) => next()) }));
const { permit } = require("../middleware/authMiddleware");
const { runTool } = require("../services/aiAssistantTools");
const Employee = require("../models/employeeModel");
const Leave = require("../models/leaveModule");
afterEach(() => jest.restoreAllMocks());
test("read tools require an authenticated user", async () => {
  expect(await runTool({}, "get_my_profile")).toEqual({ error: "Authentication is required." });
});
test("module permission denial happens before accessing employee records", async () => {
  permit.mockImplementationOnce(() => async (req, res) => res.status(403).json({}));
  jest.spyOn(Employee, "findOne");
  expect(await runTool({ user: { _id: "self" } }, "get_my_profile")).toHaveProperty("error");
  expect(Employee.findOne).not.toHaveBeenCalled();
});
test("managers' pending approvals are scoped to their own account", async () => {
  jest.spyOn(Leave, "countDocuments").mockResolvedValue(2);
  expect(await runTool({ user: { _id: "manager" }, userRole: "manager" }, "get_pending_leave_summary")).toEqual({ pendingRequests: 2 });
  expect(Leave.countDocuments).toHaveBeenCalledWith({ status: "pending", approver: "manager" });
});
test("employees cannot query organization workforce information", async () => {
  jest.spyOn(Employee, "countDocuments");
  expect(await runTool({ user: { _id: "self" }, userRole: "employee" }, "get_workforce_summary")).toHaveProperty("error");
  expect(Employee.countDocuments).not.toHaveBeenCalled();
});
test("personal leave data is scoped to the linked employee", async () => {
  jest.spyOn(Employee, "findOne").mockReturnValue({ select: () => ({ lean: async () => ({ _id: "employee", leaveBalance: { casual: 5 } }) }) });
  jest.spyOn(Leave, "aggregate").mockResolvedValue([{ _id: "pending", count: 1 }]);
  expect(await runTool({ user: { _id: "self", email: "self@example.com" } }, "get_my_leave_summary")).toEqual({ leaveBalance: { casual: 5 }, requests: { pending: 1 } });
  expect(Leave.aggregate.mock.calls[0][0][0]).toEqual({ $match: { employee: "employee" } });
});

test("uses the explicit user employeeRef and never searches by an empty email", async () => {
  const ref = "0123456789abcdef01234567";
  jest.spyOn(Employee, "findOne").mockReturnValue({ select: () => ({ lean: async () => ({ _id: ref, fullName: "Linked profile" }) }) });
  const result = await runTool({ user: { _id: "self", employeeRef: ref }, userRole: "employee" }, "get_my_profile");
  expect(result.name).toBe("Linked profile");
  expect(Employee.findOne).toHaveBeenCalledWith({ $or: [{ _id: ref }, { userId: "self" }] });
});

test("unlinked normal employees receive an actionable HR message", async () => {
  jest.spyOn(Employee, "findOne").mockReturnValue({ select: () => ({ lean: async () => null }) });
  const result = await runTool({ user: { _id: "self" }, userRole: "employee" }, "get_my_leave_summary");
  expect(result.message).toBe("Your account is not linked to an employee profile. Please contact HR.");
});

test("unlinked admins are offered organization questions instead of a profile failure", async () => {
  jest.spyOn(Employee, "findOne").mockReturnValue({ select: () => ({ lean: async () => null }) });
  const result = await runTool({ user: { _id: "admin" }, userRole: "admin" }, "get_my_leave_summary");
  expect(result.message).toContain("Which employee?");
  expect(result.message).toContain("headcount by department");
});

test("payslip query is scoped to the authenticated employee and approved records", async () => {
  const Payroll = require("../models/payrollModel");
  jest.spyOn(Employee, "findOne").mockReturnValue({ select: () => ({ lean: async () => ({ _id: "own-employee" }) }) });
  jest.spyOn(Payroll, "findOne").mockReturnValue({ sort: () => ({ select: () => ({ lean: async () => ({ netSalary: 1500, status: "Paid" }) }) }) });
  const result = await runTool({ user: { _id: "self" }, userRole: "employee" }, "get_my_payslip");
  expect(result.payslip.netSalary).toBe(1500);
  expect(Payroll.findOne).toHaveBeenCalledWith({ employeeId: "own-employee", status: { $in: ["Approved", "Paid"] } });
});

test("employees cannot read organization birthdays or team leave", async () => {
  jest.spyOn(Employee, "find");
  expect(await runTool({ user: { _id: "self" }, userRole: "employee" }, "get_people_dates")).toHaveProperty("error");
  expect(await runTool({ user: { _id: "self" }, userRole: "employee" }, "get_team_on_leave")).toHaveProperty("error");
  expect(Employee.find).not.toHaveBeenCalled();
});
