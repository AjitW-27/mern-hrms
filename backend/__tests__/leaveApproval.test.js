const Leave = require("../models/leaveModule");
const Employee = require("../models/employeeModel");
const User = require("../models/userModel");
const { createNotification } = require("../utils/notificationHelper");
const { updateLeaveStatus } = require("../controllers/leaveController");

jest.mock("../utils/notificationHelper", () => ({
  createNotification: jest.fn().mockResolvedValue([]),
}));
jest.mock("../utils/emailService", () => ({
  sendEmail: jest.fn().mockResolvedValue({}),
}));

const mockResponse = () => {
  const res = { statusCode: 200, body: null };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((body) => {
    res.body = body;
    return res;
  });
  return res;
};

describe("Leave approval workflow and balance integrity", () => {
  let mockEmployee;
  let mockLeave;
  let mockIo;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Leave, "updateOne").mockResolvedValue({ modifiedCount: 1 });

    mockIo = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };

    mockEmployee = {
      _id: "emp_123",
      userId: "user_emp_123",
      fullName: "Jane Doe",
      email: "jane@example.com",
      leaveBalance: { sick: 10, casual: 10, earned: 15, unpaid: 0 },
    };

    mockLeave = {
      _id: "leave_999",
      employee: mockEmployee,
      leaveType: "casual",
      fromDate: new Date("2026-11-01"),
      toDate: new Date("2026-11-02"),
      totalDays: 2,
      isHalfDay: false,
      status: "pending",
      approver: "user_manager_456",
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    jest.spyOn(Leave, "findById").mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockLeave),
    });

    jest.spyOn(Employee, "findByIdAndUpdate").mockImplementation((id, update) => {
      if (update.$inc) {
        for (const [key, val] of Object.entries(update.$inc)) {
          if (key === "leaveBalance.casual") mockEmployee.leaveBalance.casual += val;
        }
      }
      return Promise.resolve(mockEmployee);
    });

    jest.spyOn(User, "findById").mockResolvedValue({
      _id: "user_emp_123",
      email: "jane@example.com",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("enforces authorization: unauthorized manager receives 403", async () => {
    const req = {
      params: { id: "leave_999" },
      body: { status: "approved" },
      user: { _id: "user_other_manager" },
      userRole: "manager",
      app: { get: () => mockIo },
    };
    const res = mockResponse();

    await updateLeaveStatus(req, res);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
    expect(Employee.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("enforces authorization: employee cannot approve own leave", async () => {
    const req = {
      params: { id: "leave_999" },
      body: { status: "approved" },
      user: { _id: "user_emp_123" },
      userRole: "employee",
      app: { get: () => mockIo },
    };
    const res = mockResponse();

    await updateLeaveStatus(req, res);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/cannot approve.*own/i);
    expect(Employee.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("assigned approver successfully approves and deducts balance exactly once", async () => {
    const req = {
      params: { id: "leave_999" },
      body: { status: "approved", comment: "Approved by manager" },
      user: { _id: "user_manager_456" },
      userRole: "manager",
      app: { get: () => mockIo },
    };
    const res = mockResponse();

    await updateLeaveStatus(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockLeave.status).toBe("approved");

    // Exactly one atomic deduction call with -2 days
    expect(Employee.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(Employee.findByIdAndUpdate).toHaveBeenCalledWith("emp_123", {
      $inc: { "leaveBalance.casual": -2 },
    });
    // Balance was 10, deducted 2 => 8
    expect(mockEmployee.leaveBalance.casual).toBe(8);

    // Notification created with Socket.IO instance
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: "user_emp_123",
        type: "leave",
        relatedId: "leave_999",
        io: mockIo,
      })
    );
  });

  test("retrying approval on an already approved leave returns 400 without double-deduction", async () => {
    mockLeave.status = "approved"; // already approved

    const req = {
      params: { id: "leave_999" },
      body: { status: "approved" },
      user: { _id: "user_manager_456" },
      userRole: "manager",
      app: { get: () => mockIo },
    };
    const res = mockResponse();

    await updateLeaveStatus(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already approved/i);
    // Balance deduction must not have been called
    expect(Employee.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("privileged role (HR/Admin) can override approval", async () => {
    const req = {
      params: { id: "leave_999" },
      body: { status: "approved" },
      user: { _id: "admin_user_001" },
      userRole: "hr",
      app: { get: () => mockIo },
    };
    const res = mockResponse();

    await updateLeaveStatus(req, res);
    expect(res.statusCode).toBe(200);
    expect(mockLeave.status).toBe("approved");
    expect(Employee.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });
  test("competing approval loses the database claim and does not deduct", async () => {
    Leave.updateOne.mockResolvedValueOnce({ modifiedCount: 0 });
    const res = mockResponse();
    await updateLeaveStatus({ params: { id: "leave_999" }, body: { status: "approved" }, user: { _id: "user_manager_456" }, userRole: "manager" }, res);
    expect(res.statusCode).toBe(409);
    expect(Employee.findByIdAndUpdate).not.toHaveBeenCalled();
  });
  test("reject persists decision timestamp and comment without deducting balance", async () => {
    const res = mockResponse();
    await updateLeaveStatus({ params: { id: "leave_999" }, body: { status: "rejected", comment: "Please reschedule" }, user: { _id: "user_manager_456" }, userRole: "manager", app: { get: () => mockIo } }, res);
    expect(res.statusCode).toBe(200);
    expect(mockLeave.approvedAt).toBeInstanceOf(Date);
    expect(mockLeave.comment).toBe("Please reschedule");
    expect(Employee.findByIdAndUpdate).not.toHaveBeenCalled();
  });
  test("rejects unsupported decision status without modifying leave", async () => {
    const res = mockResponse();
    await updateLeaveStatus({ body: { status: "cancelled" } }, res);
    expect(res.statusCode).toBe(400);
    expect(Leave.updateOne).not.toHaveBeenCalled();
  });

});
