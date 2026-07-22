import React from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  BeachAccess as LeaveIcon,
  Devices as AssetIcon,
  Receipt as ExpenseIcon,
  School as TrainingIcon,
  TrendingUp as PerformanceIcon,
  Flag as GoalIcon,
  AdminPanelSettings as AdminIcon,
  Assessment as ReportIcon,
  History as AuditIcon,
  Schedule as ShiftIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../comps/logo";
import useAuthStore from "../../strore/authStore";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ open }) => ({
  width: open ? drawerWidth : 72,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : 72,
    overflowX: "hidden",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: "linear-gradient(180deg, #0f172a 0%, #1a1040 100%)",
    color: "#fff",
    borderRight: "1px solid rgba(139,92,246,0.15)",
    boxShadow: "4px 0 20px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
  },
}));

const ALL_MENU = [
  {
    text: "Dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
    roles: ["superadmin", "admin", "hr", "manager", "employee"],
  },
  {
    text: "Employees",
    icon: PeopleIcon,
    path: "/dashboard/employees",
    roles: ["superadmin", "admin", "hr", "manager"],
  },
  {
    text: "Departments",
    icon: BusinessIcon,
    path: "/dashboard/departments",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Projects",
    icon: WorkIcon,
    path: "/dashboard/projects",
    roles: ["superadmin", "admin", "hr", "manager", "employee"],
  },
  {
    text: "Attendance",
    icon: EventIcon,
    path: "/dashboard/attendance",
    roles: ["superadmin", "admin", "hr", "manager", "employee"],
  },
  {
    text: "Leave",
    icon: LeaveIcon,
    path: "/dashboard/leave",
    roles: ["superadmin", "admin", "hr", "manager", "employee"],
  },
  {
    text: "Payroll",
    icon: PaymentIcon,
    path: "/dashboard/payroll",
    roles: ["superadmin", "admin", "hr", "employee"],
  },
  {
    text: "Assets",
    icon: AssetIcon,
    path: "/dashboard/assets",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Expenses",
    icon: ExpenseIcon,
    path: "/dashboard/expenses",
    roles: ["superadmin", "admin", "hr", "manager", "employee"],
  },
  {
    text: "Onboarding",
    icon: WorkIcon,
    path: "/dashboard/onboarding",
    roles: ["superadmin", "admin", "hr", "manager"],
  },
  {
    text: "Training",
    icon: TrainingIcon,
    path: "/dashboard/training",
    roles: ["superadmin", "admin", "hr", "manager"],
  },
  {
    text: "Performance",
    icon: PerformanceIcon,
    path: "/dashboard/performance",
    roles: ["superadmin", "admin", "hr", "manager"],
  },
  {
    text: "Goals",
    icon: GoalIcon,
    path: "/dashboard/goals",
    roles: ["superadmin", "admin", "hr", "manager", "employee"],
  },
  {
    text: "Branches",
    icon: BusinessIcon,
    path: "/dashboard/enterprise/branches",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Shifts",
    icon: ShiftIcon,
    path: "/dashboard/enterprise/shifts",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Leave Policies",
    icon: LeaveIcon,
    path: "/dashboard/enterprise/leave-policies",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Reports",
    icon: ReportIcon,
    path: "/dashboard/reports",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Audit Logs",
    icon: AuditIcon,
    path: "/dashboard/audit-logs",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Admin Users",
    icon: AdminIcon,
    path: "/dashboard/admin/users",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Admin Roles",
    icon: AdminIcon,
    path: "/dashboard/admin/roles",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Organization",
    icon: BusinessIcon,
    path: "/dashboard/admin/organization",
    roles: ["superadmin", "admin", "hr"],
  },
  {
    text: "Settings",
    icon: SettingsIcon,
    path: "/dashboard/settings",
    roles: ["superadmin", "admin"],
  },
];

const ROLE_COLORS = {
  admin: "#ef4444",
  superadmin: "#f43f5e",
  hr: "#f59e0b",
  manager: "#3b82f6",
  employee: "#10b981",
};

export default function Sidebar({ open, variant = "permanent", onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const role = user?.role || "employee";
  const expanded = variant === "temporary" ? true : open;

  const menuItems = ALL_MENU.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          overflow: "hidden",
        },
      }}
    >
      {/* LOGO - sticky, does not scroll */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          flexShrink: 0,
          background: "linear-gradient(180deg, #0f172a 0%, #1a1040 100%)",
        }}
      >
        <Box
          sx={{
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: expanded ? "flex-start" : "center",
            p: 1.9,
          }}
        >
          <Logo open={expanded} />
        </Box>
        <Divider sx={{ borderColor: "rgba(139,92,246,0.2)" }} />
      </Box>

      {/* SCROLLABLE CONTENT */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": { width: 2 },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(179, 177, 182, 0.29)",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* User Info */}
        {expanded && user && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#8b5cf6",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                {user.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography fontSize={13} fontWeight={600} color="#fff" noWrap>
                  {user.name}
                </Typography>
                <Chip
                  label={role.toUpperCase()}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: 9,
                    fontWeight: "bold",
                    bgcolor: ROLE_COLORS[role] + "22",
                    color: ROLE_COLORS[role],
                    border: `1px solid ${ROLE_COLORS[role]}44`,
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {expanded && <Divider sx={{ borderColor: "rgba(139,92,246,0.1)" }} />}

        {/* MENU */}
        <List sx={{ px: 1, pt: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));

            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
                <Tooltip title={!expanded ? item.text : ""} placement="right">
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      if (variant === "temporary") onClose?.();
                    }}
                    sx={{
                      borderRadius: "10px",
                      minHeight: 44,
                      justifyContent: expanded ? "initial" : "center",
                      px: expanded ? 1.5 : 1,
                      background: isActive
                        ? "linear-gradient(90deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(139,92,246,0.3)"
                        : "1px solid transparent",
                      "&:hover": {
                        background:
                          "linear-gradient(90deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1))",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "#a78bfa" : "#94a3b8",
                        minWidth: 0,
                        mr: expanded ? 1.5 : 0,
                        justifyContent: "center",
                      }}
                    >
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    {expanded && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "#e2e8f0" : "#94a3b8",
                        }}
                      />
                    )}
                    {isActive && expanded && (
                      <Box
                        sx={{
                          width: 4,
                          height: 20,
                          borderRadius: 2,
                          bgcolor: "#8b5cf6",
                          ml: "auto",
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider sx={{ borderColor: "rgba(139,92,246,0.1)", mx: 2 }} />

        {/* LOGOUT */}
        <List sx={{ px: 1, pb: 1 }}>
          <ListItem disablePadding>
            <Tooltip title={!expanded ? "Logout" : ""} placement="right">
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: "10px",
                  minHeight: 44,
                  justifyContent: expanded ? "initial" : "center",
                  px: expanded ? 1.5 : 1,
                  "&:hover": {
                    background: "rgba(239,68,68,0.15)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "#f87171",
                    minWidth: 0,
                    mr: expanded ? 1.5 : 0,
                    justifyContent: "center",
                  }}
                >
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                {expanded && (
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{ fontSize: 13, color: "#f87171" }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
