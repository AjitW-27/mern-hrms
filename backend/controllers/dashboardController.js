const asyncHandler = require("../utils/asyncHandler");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const Payroll = require("../models/payrollModel");
const Project = require("../models/projectModel");
const Onboarding = require("../models/onboardingModel");
const Training = require("../models/trainingModel");
const Performance = require("../models/performanceModel");
const Goal = require("../models/goalModel");
const Department = require("../models/departmentModel");

const getSummary = asyncHandler(async (req, res) => {
  const [
    employees,
    departments,
    projects,
    attendance,
    payrolls,
    onboardings,
    trainings,
    performances,
    goals
  ] = await Promise.all([
    Employee.countDocuments(),
    Department.countDocuments(),
    Project.countDocuments(),
    Attendance.countDocuments(),
    Payroll.countDocuments(),
    Onboarding.countDocuments(),
    Training.countDocuments(),
    Performance.countDocuments(),
    Goal.countDocuments()
  ]);

  const latestEmployees = await Employee.find().sort({ createdAt: -1 }).limit(5);
  const latestProjects = await Project.find().sort({ createdAt: -1 }).limit(5);

  res.json({
    success: true,
    data: {
      cards: { employees, departments, projects, attendance, payrolls, onboardings, trainings, performances, goals },
      latestEmployees,
      latestProjects
    }
  });
});

module.exports = { getSummary };
