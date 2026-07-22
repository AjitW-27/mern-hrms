export const employeeConfig = {
  title: "Employees",
  endpoint: "/employees",
  description: "Manage employee master records, work location, status, and payroll linkage.",
  columns: [
    { field: "employeeId", headerName: "Employee ID" },
    { field: "fullName", headerName: "Full Name" },
    { field: "department", headerName: "Department" },
    { field: "designation", headerName: "Designation" },
    { field: "status", headerName: "Status" }
  ],
  fields: [
    { name: "fullName", label: "Full Name", required: true, md: 6 },
    { name: "email", label: "Email", type: "email", required: true, md: 6 },
    { name: "mobileNo", label: "Mobile No", required: true, md: 6 },
    { name: "department", label: "Department", md: 6 },
    { name: "designation", label: "Designation", md: 6 },
    { name: "role", label: "Role", md: 6, options: ["employee", "manager", "hr", "admin"] },
    { name: "workLocation", label: "Work Location", md: 6, options: ["Office", "Remote", "Hybrid"] },
    { name: "employmentType", label: "Employment Type", md: 6, options: ["Full-time", "Part-time", "Contract", "Intern"] },
    { name: "status", label: "Status", md: 6, options: ["Active", "Onboarding", "On Leave", "Resigned", "Terminated"] },
    { name: "biometricId", label: "Biometric ID", md: 6 },
    { name: "salary", label: "Salary", type: "number", md: 6 },
    { name: "reportingManager", label: "Reporting Manager", md: 6 },
    { name: "address", label: "Address", multiline: true, rows: 3, md: 12 },
    { name: "emergencyContact", label: "Emergency Contact", md: 6 }
  ]
};

export const departmentConfig = {
  title: "Departments",
  endpoint: "/departments",
  description: "Organize teams with departmental ownership and structured reporting.",
  columns: [
    { field: "code", headerName: "Code" },
    { field: "name", headerName: "Department" },
    { field: "manager", headerName: "Manager" },
    { field: "status", headerName: "Status" }
  ],
  fields: [
    { name: "name", label: "Department Name", required: true, md: 6 },
    { name: "code", label: "Code", required: true, md: 6 },
    { name: "manager", label: "Manager", md: 6 },
    { name: "status", label: "Status", md: 6, options: ["Active", "Inactive"] },
    { name: "description", label: "Description", multiline: true, rows: 4, md: 12 }
  ]
};

export const projectConfig = {
  title: "Projects",
  endpoint: "/projects",
  description: "Enterprise project command center for delivery ownership, budget, milestones, and risk.",
  columns: [
    { field: "code", headerName: "Code", bold: true },
    { field: "name", headerName: "Project Name" },
    { field: "client", headerName: "Client" },
    { field: "owner", headerName: "Owner" },
    { field: "priority", headerName: "Priority" },
    { field: "status", headerName: "Status" },
    { field: "progress", headerName: "Progress", type: "progress" },
    { field: "endDate", headerName: "Deadline", type: "date" },
    { field: "budget", headerName: "Budget", type: "money" }
  ],
  metrics: [
    { label: "Total Projects", tone: "#38bdf8", compute: (rows) => rows.length },
    { label: "In Delivery", tone: "#22c55e", compute: (rows) => rows.filter((row) => /active|progress/i.test(row.status || "")).length },
    { label: "At Risk", tone: "#ef4444", compute: (rows) => rows.filter((row) => /critical|hold|blocked|delayed/i.test(`${row.priority || ""} ${row.status || ""}`)).length }
  ],
  filters: [
    { field: "status", label: "Status", options: ["Planned", "Active", "In Progress", "On Hold", "Completed", "Delayed"] },
    { field: "priority", label: "Priority", options: ["Low", "Medium", "High", "Critical"] }
  ],
  fields: [
    { name: "code", label: "Project Code", md: 4, placeholder: "PRJ-001" },
    { name: "name", label: "Project Name", required: true, md: 6 },
    { name: "client", label: "Client / Account", md: 6 },
    { name: "owner", label: "Delivery Owner", md: 6 },
    { name: "status", label: "Status", md: 4, options: ["Planned", "Active", "In Progress", "On Hold", "Completed", "Delayed"] },
    { name: "priority", label: "Priority", md: 4, options: ["Low", "Medium", "High", "Critical"] },
    { name: "methodology", label: "Methodology", md: 4, options: ["Agile", "Scrum", "Kanban", "Waterfall", "Hybrid"] },
    { name: "startDate", label: "Start Date", type: "date", md: 4 },
    { name: "endDate", label: "Target Delivery Date", type: "date", md: 4 },
    { name: "progress", label: "Progress %", type: "number", md: 4 },
    { name: "budget", label: "Budget", type: "number", md: 4 },
    { name: "spent", label: "Spent", type: "number", md: 4 },
    { name: "billingType", label: "Billing Type", md: 4, options: ["Fixed Bid", "Time & Material", "Retainer", "Internal"] },
    { name: "members", label: "Team Members", type: "array", md: 12, placeholder: "Comma separated names" },
    { name: "milestones", label: "Milestones", type: "array", md: 12, placeholder: "Discovery, Design Signoff, UAT, Go Live" },
    { name: "risks", label: "Risks / Blockers", multiline: true, rows: 3, md: 12 },
    { name: "description", label: "Description", multiline: true, rows: 4, md: 12 }
  ]
};

