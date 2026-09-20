const User = require("../models/userModel");
const Employee = require("../models/employeeModel");
const Leave = require("../models/leaveModule");
const Payroll = require("../models/payrollModel");
const { Conversation, Message } = require("../models/communicationModel");
const asyncHandler = require("../utils/asyncHandler");

const BOT_EMAIL = "hr-bot@hrms.local";

const ensureHrBotUser = async () => {
  let bot = await User.findOne({ email: BOT_EMAIL });
  if (bot) return bot;
  try {
    bot = await User.create({
      name: "HR Bot",
      email: BOT_EMAIL,
      password: `HRBot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      mobileNo: "0000000000",
      role: "system",
      isSystemBot: true,
      isActive: true,
    });
    return bot;
  } catch (error) {
    return User.findOne({ email: BOT_EMAIL });
  }
};

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const endOfToday = () => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
};

const formatMoney = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const getEmployeeForUser = async (userId) => Employee.findOne({ userId }).lean();

const getHrBotResponse = async (text, userId) => {
  const query = String(text || "").replace(/^@HR\s*Bot\b[:\s-]*/i, "").trim();
  const normalized = query.toLowerCase();

  if (/how many|remaining|balance|leave.*(left|available)|leaves?.*(left|available)/i.test(normalized)) {
    const employee = await getEmployeeForUser(userId);
    if (!employee) return "👋 I couldn't find your employee profile, so I can't calculate your leave balance yet.";
    return [
      "### 🗓️ Your Leave Balance",
      `- **Casual:** ${employee.leaveBalance?.casual ?? 0} day(s) remaining`,
      `- **Sick:** ${employee.leaveBalance?.sick ?? 0} day(s) remaining`,
      `- **Earned:** ${employee.leaveBalance?.earned ?? 0} day(s) remaining`,
      "",
      "These values come directly from your HRMS employee leave balance.",
    ].join("\n");
  }

  if (/(next|latest|current).*(salary|payslip)|payslip|salary.*(date|month)/i.test(normalized)) {
    const employee = await getEmployeeForUser(userId);
    if (!employee) return "💳 I couldn't find your employee profile, so I can't look up your payslip.";
    const payroll = await Payroll.findOne({ employeeId: employee._id })
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean();
    if (!payroll) return "💳 No generated payroll record was found for your employee profile.";
    const period = payroll.payPeriod || `${payroll.month}/${payroll.year}`;
    const date = payroll.paymentDate || payroll.updatedAt || payroll.createdAt;
    return [
      "### 💰 Latest Payslip",
      `- **Period:** ${period}`,
      `- **Net salary:** ${formatMoney(payroll.netSalary)}`,
      `- **Status:** ${payroll.status}`,
      `- **Generated/processed:** ${date ? new Date(date).toLocaleDateString("en-IN") : "—"}`,
    ].join("\n");
  }

  if (/who.*(on|taking).*(leave|holiday)|leave.*today|on leave today/i.test(normalized)) {
    const leaves = await Leave.find({
      status: "approved",
      fromDate: { $lte: endOfToday() },
      toDate: { $gte: startOfToday() },
    })
      .populate("employee", "fullName employeeId department designation")
      .sort({ "employee.fullName": 1 })
      .lean();

    if (!leaves.length) return "### 👥 Team Leave Today\n\n- No employees are on approved leave today.";
    return [
      "### 👥 Employees on Leave Today",
      ...leaves.map((leave) => `- **${leave.employee?.fullName || "Employee"}** — ${leave.leaveType || "leave"}${leave.employee?.department ? ` · ${leave.employee.department}` : ""}`),
    ].join("\n");
  }

  return [
    "### 🤖 HR Bot",
    "I can help with:",
    "- 🗓️ `How many leaves do I have?`",
    "- 💰 `When is my next salary / payslip?`",
    "- 👥 `Who is on leave today?`",
  ].join("\n");
};

const getHrBotProfile = asyncHandler(async (req, res) => {
  const bot = await ensureHrBotUser();
  res.json({ success: true, data: { _id: bot._id, name: bot.name, email: bot.email, role: bot.role, isSystemBot: true, avatar: bot.avatar || null } });
});

const handleHrBotMessage = asyncHandler(async (req, res) => {
  const text = String(req.body.text || "").trim();
  if (!text) return res.status(400).json({ success: false, message: "Message text is required." });
  const bot = await ensureHrBotUser();
  let conversation = null;

  if (req.body.conversationId) {
    conversation = await Conversation.findOne({ _id: req.body.conversationId, participants: req.user._id });
  }
  if (!conversation) {
    conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [req.user._id, bot._id] },
      $expr: { $eq: [{ $size: "$participants" }, 2] },
    });
  }
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, bot._id],
      type: "direct",
      title: "HR Bot",
      createdBy: req.user._id,
    });
  }

  const userMessage = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text,
    readBy: [req.user._id],
  });
  const answer = await getHrBotResponse(text, req.user._id);
  const botMessage = await Message.create({
    conversation: conversation._id,
    sender: bot._id,
    text: answer,
    readBy: [bot._id],
  });

  const lastMessageAt = new Date();
  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessageText: answer.slice(0, 240),
    lastMessageAt,
    lastMessageSender: bot._id,
  });

  const data = await Message.find({ _id: { $in: [userMessage._id, botMessage._id] } })
    .populate("sender", "name email role avatar")
    .sort({ createdAt: 1 })
    .lean();

  const io = req.app.get("io");
  if (io) {
    const conversationPayload = await Conversation.findById(conversation._id)
      .populate("participants", "name email role department avatar")
      .lean();
    for (const message of data) {
      io.to(`conversation_${conversation._id}`).emit("communication:message", { ...message, conversation: conversationPayload });
      for (const participantId of conversation.participants) {
        io.to(`user_${participantId}`).emit("communication:message", { ...message, conversation: conversationPayload });
      }
    }
  }

  res.status(201).json({ success: true, data: { conversationId: String(conversation._id), messages: data, answer } });
});

module.exports = { ensureHrBotUser, getHrBotResponse, getHrBotProfile, handleHrBotMessage };
