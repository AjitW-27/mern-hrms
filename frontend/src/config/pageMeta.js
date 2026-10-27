const pageMeta = [
  { match: /^\/dashboard$/, title: "Home", crumbs: [] },
  { match: /^\/dashboard\/employees$/, title: "Employees", crumbs: [] },
  { match: /^\/dashboard\/add-employee/, title: "Add Employee", crumbs: [{ label: "Employees", to: "/dashboard/employees" }] },
  { match: /^\/dashboard\/edit-employee/, title: "Edit Employee", crumbs: [{ label: "Employees", to: "/dashboard/employees" }] },
  { match: /^\/dashboard\/employee\//, title: "Employee Details", crumbs: [{ label: "Employees", to: "/dashboard/employees" }] },
  { match: /^\/dashboard\/departments$/, title: "Departments", crumbs: [] },
  { match: /^\/dashboard\/add-department/, title: "Add Department", crumbs: [{ label: "Departments", to: "/dashboard/departments" }] },
  { match: /^\/dashboard\/projects$/, title: "Projects", crumbs: [] },
  { match: /^\/dashboard\/add-project/, title: "Add Project", crumbs: [{ label: "Projects", to: "/dashboard/projects" }] },
  { match: /^\/dashboard\/attendance$/, title: "Attendance", crumbs: [] },
  { match: /^\/dashboard\/payroll$/, title: "Payroll", crumbs: [] },
  { match: /^\/dashboard\/leave$/, title: "Leave", crumbs: [] },
  { match: /^\/dashboard\/expenses$/, title: "Expenses", crumbs: [] },
  { match: /^\/dashboard\/goals$/, title: "Goals", crumbs: [] },
  { match: /^\/dashboard\/assets$/, title: "Assets", crumbs: [] },
  { match: /^\/dashboard\/onboarding$/, title: "Onboarding", crumbs: [] },
  { match: /^\/dashboard\/training$/, title: "Training", crumbs: [] },
  { match: /^\/dashboard\/performance$/, title: "Performance", crumbs: [] },
  { match: /^\/dashboard\/communication$/, title: "Communication", crumbs: [] },
  { match: /^\/dashboard\/enterprise\/branches$/, title: "Locations", crumbs: [{ label: "Enterprise", to: "/dashboard/enterprise/branches" }] },
  { match: /^\/dashboard\/enterprise\/shifts$/, title: "Shifts", crumbs: [{ label: "Enterprise", to: "/dashboard/enterprise/shifts" }] },
  { match: /^\/dashboard\/enterprise\/leave-policies$/, title: "Leave Policies", crumbs: [{ label: "Enterprise", to: "/dashboard/enterprise/leave-policies" }] },
  { match: /^\/dashboard\/reports$/, title: "Reports", crumbs: [] },
  { match: /^\/dashboard\/audit-logs$/, title: "Audit Logs", crumbs: [] },
  { match: /^\/dashboard\/settings$/, title: "Settings", crumbs: [] },
  { match: /^\/dashboard\/profile$/, title: "My Profile", crumbs: [] },
  { match: /^\/dashboard\/admin(?:\/overview)?$/, title: "Administration", crumbs: [] },
  { match: /^\/dashboard\/admin\/users$/, title: "Users", crumbs: [{ label: "Administration", to: "/dashboard/admin" }, { label: "People & Access", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/roles$/, title: "Roles", crumbs: [{ label: "Administration", to: "/dashboard/admin" }, { label: "People & Access", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/rbac$/, title: "Access", crumbs: [{ label: "Administration", to: "/dashboard/admin" }, { label: "People & Access", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/departments$/, title: "Departments", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/locations$/, title: "Locations", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/organization$/, title: "Organization", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/announcements$/, title: "Announcements", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/holidays$/, title: "Holidays", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/settings$/, title: "Settings", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
];

const subtitles = { Dashboard: "Your people and work at a glance", Employees: "Manage employee records and reporting relationships", Projects: "Plan, track and manage project delivery", Attendance: "Review daily attendance and working hours", Leave: "Manage leave balances, requests and approvals", Payroll: "Review payroll and payment status", Reports: "Explore authorized operational reports", Users: "Manage accounts and employee profile links", Settings: "Manage your workspace preferences" };
export const getPageMeta = pathname => {
  const item = pageMeta.find(item => item.match.test(pathname));
  const title = item?.title === "Home" ? "Dashboard" : item?.title || pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard";
  const trail = item?.crumbs || [];
  return { ...item, title, subtitle: subtitles[title] || "Manage " + title.toLowerCase() + " in your workspace", breadcrumb: [...(pathname === "/dashboard" ? [] : [{ label: "Dashboard", to: "/dashboard" }]), ...trail, { label: title }], crumbs: trail };
};
