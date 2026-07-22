const ACTIONS = ["create", "read", "update", "delete", "approve", "export", "manage"];

const MODULES = [
  { key: "dashboard", label: "Dashboard", actions: ["read"] },
  { key: "employees", label: "Employees", actions: ACTIONS },
  { key: "departments", label: "Departments", actions: ACTIONS },
  { key: "projects", label: "Projects", actions: ACTIONS },
  { key: "attendance", label: "Attendance", actions: ACTIONS },
  { key: "leave", label: "Leave Management", actions: ACTIONS },
  { key: "payroll", label: "Payroll", actions: ACTIONS },
  { key: "assets", label: "Assets", actions: ACTIONS },
  { key: "expenses", label: "Expenses", actions: ACTIONS },
  { key: "recruitment", label: "Recruitment", actions: ACTIONS },
  { key: "onboarding", label: "Onboarding", actions: ACTIONS },
  { key: "training", label: "Training", actions: ACTIONS },
  { key: "performance", label: "Performance", actions: ACTIONS },
  { key: "goals", label: "Goals & KPI", actions: ACTIONS },
  { key: "users", label: "Users", actions: ACTIONS },
  { key: "roles", label: "Roles & Permissions", actions: ACTIONS },
  { key: "organizations", label: "Organizations", actions: ACTIONS },
  { key: "notifications", label: "Notifications", actions: ["read", "update", "manage"] },
  { key: "settings", label: "System Settings", actions: ["read", "update"] },
  { key: "reports", label: "Reports", actions: ["read", "export"] },
  { key: "audit", label: "Audit Logs", actions: ["read", "export"] }
];

const EMPTY_PERMISSION = { create: false, read: false, update: false, delete: false, approve: false, export: false, manage: false };

function accessFor(enabled = {}) {
  return ACTIONS.reduce((acc, action) => {
    acc[action] = Boolean(enabled[action]);
    return acc;
  }, { ...EMPTY_PERMISSION });
}

function createEmptyMatrix() {
  return MODULES.reduce((acc, module) => {
    acc[module.key] = accessFor({});
    return acc;
  }, {});
}

function buildAccess({ full = false, employee = false, manager = false, hr = false } = {}) {
  const deny = () => accessFor({});
  const allowAll = () => accessFor({
    create: true, read: true, update: true, delete: true, approve: true, export: true, manage: true
  });

  return MODULES.reduce((acc, module) => {
    const k = module.key;

    if (full) {
      acc[k] = allowAll();
      return acc;
    }

    if (k === "dashboard") {
      acc[k] = accessFor({ read: true });
      return acc;
    }

    if (k === "employees") {
      acc[k] = accessFor({
        create: hr || manager,
        read: true,
        update: hr || manager,
        delete: hr,
        approve: hr,
        export: hr
      });
      return acc;
    }

    if (k === "departments") {
      acc[k] = accessFor({
        create: hr,
        read: true,
        update: hr,
        delete: hr,
        approve: hr,
        export: hr
      });
      return acc;
    }

    if (k === "projects") {
      acc[k] = accessFor({
        create: hr || manager,
        read: true,
        update: hr || manager,
        delete: hr,
        approve: hr || manager,
        export: hr
      });
      return acc;
    }

    if (k === "attendance") {
      acc[k] = accessFor({
        create: true,
        read: true,
        update: hr || manager,
        delete: hr,
        approve: hr || manager,
        export: hr
      });
      return acc;
    }

    if (k === "leave") {
      acc[k] = accessFor({
        create: true,
        read: true,
        update: hr || manager,
        delete: hr,
        approve: hr || manager,
        export: hr
      });
      return acc;
    }

    if (k === "payroll") {
      acc[k] = accessFor({
        create: hr,
        read: employee || hr || manager,
        update: hr,
        delete: hr,
        approve: hr,
        export: hr
      });
      return acc;
    }

    if (["assets", "expenses", "recruitment", "onboarding", "training", "performance", "goals"].includes(k)) {
      acc[k] = accessFor({
        create: hr || manager || employee,
        read: true,
        update: hr || manager,
        delete: hr,
        approve: hr || manager,
        export: hr
      });
      return acc;
    }

    if (["users", "roles", "organizations", "notifications", "settings", "reports", "audit"].includes(k)) {
      acc[k] = accessFor({
        create: full || hr,
        read: true,
        update: full || hr,
        delete: full,
        approve: full || hr,
        export: full || hr,
        manage: full || hr
      });
      return acc;
    }

    acc[k] = deny();
    return acc;
  }, {});
}

function getDefaultRolePermissions(roleCode = "") {
  const normalized = String(roleCode || "").toLowerCase();

  if (["superadmin", "super_admin"].includes(normalized)) return buildAccess({ full: true });
  if (normalized === "admin") return buildAccess({ full: true });
  if (normalized === "hr") return buildAccess({ hr: true });
  if (normalized === "manager") return buildAccess({ manager: true });
  return buildAccess({ employee: true });
}

function flattenPermissions(matrix = {}) {
  const items = [];
  for (const [module, permissionSet] of Object.entries(matrix)) {
    for (const action of ACTIONS) {
      if (permissionSet?.[action]) items.push(`${module}:${action}`);
    }
  }
  return items;
}

module.exports = {
  ACTIONS,
  MODULES,
  EMPTY_PERMISSION,
  createEmptyMatrix,
  buildAccess,
  getDefaultRolePermissions,
  flattenPermissions
};
