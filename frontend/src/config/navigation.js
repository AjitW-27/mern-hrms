import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import ApartmentIcon from "@mui/icons-material/Apartment";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentsIcon from "@mui/icons-material/Payments";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FlagIcon from "@mui/icons-material/Flag";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

export const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon, roles: ["superadmin", "admin", "hr", "manager", "employee"] },
  { label: "Employees", path: "/dashboard/employees", icon: GroupIcon, roles: ["superadmin", "admin", "hr", "manager"] },
  { label: "Departments", path: "/dashboard/departments", icon: ApartmentIcon, roles: ["superadmin", "admin", "hr"] },
  { label: "Projects", path: "/dashboard/projects", icon: WorkIcon, roles: ["superadmin", "admin", "hr", "manager"] },
  { label: "Attendance", path: "/dashboard/attendance", icon: AccessTimeIcon, roles: ["superadmin", "admin", "hr", "manager", "employee"] },
  { label: "Payroll", path: "/dashboard/payroll", icon: PaymentsIcon, roles: ["superadmin", "admin", "hr"] },
  { label: "Onboarding", path: "/dashboard/onboarding", icon: BusinessCenterIcon, roles: ["superadmin", "admin", "hr", "manager"] },
  { label: "Training", path: "/dashboard/training", icon: SchoolIcon, roles: ["superadmin", "admin", "hr", "manager"] },
  { label: "Performance", path: "/dashboard/performance", icon: TrendingUpIcon, roles: ["superadmin", "admin", "hr", "manager"] },
  { label: "Goals", path: "/dashboard/goals", icon: FlagIcon, roles: ["superadmin", "admin", "hr", "manager", "employee"] },
  { label: "Admin Users", path: "/dashboard/admin/users", icon: ManageAccountsIcon, roles: ["superadmin", "admin", "hr"] },
  { label: "Admin Roles", path: "/dashboard/admin/roles", icon: AdminPanelSettingsIcon, roles: ["superadmin", "admin", "hr"] },
  { label: "Organization", path: "/dashboard/admin/organization", icon: ApartmentIcon, roles: ["superadmin", "admin", "hr"] }
];
