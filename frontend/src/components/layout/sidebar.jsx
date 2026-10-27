import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { DashboardOutlined, PeopleOutline, WorkOutline, EventOutlined, PaymentsOutlined, BeachAccessOutlined, DevicesOtherOutlined, ReceiptLongOutlined, SchoolOutlined, TrendingUpOutlined, FlagOutlined, AssessmentOutlined, HistoryOutlined, ScheduleOutlined, ForumOutlined, AdminPanelSettingsOutlined, LogoutOutlined, ChevronRight, SettingsOutlined, BusinessOutlined } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { IconButton } from "../common/UI";
import Logo from "../comps/logo";
import useAuthStore from "../../strore/authStore";
import execReq from "../../lib/execReq";
import { colors, shadows } from "../../theme/designTokens";
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
  ["Departments", BusinessOutlined, "/dashboard/departments", ["departments"]],
  ["Administration", AdminPanelSettingsOutlined, "/dashboard/admin", ["users", "roles"]],
  ["Settings", SettingsOutlined, "/dashboard/settings", ["settings"]],
  ["Communication", ForumOutlined, "/dashboard/communication", ["communication"]],
];


const groups = { Dashboard: "MAIN MENU", Employees: "MAIN MENU", Departments: "MAIN MENU", Projects: "MAIN MENU", Attendance: "MAIN MENU", Leave: "MAIN MENU", Payroll: "MAIN MENU", Shifts: "LAYOUT", "Leave Policies": "LAYOUT", Assets: "CONTENT", Expenses: "CONTENT", Onboarding: "CONTENT", Training: "CONTENT", Performance: "CONTENT", Goals: "CONTENT", Reports: "PAGES", Administration: "PAGES", Communication: "PAGES", Settings: "WORKSPACE", "Audit Logs": "EXTRAS" };
const order = ["MAIN MENU", "LAYOUT", "CONTENT", "PAGES", "WORKSPACE", "EXTRAS"];
export default function Sidebar({ mobileOpen, onMobileClose }) {
  const mobile = useMediaQuery("(max-width:767px)"), navigate = useNavigate(), location = useLocation();
  const user = useAuthStore(state => state.user), logout = useAuthStore(state => state.logout);
  const [tooltip, setTooltip] = useState(null);
  const [expanded, setExpanded] = useState(false), [adminOpen, setAdminOpen] = useState(false), [rbacEnabled, setRbacEnabled] = useState(() => localStorage.getItem("hrms_rbac_enabled") === "true");
  const timer = useRef(null), hovering = useRef(false), keyboardFocus = useRef(false);
  const cancel = useCallback(() => { if (timer.current) clearTimeout(timer.current); }, []);
  const show = () => { cancel(); setExpanded(true); };
  const hide = () => { cancel(); timer.current = setTimeout(() => { if (!hovering.current && !keyboardFocus.current) { setExpanded(false); setAdminOpen(false); } }, 150); };
  useEffect(() => () => cancel(), [cancel]);
  useEffect(() => { onMobileClose(); setAdminOpen(false); setTooltip(null); }, [location.pathname, onMobileClose]);
  useEffect(() => { let live = true; const sync = () => execReq("/settings").then(({ data }) => { if (live) { const enabled = data?.data?.rbacEnabled === true; setRbacEnabled(enabled); localStorage.setItem("hrms_rbac_enabled", String(enabled)); } }).catch(() => {}); sync(); window.addEventListener("hrms-rbac-updated", sync); return () => { live = false; window.removeEventListener("hrms-rbac-updated", sync); }; }, []);
  const role = String(user?.role?.code || user?.role?.name || user?.role || "employee").toLowerCase();
  const hasRead = module => !rbacEnabled || ["admin", "superadmin", "super_admin"].includes(role) || user?.rolePermissions?.[module]?.read === true;
  const items = menu.filter(([, , , modules]) => modules.some(hasRead));
  const wide = mobile || expanded;
  const go = path => { setTooltip(null); navigate(path); if (mobile) onMobileClose(); };
  const active = path => location.pathname === path || path !== "/dashboard" && location.pathname.startsWith(path);
  const exit = async () => { setTooltip(null); await execReq.post("/auth/logout").catch(() => {}); logout(); navigate("/", { replace: true }); };
  const contents = <><Box sx={{ height: 88, display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", px: wide ? 2 : 0, flexShrink: 0, borderBottom: "1px solid " + colors.border }}><Logo open={wide} /></Box><Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", px: 1, pb: 1 }}>{order.map(group => { const rows = items.filter(item => groups[item[0]] === group); if (!rows.length) return null; return <React.Fragment key={group}>{wide && <Typography sx={{ px: 1.5, pt: 2.5, pb: 1, fontSize: 10, fontWeight: 600, letterSpacing: 1, color: colors.textMuted, whiteSpace: "nowrap" }}>{group}</Typography>}<List disablePadding sx={{ pt: wide ? 0 : 1 }}>{rows.map(([label, Icon, path]) => <React.Fragment key={path}><Tooltip open={!wide && tooltip === path} onOpen={() => setTooltip(path)} onClose={() => setTooltip(null)} disableInteractive disableTouchListener title={wide ? "" : label} placement="right" disableHoverListener={wide} disableFocusListener={wide}><ListItemButton aria-label={label} aria-current={active(path) ? "page" : undefined} onClick={() => go(path)} sx={{ minHeight: 44, mb: 0.5, px: 1.25, gap: 1.5, borderRadius: "4px", color: active(path) ? colors.primary : colors.textPrimary, bgcolor: active(path) ? colors.primarySoft : "transparent", position: "relative", "&:hover": { bgcolor: colors.primarySoft }, "&::before": active(path) ? { content: '""', position: "absolute", left: 0, top: 8, bottom: 8, width: 3, bgcolor: colors.primary } : {} }}><ListItemIcon sx={{ minWidth: 24, justifyContent: "center", color: active(path) ? colors.primary : colors.textMuted }}><Icon sx={{ fontSize: 21 }} /></ListItemIcon>{wide && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13, fontWeight: 500, noWrap: true, color: "inherit" }} />}{wide && label === "Administration" && <IconButton size="small" aria-label="Expand administration submenu" aria-expanded={adminOpen} onClick={event => { event.stopPropagation(); setAdminOpen(!adminOpen); }}><ChevronRight sx={{ fontSize: 15, transform: adminOpen ? "rotate(90deg)" : "none" }} /></IconButton>}</ListItemButton></Tooltip>{wide && label === "Administration" && adminOpen && <Stack sx={{ pl: 5 }}>{[["Users", "users", "users"], ["Roles", "roles", "roles"], ["Access", "rbac", "roles"], ["Organization", "organization", "organizations"]].filter(([, , module]) => hasRead(module)).map(([label, route]) => <ListItemButton key={route} onClick={() => go("/dashboard/admin/" + route)} sx={{ borderRadius: "4px", py: 0.75 }}><ListItemText primary={label} primaryTypographyProps={{ fontSize: 12 }} /></ListItemButton>)}</Stack>}</React.Fragment>)}</List></React.Fragment>; })}<Tooltip open={!wide && tooltip === "logout"} onOpen={() => setTooltip("logout")} onClose={() => setTooltip(null)} disableInteractive title={wide ? "" : "Logout"} placement="right" disableHoverListener={wide}><ListItemButton aria-label="Logout" onClick={exit} sx={{ borderRadius: "4px", gap: 1.5, px: 1.25, mt: 2, minHeight: 44 }}><ListItemIcon sx={{ minWidth: 24, color: colors.textMuted }}><LogoutOutlined sx={{ fontSize: 21 }} /></ListItemIcon>{wide && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13 }} />}</ListItemButton></Tooltip></Box></>;
  if (mobile) return <Drawer open={mobileOpen} onClose={onMobileClose} PaperProps={{ sx: { width: 260, borderRadius: "4px", bgcolor: colors.cardBg, display: "flex", flexDirection: "column" } }}>{contents}</Drawer>;
  return <Box component="nav" data-ui="sidebar" aria-label="Primary navigation" aria-expanded={expanded} onMouseEnter={() => { hovering.current = true; show(); }} onMouseLeave={() => { setTooltip(null); hovering.current = false; hide(); }} onFocusCapture={event => { keyboardFocus.current = event.target.matches(":focus-visible"); show(); }} onBlurCapture={event => { setTooltip(null); if (!event.currentTarget.contains(event.relatedTarget)) { keyboardFocus.current = false; hide(); } }} onKeyDown={event => { if (event.key === "Escape") { setTooltip(null); keyboardFocus.current = false; hovering.current = false; setExpanded(false); setAdminOpen(false); } }} sx={{ position: "fixed", left: 0, top: 0, bottom: 0, width: expanded ? 260 : 72, transition: "width 200ms ease, box-shadow 200ms ease", zIndex: 1400, display: "flex", flexDirection: "column", bgcolor: colors.cardBg, borderRight: "1px solid " + colors.border, boxShadow: expanded ? shadows.popup : "none", overflow: "hidden" }}>{contents}</Box>;
}
