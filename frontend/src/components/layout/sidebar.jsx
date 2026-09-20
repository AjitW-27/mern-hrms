import React from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  DashboardOutlined,
  PeopleOutline,
  WorkOutline,
  EventOutlined,
  PaymentsOutlined,
  BeachAccessOutlined,
  DevicesOtherOutlined,
  ReceiptLongOutlined,
  SchoolOutlined,
  TrendingUpOutlined,
  FlagOutlined,
  AssessmentOutlined,
  HistoryOutlined,
  ScheduleOutlined,
  ForumOutlined,
  AdminPanelSettingsOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../comps/logo";
import useAuthStore from "../../strore/authStore";
import execReq from "../../lib/execReq";

const menu = [
  ["Dashboard", DashboardOutlined, "/dashboard", ["dashboard"]],
  ["Employees", PeopleOutline, "/dashboard/employees", ["employees"]],
  ["Projects", WorkOutline, "/dashboard/projects", ["projects"]],
  ["Attendance", EventOutlined, "/dashboard/attendance", ["attendance"]],
  ["Leave", BeachAccessOutlined, "/dashboard/leave", ["leave"]],
  ["Payroll", PaymentsOutlined, "/dashboard/payroll", ["payroll"]],
  ["Assets", DevicesOtherOutlined, "/dashboard/assets", ["assets"]],
  ["Expenses", ReceiptLongOutlined, "/dashboard/expenses", ["expenses"]],
  ["Onboarding", WorkOutline, "/dashboard/onboarding", ["onboarding"]],
  ["Training", SchoolOutlined, "/dashboard/training", ["training"]],
  [
    "Performance",
    TrendingUpOutlined,
    "/dashboard/performance",
    ["performance"],
  ],
  ["Goals", FlagOutlined, "/dashboard/goals", ["goals"]],
  // [
  //   "Communication",
  //   ForumOutlined,
  //   "/dashboard/communication",
  //   ["communication"],
  // ],
  // ["Admin", AdminPanelSettingsOutlined, "/dashboard/admin", ["users"]],
  ["Shifts", ScheduleOutlined, "/dashboard/enterprise/shifts", ["attendance"]],
  [
    "Leave Policies",
    BeachAccessOutlined,
    "/dashboard/enterprise/leave-policies",
    ["leave"],
  ],
  ["Reports", AssessmentOutlined, "/dashboard/reports", ["reports"]],
  ["Audit Logs", HistoryOutlined, "/dashboard/audit-logs", ["audit"]],
];

const Rail = ({ expanded, children, ...props }) => {
  const theme = useTheme();
  return (
    <Box
      {...props}
      sx={{
        position: "fixed",
        inset: "0 auto 0 0",
        width: expanded ? 240 : 72,
        zIndex: 1400,
        background: "#FFFFFF",
        borderRight: "1px solid #E2E8F0",
        transition: "width 180ms ease",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
        ...(expanded
          ? {
              boxShadow:
                "0 24px 44px -12px rgba(15,23,42,.22), 0 4px 16px -4px rgba(15,23,42,.08)",
            }
          : {}),
        [theme.breakpoints.down("md")]: { width: expanded ? 240 : 64 },
      }}
    >
      {children}
    </Box>
  );
};

export default function Sidebar({ open, onOpen, onClose, canHover = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [rbacEnabled, setRbacEnabled] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const sync = async () => {
      try {
        const cached = localStorage.getItem("hrms_rbac_enabled");
        if (cached !== null && mounted) setRbacEnabled(cached === "true");
        const { data } = await execReq("/settings");
        if (mounted) {
          setRbacEnabled(data?.data?.rbacEnabled === true);
          localStorage.setItem(
            "hrms_rbac_enabled",
            String(data?.data?.rbacEnabled === true),
          );
        }
      } catch {}
    };
    sync();
    window.addEventListener("hrms-rbac-updated", sync);
    return () => {
      mounted = false;
      window.removeEventListener("hrms-rbac-updated", sync);
    };
  }, []);

  const role = String(
    user?.role?.code || user?.role?.name || user?.role || "employee",
  ).toLowerCase();
  const hasRead = (module) =>
    !rbacEnabled ||
    ["admin", "superadmin", "super_admin"].includes(role) ||
    user?.rolePermissions?.[module]?.read === true;
  const items = menu.filter(([, , , modules]) => modules.some(hasRead));
  const expanded = open && canHover;

  const go = (path) => navigate(path);
  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path));
  const doLogout = () => {
    logout();
    localStorage.removeItem("hrms_token");
    sessionStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <Rail
      expanded={expanded}
      onMouseEnter={canHover ? onOpen : undefined}
      onMouseLeave={canHover ? onClose : undefined}
      aria-label="Primary navigation"
    >
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          px: expanded ? 2 : 1.25,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Logo open={expanded} />
      </Box>
      <Box
        sx={{ px: 1, pt: 1.5, overflowY: "auto", height: "calc(100vh - 64px)" }}
      >
        <List disablePadding>
          {items.map(([label, Icon, path]) => {
            const active = isActive(path);
            return (
              <ListItem key={label} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={expanded ? "" : label} placement="right">
                  <ListItemButton
                    onClick={() => go(path)}
                    sx={{
                      minHeight: 44,
                      borderRadius: 1,
                      px: expanded ? 1.25 : 1,
                      justifyContent: expanded ? "flex-start" : "center",
                      position: "relative",
                      bgcolor: active ? "#E6F7F8" : "transparent",
                      "&:hover": { bgcolor: "#F8FAFC" },
                      "&::before": active
                        ? {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: 8,
                            bottom: 8,
                            width: 3,
                            borderRadius: "0 999px 999px 0",
                            bgcolor: "#0E8F9A",
                          }
                        : {},
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: expanded ? 1.25 : 0,
                        justifyContent: "center",
                        color: active ? "#0E8F9A" : "#64748B",
                      }}
                    >
                      <Icon sx={{ fontSize: 20, strokeWidth: 1.75 }} />
                    </ListItemIcon>
                    {expanded && (
                      <ListItemText
                        primary={label}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: active ? "#0A5C67" : "#0F172A",
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ my: 1.5 }} />
        <Tooltip title={expanded ? "" : "Logout"} placement="right">
          <ListItemButton
            onClick={doLogout}
            sx={{
              minHeight: 44,
              borderRadius: 1,
              px: expanded ? 1.25 : 1,
              justifyContent: expanded ? "flex-start" : "center",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: expanded ? 1.25 : 0,
                justifyContent: "center",
                color: "#EF4444",
              }}
            >
              <LogoutOutlined sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {expanded && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#EF4444",
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
        {/* {expanded && (
          <Typography sx={{ px: 1.25, py: 2, fontSize: 12, color: "none" }}>
            {role.toUpperCase()}
          </Typography>
        )} */}
      </Box>
    </Rail>
  );
}