export const attendanceConfig = {
  title: "Attendance",
  endpoint: "/attendance",
  description: "Record biometric, mobile, and manual attendance punches.",
  columns: [
    { field: "employeeName", headerName: "Employee" },
    { field: "date", headerName: "Date" },
    { field: "checkIn", headerName: "Check In" },
    { field: "checkOut", headerName: "Check Out" },
    { field: "source", headerName: "Source" },
    { field: "status", headerName: "Status" }
  ],
  fields: [
    { name: "employee", label: "Employee", required: true, md: 6, optionsEndpoint: "/employees", optionValueKey: "_id", optionLabelKey: "fullName", optionSecondaryKey: "employeeId" },
    { name: "date", label: "Date", type: "date", required: true, md: 6 },
    { name: "checkIn", label: "Check In", md: 6 },
    { name: "checkOut", label: "Check Out", md: 6 },
    { name: "source", label: "Source", md: 6, options: ["Biometric", "Manual", "Mobile"] },
    { name: "status", label: "Status", md: 6, options: ["Present", "Absent", "Half Day", "Leave", "Holiday"] },
    { name: "biometricId", label: "Biometric ID", md: 6 },
    { name: "notes", label: "Notes", multiline: true, rows: 3, md: 12 }
  ]
};

export const payrollConfig = {
  title: "Payroll",
  endpoint: "/payroll",
  description: "Run payroll cycles, review approvals, deductions, net pay, and payment status.",
  columns: [
    { field: "employeeName", headerName: "Employee", valueGetter: (row) => row.employee?.fullName || row.employeeId?.fullName || row.employeeName || "-" },
    { field: "payPeriod", headerName: "Pay Period", valueGetter: (row) => row.payPeriod || `${row.month || "-"} / ${row.year || "-"}` },
    { field: "grossSalary", headerName: "Gross", type: "money", valueGetter: (row) => row.grossSalary ?? row.grossPay },
    { field: "totalDeductions", headerName: "Deductions", type: "money", valueGetter: (row) => row.totalDeductions ?? row.deductions },
    { field: "netSalary", headerName: "Net", type: "money", valueGetter: (row) => row.netSalary ?? row.netPay },
    { field: "status", headerName: "Status" }
  ],
  metrics: [
    { label: "Payroll Records", tone: "#38bdf8", compute: (rows) => rows.length },
    { label: "Approved / Paid", tone: "#22c55e", compute: (rows) => rows.filter((row) => /approved|paid/i.test(row.status || "")).length },
    { label: "Pending Review", tone: "#f59e0b", compute: (rows) => rows.filter((row) => /pending|draft/i.test(row.status || "")).length }
  ],
  filters: [{ field: "status", label: "Status", options: ["Draft", "Pending", "Approved", "Processed", "Paid"] }],
  fields: [
    { name: "employee", label: "Employee", required: true, md: 6, optionsEndpoint: "/employees", optionValueKey: "_id", optionLabelKey: "fullName", optionSecondaryKey: "employeeId" },
    { name: "month", label: "Month", required: true, md: 4, options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] },
    { name: "year", label: "Year", type: "number", required: true, md: 4 },
    { name: "basicSalary", label: "Basic Salary", type: "number", md: 4 },
    { name: "grossSalary", label: "Gross Salary", type: "number", md: 4 },
    { name: "allowances", label: "Allowances", type: "number", md: 4 },
    { name: "totalDeductions", label: "Deductions", type: "number", md: 4 },
    { name: "bonus", label: "Bonus", type: "number", md: 4 },
    { name: "netSalary", label: "Net Pay", type: "number", md: 4 },
    { name: "paymentMode", label: "Payment Mode", md: 4, options: ["Bank Transfer", "UPI", "Cheque", "Cash"] },
    { name: "status", label: "Status", md: 4, options: ["Draft", "Pending", "Approved", "Processed", "Paid"] },
    { name: "remarks", label: "Remarks", multiline: true, rows: 3, md: 12 }
  ]
};

