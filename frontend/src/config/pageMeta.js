const pageMeta = [
  { match: /^\/dashboard$/, title: "Home", crumbs: [] },
  { match: /^\/dashboard\/employees$/, title: "Employee List", crumbs: [{ label: "Employees", to: "/dashboard/employees" }] },
  { match: /^\/dashboard\/(add|edit)-employee/, title: "Employee", crumbs: [{ label: "Employees", to: "/dashboard/employees" }] },
  { match: /^\/dashboard\/employee\//, title: "Employee Details", crumbs: [{ label: "Employees", to: "/dashboard/employees" }] },
  { match: /^\/dashboard\/departments$/, title: "Departments", crumbs: [] },
  { match: /^\/dashboard\/add-department/, title: "Department", crumbs: [{ label: "Departments", to: "/dashboard/departments" }] },
  { match: /^\/dashboard\/projects$/, title: "Projects", crumbs: [] },
  { match: /^\/dashboard\/add-project/, title: "Project", crumbs: [{ label: "Projects", to: "/dashboard/projects" }] },
  { match: /^\/dashboard\/attendance$/, title: "Attendance", crumbs: [] },
  { match: /^\/dashboard\/payroll$/, title: "Payroll", crumbs: [] },
  { match: /^\/dashboard\/admin(?:\/users)?$/, title: "Admin Users", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/roles$/, title: "Admin Roles", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/rbac$/, title: "Access", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/organization$/, title: "Organization", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/admin\/settings$/, title: "Settings", crumbs: [{ label: "Admin", to: "/dashboard/admin" }] },
  { match: /^\/dashboard\/settings$/, title: "Settings", crumbs: [] },
];

export const getPageMeta = (pathname) => pageMeta.find((item) => item.match.test(pathname)) || {
  title: pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard",
  crumbs: [],
};
