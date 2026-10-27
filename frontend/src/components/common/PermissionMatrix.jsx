import React from "react";
import { Checkbox } from "@mui/material";
import DataTable from "./DataTable";
const moduleLabels = {
  dashboard: "Dashboard",
  employees: "Employees",
  departments: "Departments",
  projects: "Projects",
  attendance: "Attendance",
  leave: "Leave Management",
  payroll: "Payroll",
  assets: "Assets",
  expenses: "Expenses",
  recruitment: "Recruitment",
  onboarding: "Onboarding",
  training: "Training",
  performance: "Performance",
  goals: "Goals & KPI",
  users: "Users",
  roles: "Roles",
  organizations: "Organizations",
  notifications: "Notifications",
  settings: "System Settings",
  reports: "Reports",
  audit: "Audit Logs",
  communication: "Communication",
  announcements: "Announcements",
  holidays: "Holidays",
};
const actions = ["create", "read", "update", "delete", "approve", "export", "manage"];
export default function PermissionMatrix({ value = {}, onChange }) {
 const toggle = (module, action) => onChange({ ...value, [module]: { ...value[module], [action]: !value[module]?.[action] } });
 return <DataTable fill={false} toolbar={false} pagination={false} maxHeight={520} rows={Object.keys(moduleLabels).map(module => ({ id: module, module }))} columns={[{ field: "module", headerName: "Module", renderCell: row => moduleLabels[row.module] }, ...actions.map(action => ({ field: action, headerName: action, align: "center", minWidth: 85, renderCell: row => <Checkbox inputProps={{ "aria-label": moduleLabels[row.module] + " " + action }} checked={Boolean(value[row.module]?.[action])} onChange={() => toggle(row.module, action)} /> }))]} />;
}