export const onboardingConfig = {
  title: "Onboarding",
  endpoint: "/onboarding",
  description: "Track employee onboarding checklists, IT setup, and probation progression.",
  columns: [
    { field: "employeeName", headerName: "Employee" },
    { field: "templateName", headerName: "Template" },
    { field: "stage", headerName: "Stage" },
    { field: "owner", headerName: "Owner" }
  ],
  fields: [
    { name: "employee", label: "Employee", required: true, md: 6, optionsEndpoint: "/employees", optionValueKey: "_id", optionLabelKey: "fullName", optionSecondaryKey: "employeeId" },
    { name: "templateName", label: "Template Name", required: true, md: 6 },
    { name: "stage", label: "Stage", md: 6, options: ["Offer", "Documentation", "IT Setup", "Orientation", "Probation", "Completed"] },
    { name: "owner", label: "Owner", md: 6 },
    { name: "notes", label: "Notes", multiline: true, rows: 4, md: 12 }
  ]
};

export const trainingConfig = {
  title: "Training",
  endpoint: "/training",
  description: "Schedule learning programs, monitor completion, and track participation.",
  columns: [
    { field: "title", headerName: "Title" },
    { field: "category", headerName: "Category" },
    { field: "mode", headerName: "Mode" },
    { field: "completion", headerName: "Completion" }
  ],
  fields: [
    { name: "title", label: "Title", required: true, md: 6 },
    { name: "category", label: "Category", md: 6 },
    { name: "mode", label: "Mode", md: 6, options: ["Online", "Offline", "Hybrid"] },
    { name: "instructor", label: "Instructor", md: 6 },
    { name: "startDate", label: "Start Date", type: "date", md: 6 },
    { name: "endDate", label: "End Date", type: "date", md: 6 },
    { name: "status", label: "Status", md: 6, options: ["Planned", "Ongoing", "Completed"] },
    { name: "completion", label: "Completion %", type: "number", md: 6 },
    { name: "participants", label: "Participants", md: 12, placeholder: "Comma separated names" },
    { name: "notes", label: "Notes", multiline: true, rows: 4, md: 12 }
  ]
};

export const performanceConfig = {
  title: "Performance",
  endpoint: "/performance",
  description: "Manage appraisal cycles, calibration, reviewer feedback, and performance outcomes.",
  columns: [
    { field: "employeeName", headerName: "Employee" },
    { field: "cycle", headerName: "Cycle" },
    { field: "reviewer", headerName: "Reviewer" },
    { field: "score", headerName: "Score" },
    { field: "rating", headerName: "Rating" },
    { field: "status", headerName: "Status" }
  ],
  metrics: [
    { label: "Reviews", tone: "#38bdf8", compute: (rows) => rows.length },
    { label: "Closed", tone: "#22c55e", compute: (rows) => rows.filter((row) => /closed|reviewed/i.test(row.status || "")).length },
    { label: "Pending", tone: "#f59e0b", compute: (rows) => rows.filter((row) => /draft|pending/i.test(row.status || "")).length }
  ],
  filters: [{ field: "status", label: "Status", options: ["Draft", "Pending Review", "Reviewed", "Closed"] }],
  fields: [
    { name: "employee", label: "Employee", required: true, md: 6, optionsEndpoint: "/employees", optionValueKey: "_id", optionLabelKey: "fullName", optionSecondaryKey: "employeeId" },
    { name: "cycle", label: "Cycle", required: true, md: 6 },
    { name: "reviewer", label: "Reviewer", md: 6 },
    { name: "score", label: "Score / 5", type: "number", md: 3 },
    { name: "rating", label: "Rating", md: 3, options: ["Outstanding", "Exceeds", "Meets", "Developing", "Needs Improvement"] },
    { name: "potential", label: "Potential", md: 6, options: ["High", "Medium", "Low"] },
    { name: "status", label: "Status", md: 6, options: ["Draft", "Pending Review", "Reviewed", "Closed"] },
    { name: "strengths", label: "Strengths", multiline: true, rows: 3, md: 6 },
    { name: "improvements", label: "Improvement Areas", multiline: true, rows: 3, md: 6 },
    { name: "summary", label: "Summary", multiline: true, rows: 3, md: 12 },
    { name: "feedback", label: "Feedback", multiline: true, rows: 3, md: 12 }
  ]
};

