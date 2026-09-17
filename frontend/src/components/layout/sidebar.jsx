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
  Work as WorkIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  Logout as LogoutIcon,
  BeachAccess as LeaveIcon,
  Devices as AssetIcon,
  Receipt as ExpenseIcon,
  School as TrainingIcon,
  TrendingUp as PerformanceIcon,
  Flag as GoalIcon,
  Assessment as ReportIcon,
  History as AuditIcon,
  Schedule as ShiftIcon,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../comps/logo";
import useAuthStore from "../../strore/authStore";
import api from "../../lib/api";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ open, theme }) => ({
  width: open ? drawerWidth : 72,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",

  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : 72,
    overflowX: "hidden",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRight: `1px solid ${theme.palette.divider}`,
    boxShadow: "none",
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
];

/*
|--------------------------------------------------------------------------
| Normalize Role
|--------------------------------------------------------------------------
*/

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

/*
|--------------------------------------------------------------------------
| Sidebar
|--------------------------------------------------------------------------
*/

export default function Sidebar({ open, variant = "permanent", onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  /*
  |--------------------------------------------------------------------------
  | Zustand
  |--------------------------------------------------------------------------
  |
  | When Access.jsx updates setUser(), this component automatically
  | rerenders because it subscribes to user.
  |
  */

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const role = normalizeRole(user?.role || "employee");

  const expanded = variant === "temporary" ? true : open;

  /*
  |--------------------------------------------------------------------------
  | RBAC Enabled State
  |--------------------------------------------------------------------------
  |
  | First read cached value so the menu does not wait for API.
  |
  */

  const [rbacEnabled, setRbacEnabled] = React.useState(() => {
    try {
      const cached = localStorage.getItem("hrms_rbac_enabled");

      if (cached !== null) {
        return cached === "true";
      }
    } catch (error) {
      console.error("Failed to read RBAC state:", error);
    }

    return false;
  });

  /*
  |--------------------------------------------------------------------------
  | Load / Sync RBAC Settings
  |--------------------------------------------------------------------------
  */

  React.useEffect(() => {
    let mounted = true;

    const syncRbac = async () => {
      /*
      |--------------------------------------------------------------------------
      | Immediately use cached value
      |--------------------------------------------------------------------------
      */

      try {
        const cached = localStorage.getItem("hrms_rbac_enabled");

        if (mounted && cached !== null) {
          setRbacEnabled(cached === "true");
        }
      } catch (error) {
        console.error("Failed to read cached RBAC state:", error);
      }

      /*
      |--------------------------------------------------------------------------
      | Get latest value from backend
      |--------------------------------------------------------------------------
      */

      try {
        const { data } = await api.get("/settings");

        const enabled = data?.data?.rbacEnabled === true;

        if (!mounted) return;

        setRbacEnabled(enabled);

        localStorage.setItem("hrms_rbac_enabled", String(enabled));
      } catch (error) {
        console.error("Failed to load RBAC settings:", error);
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Listen for permission/RBAC changes
    |--------------------------------------------------------------------------
    |
    | Access.jsx dispatches:
    |
    | window.dispatchEvent(
    |   new CustomEvent("hrms-rbac-updated")
    | );
    |
    | This makes the sidebar update immediately.
    |
    */

    const handleRbacUpdated = () => {
      syncRbac();
    };

    window.addEventListener("hrms-rbac-updated", handleRbacUpdated);

    syncRbac();

    return () => {
      mounted = false;

      window.removeEventListener("hrms-rbac-updated", handleRbacUpdated);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Permission Module Resolver
  |--------------------------------------------------------------------------
  */

  const permissionModule = (path) => {
    if (path === "/dashboard") {
      return "dashboard";
    }

    if (path.includes("/employees")) {
      return "employees";
    }

    if (path.includes("/projects")) {
      return "projects";
    }

    if (path.includes("/attendance")) {
      return "attendance";
    }

    /*
    |--------------------------------------------------------------------------
    | Shifts
    |--------------------------------------------------------------------------
    |
    | Keep your existing mapping.
    |
    */

    if (path.includes("/shifts")) {
      return "attendance";
    }

    if (path.includes("/leave-policies")) {
      return "leave";
    }

    if (path.includes("/leave")) {
      return "leave";
    }

    if (path.includes("/payroll")) {
      return "payroll";
    }

    if (path.includes("/assets")) {
      return "assets";
    }

    if (path.includes("/expenses")) {
      return "expenses";
    }

    if (path.includes("/onboarding")) {
      return "onboarding";
    }

    if (path.includes("/training")) {
      return "training";
    }

    if (path.includes("/performance")) {
      return "performance";
    }

    if (path.includes("/goals")) {
      return "goals";
    }

    if (path.includes("/reports")) {
      return "reports";
    }

    if (path.includes("/audit-logs")) {
      return "audit";
    }

    return "dashboard";
  };

  /*
  |--------------------------------------------------------------------------
  | READ Permission Check
  |--------------------------------------------------------------------------
  */

  const hasReadPermission = (module) => {
    /*
    |--------------------------------------------------------------------------
    | RBAC disabled
    |--------------------------------------------------------------------------
    |
    | When RBAC is disabled, permissions should not control
    | the drawer. Existing role-based access remains.
    |
    */

    if (!rbacEnabled) {
      return true;
    }

    /*
    |--------------------------------------------------------------------------
    | RBAC enabled
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | Do NOT give SUPER_ADMIN automatic access here.
    |
    | The permission matrix controls the drawer.
    |
    | Example:
    |
    | dashboard.read = false
    |
    | => Dashboard is hidden.
    |
    */

    return user?.rolePermissions?.[module]?.read === true;
  };

  /*
  |--------------------------------------------------------------------------
  | Build Menu
  |--------------------------------------------------------------------------
  */

  const menuItems = ALL_MENU.filter((item) => {
    /*
    |--------------------------------------------------------------------------
    | RBAC Disabled
    |--------------------------------------------------------------------------
    |
    | Preserve your original role based behavior.
    |
    */

    if (!rbacEnabled) {
      return (
        item.roles.includes(role) ||
        role === "superadmin" ||
        role === "super_admin"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | RBAC Enabled
    |--------------------------------------------------------------------------
    |
    | READ permission decides whether menu appears.
    |
    */

    const module = permissionModule(item.path);

    return hasReadPermission(module);
  });

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    logout();

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    navigate("/");
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          overflow: "hidden",
        },
      }}
    >
      {/* LOGO */}

      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          flexShrink: 0,
          background: "background.paper",
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

        <Divider />
      </Box>

      {/* SCROLLABLE CONTENT */}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",

          "&::-webkit-scrollbar": {
            width: 2,
          },

          "&::-webkit-scrollbar-thumb": {
            background: "divider",
            borderRadius: 4,
          },

          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },

          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* USER INFO */}

        {expanded && user && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.main",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                {user.name?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Box>
                <Typography
                  fontSize={13}
                  fontWeight={600}
                  color="text.primary"
                  noWrap
                >
                  {user.name}
                </Typography>

                <Chip
                  label={role.toUpperCase()}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: 9,
                    fontWeight: "bold",
                    bgcolor: "primary.light",
                    color: "primary.dark",
                    border: "1px solid",
                    borderColor: "primary.light",
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {expanded && <Divider />}

        {/* MENU */}

        <List
          sx={{
            px: 1,
            pt: 1,
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));

            return (
              <ListItem
                key={item.text}
                disablePadding
                sx={{
                  mb: 0.3,
                }}
              >
                <Tooltip title={!expanded ? item.text : ""} placement="right">
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);

                      if (variant === "temporary") {
                        onClose?.();
                      }
                    }}
                    sx={{
                      borderRadius: "4px",
                      minHeight: 44,

                      justifyContent: expanded ? "initial" : "center",

                      px: expanded ? 1.5 : 1,

                      background: isActive
                        ? "linear-gradient(90deg, rgba(0, 255, 255, 0.10), rgba(0, 255, 255, 0.01))"
                        : "transparent",

                      border: isActive ? "1px solid" : "1px solid transparent",

                      borderColor: isActive ? "primary.light" : "transparent",

                      "&:hover": {
                        background: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "primary.main" : "text.secondary",

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
                          fontSize: 14,
                          fontWeight: 600,
                          color: isActive ? "primary.dark" : "text.primary",
                        }}
                      />
                    )}

                    {isActive && expanded && (
                      <Box
                        sx={{
                          width: 4,
                          height: 20,
                          borderRadius: 1,
                          bgcolor: "primary.main",
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

        <Box
          sx={{
            flexGrow: 1,
          }}
        />

        <Divider
          sx={{
            mx: 2,
          }}
        />

        {/* LOGOUT */}

        <List
          sx={{
            px: 1,
            pb: 1,
          }}
        >
          <ListItem disablePadding>
            <Tooltip title={!expanded ? "Logout" : ""} placement="right">
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: "4px",
                  minHeight: 44,

                  justifyContent: expanded ? "initial" : "center",

                  px: expanded ? 1.5 : 1,

                  "&:hover": {
                    background: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "error.main",
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
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "error.main",
                    }}
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