export const goalConfig = {
  title: "Goals",
  endpoint: "/goals",
  description: "Set OKRs, KRAs, measurable targets, ownership, and progress checkpoints.",
  columns: [
    { field: "title", headerName: "Goal" },
    { field: "type", headerName: "Type" },
    { field: "owner", headerName: "Owner" },
    { field: "priority", headerName: "Priority" },
    { field: "progress", headerName: "Progress", type: "progress" },
    { field: "status", headerName: "Status" },
    { field: "dueDate", headerName: "Due Date", type: "date" }
  ],
  metrics: [
    { label: "Goals", tone: "#38bdf8", compute: (rows) => rows.length },
    { label: "Achieved", tone: "#22c55e", compute: (rows) => rows.filter((row) => /achieved|completed/i.test(row.status || "")).length },
    { label: "Blocked", tone: "#ef4444", compute: (rows) => rows.filter((row) => /blocked/i.test(row.status || "")).length }
  ],
  filters: [
    { field: "status", label: "Status", options: ["Not Started", "In Progress", "Achieved", "Blocked"] },
    { field: "type", label: "Type", options: ["OKR", "KRA", "Personal", "Team"] }
  ],
  fields: [
    { name: "employee", label: "Employee", required: true, md: 6, optionsEndpoint: "/employees", optionValueKey: "_id", optionLabelKey: "fullName", optionSecondaryKey: "employeeId" },
    { name: "title", label: "Goal Title", required: true, md: 6 },
    { name: "type", label: "Type", md: 6, options: ["OKR", "KRA", "Personal", "Team"] },
    { name: "owner", label: "Owner", md: 6 },
    { name: "priority", label: "Priority", md: 6, options: ["Low", "Medium", "High", "Critical"] },
    { name: "progress", label: "Progress %", type: "number", md: 6 },
    { name: "targetValue", label: "Target Value", md: 6 },
    { name: "currentValue", label: "Current Value", md: 6 },
    { name: "status", label: "Status", md: 6, options: ["Not Started", "In Progress", "Achieved", "Blocked"] },
    { name: "dueDate", label: "Due Date", type: "date", md: 6 },
    { name: "keyResults", label: "Key Results", type: "array", md: 12, placeholder: "KR1, KR2, KR3" },
    { name: "description", label: "Description", multiline: true, rows: 4, md: 12 }
  ]
};

export const assetConfig = {
  title: "Assets",
  endpoint: "/assets",
  description: "Track lifecycle, assignment, warranty, ownership, and service status of company assets.",
  columns: [
    { field: "assetName", headerName: "Asset" },
    { field: "assetId", headerName: "Asset ID" },
    { field: "category", headerName: "Category" },
    { field: "type", headerName: "Type" },
    { field: "assignedEmployee", headerName: "Assigned To" },
    { field: "condition", headerName: "Condition" },
    { field: "status", headerName: "Status" }
  ],
  metrics: [
    { label: "Total Assets", tone: "#38bdf8", compute: (rows) => rows.length },
    { label: "Assigned", tone: "#22c55e", compute: (rows) => rows.filter((row) => /assigned/i.test(row.status || "") || row.assignedTo).length },
    { label: "Maintenance", tone: "#f59e0b", compute: (rows) => rows.filter((row) => /maintenance|repair/i.test(row.status || "")).length }
  ],
  filters: [
    { field: "status", label: "Status", options: ["Available", "Assigned", "Under Maintenance", "Retired"] },
    { field: "category", label: "Category", options: ["IT", "Non-IT", "Furniture", "Vehicle", "Facility"] }
  ],
  fields: [
    { name: "assetName", label: "Asset Name", required: true, md: 6 },
    { name: "assetId", label: "Asset ID / Serial No", required: true, md: 6 },
    { name: "category", label: "Category", md: 6, options: ["IT", "Non-IT", "Furniture", "Vehicle", "Facility"] },
    { name: "type", label: "Type", required: true, md: 6, options: ["Serialized", "Consumable"] },
    { name: "brand", label: "Brand", md: 6 },
    { name: "model", label: "Model", md: 6 },
    { name: "condition", label: "Condition", md: 6, options: ["New", "Good", "Fair", "Poor"] },
    { name: "ownership", label: "Ownership", md: 6, options: ["Company Owned", "Leased/Rented"] },
    { name: "assignedTo", label: "Assigned To", md: 6, optionsEndpoint: "/employees", optionValueKey: "_id", optionLabelKey: "fullName", optionSecondaryKey: "employeeId" },
    { name: "purchaseDate", label: "Purchase Date", type: "date", md: 6 },
    { name: "warrantyTill", label: "Warranty Till", type: "date", md: 6 },
    { name: "location", label: "Location", md: 6 },
    { name: "status", label: "Status", md: 6, options: ["Available", "Assigned", "Under Maintenance", "Retired"] },
    { name: "notes", label: "Notes", multiline: true, rows: 3, md: 12 }
  ]
};

export const expenseConfig = {
  title: "Expenses",
  endpoint: "/expenses",
  description: "Manage reimbursement claims, receipts, categories, and approval workflow.",
  columns: [
    { field: "employeeName", headerName: "Employee", valueGetter: (row) => row.employee?.fullName || row.employee?.email || row.employeeName || "Me" },
    { field: "amount", headerName: "Amount", type: "money" },
    { field: "category", headerName: "Category" },
    { field: "reason", headerName: "Reason" },
    { field: "status", headerName: "Status" },
    { field: "createdAt", headerName: "Submitted", type: "date" }
  ],
  metrics: [
    { label: "Claims", tone: "#38bdf8", compute: (rows) => rows.length },
    { label: "Approved", tone: "#22c55e", compute: (rows) => rows.filter((row) => /approved|paid/i.test(row.status || "")).length },
    { label: "Pending", tone: "#f59e0b", compute: (rows) => rows.filter((row) => /pending/i.test(row.status || "")).length }
  ],
  filters: [
    { field: "status", label: "Status", options: ["Pending", "Approved", "Rejected", "Paid"] },
    { field: "category", label: "Category", options: ["Travel", "Food", "Office Supplies", "Internet", "Client Meeting", "Other"] }
  ],
  fields: [
    { name: "amount", label: "Amount", type: "number", required: true, md: 6 },
    { name: "category", label: "Category", md: 6, options: ["Travel", "Food", "Office Supplies", "Internet", "Client Meeting", "Other"] },
    { name: "billReceiptUrl", label: "Receipt URL", md: 12 },
    { name: "reason", label: "Business Reason", multiline: true, rows: 4, required: true, md: 12 },
    { name: "status", label: "Status", md: 6, options: ["Pending", "Approved", "Rejected", "Paid"], defaultValue: "Pending" }
  ]
};

export const branchConfig = {
  title: "Branches",
  endpoint: "/enterprise/branches",
  description: "Manage office branches and company locations.",
  columns: [
    { field: "name", headerName: "Branch" },
    { field: "code", headerName: "Code" },
    { field: "city", headerName: "City" },
    { field: "status", headerName: "Status" }
  ],
  fields: [
    { name: "name", label: "Branch Name", required: true, md: 6 },
    { name: "code", label: "Branch Code", md: 6 },
    { name: "city", label: "City", md: 6 },
    { name: "state", label: "State", md: 6 },
    { name: "country", label: "Country", md: 6 },
    { name: "status", label: "Status", md: 6, options: ["Active", "Inactive"] },
    { name: "address", label: "Address", multiline: true, rows: 3, md: 12 }
  ]
};

export const shiftConfig = {
  title: "Shifts",
  endpoint: "/enterprise/shifts",
  description: "Maintain attendance shift timings and work pattern rules.",
  columns: [
    { field: "name", headerName: "Shift" },
    { field: "startTime", headerName: "Start" },
    { field: "endTime", headerName: "End" },
    { field: "status", headerName: "Status" }
  ],
  fields: [
    { name: "name", label: "Shift Name", required: true, md: 6 },
    { name: "startTime", label: "Start Time", md: 6 },
    { name: "endTime", label: "End Time", md: 6 },
    { name: "graceMinutes", label: "Grace Minutes", type: "number", md: 6 },
    { name: "status", label: "Status", md: 6, options: ["Active", "Inactive"] },
    { name: "description", label: "Description", multiline: true, rows: 3, md: 12 }
  ]
};

export const leavePolicyConfig = {
  title: "Leave Policies",
  endpoint: "/enterprise/leave-policies",
  description: "Configure leave categories, annual quotas, carry-forward rules, and encashment.",
  columns: [
    { field: "name", headerName: "Policy" },
    { field: "leaveType", headerName: "Type" },
    { field: "annualQuota", headerName: "Annual Quota" },
    { field: "status", headerName: "Status" }
  ],
  fields: [
    { name: "name", label: "Policy Name", required: true, md: 6 },
    { name: "leaveType", label: "Leave Type", md: 6, options: ["Sick", "Casual", "Earned", "Unpaid", "Maternity", "Paternity"] },
    { name: "annualQuota", label: "Annual Quota", type: "number", md: 6 },
    { name: "carryForward", label: "Carry Forward", md: 6, options: ["Yes", "No"] },
    { name: "status", label: "Status", md: 6, options: ["Active", "Inactive"] },
    { name: "description", label: "Description", multiline: true, rows: 4, md: 12 }
  ]
};
