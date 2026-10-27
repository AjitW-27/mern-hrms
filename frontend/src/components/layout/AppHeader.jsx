import React, { useState } from "react";
import { Box, Breadcrumbs, Divider, ListItemIcon, Menu, MenuItem, Stack, Typography, useMediaQuery } from "@mui/material";
import { LogoutOutlined, ManageAccountsOutlined, MenuRounded, SettingsOutlined, AdminPanelSettingsOutlined } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, IconButton } from "../common/UI";
import { getPageMeta } from "../../config/pageMeta";
import useAuthStore from "../../strore/authStore";
import execReq from "../../lib/execReq";
import NotificationDropdown from "./notificationDropdown";
import MessageNotificationDropdown from "./MessageNotificationDropdown";
import { colors } from "../../theme/designTokens";

export default function AppHeader({ onMobileOpen }) {
  const mobile = useMediaQuery("(max-width:767px)"), location = useLocation(), navigate = useNavigate();
  const page = getPageMeta(location.pathname), user = useAuthStore(state => state.user), logout = useAuthStore(state => state.logout);
  const [anchor, setAnchor] = useState(null);
  const role = String(user?.role?.code || user?.role?.name || user?.role || "employee").toLowerCase();
  const canAdmin = ["admin", "hr", "superadmin", "super_admin"].includes(role) || user?.rolePermissions?.users?.read || user?.rolePermissions?.roles?.read;
  const go = path => { setAnchor(null); navigate(path); };
  const signOut = async () => { await execReq.post("/auth/logout").catch(() => {}); logout(); navigate("/", { replace: true }); };
  return <Box component="header" data-ui="app-header" sx={{ minHeight: 88, px: { xs: 1.5, md: 2.5 }, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, bgcolor: colors.cardBg, borderBottom: "1px solid " + colors.border, flexShrink: 0 }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: 1 }}>
      {mobile && <IconButton data-ui="mobile-navigation-toggle" aria-label="Open navigation" onClick={onMobileOpen}><MenuRounded /></IconButton>}
      <Box sx={{ minWidth: 0 }}><Typography component="h1" noWrap sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 700, color: colors.textPrimary }}>{page.title}</Typography><Typography variant="caption" noWrap sx={{ display: "block", color: colors.textMuted }}>{page.subtitle}</Typography><Breadcrumbs separator="/" aria-label="Breadcrumb" sx={{ fontSize: 11, "& .MuiBreadcrumbs-li": { fontSize: 11 } }}>{page.breadcrumb.map(crumb => crumb.to ? <Link key={crumb.label} to={crumb.to} style={{ color: colors.textMuted, textDecoration: "none" }}>{crumb.label}</Link> : <Typography key={crumb.label} sx={{ fontSize: 11, color: colors.textMuted }}>{crumb.label}</Typography>)}</Breadcrumbs></Box>
    </Stack>
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}><MessageNotificationDropdown /><NotificationDropdown /><IconButton aria-label="Open account menu" onClick={event => setAnchor(event.currentTarget)}><Avatar src={user?.avatar} name={user?.name} sx={{ width: 34, height: 34 }} /></IconButton></Stack>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}><Box sx={{ px: 2, py: 1 }}><Typography fontWeight={600}>{user?.name}</Typography><Typography variant="caption">{user?.email}</Typography></Box><Divider /><MenuItem onClick={() => go("/dashboard/profile")}><ListItemIcon><ManageAccountsOutlined fontSize="small" /></ListItemIcon>Profile</MenuItem><MenuItem onClick={() => go("/dashboard/settings")}><ListItemIcon><SettingsOutlined fontSize="small" /></ListItemIcon>Settings</MenuItem>{canAdmin && <MenuItem onClick={() => go("/dashboard/admin")}><ListItemIcon><AdminPanelSettingsOutlined fontSize="small" /></ListItemIcon>Administration</MenuItem>}<Divider /><MenuItem onClick={signOut}><ListItemIcon><LogoutOutlined fontSize="small" /></ListItemIcon>Logout</MenuItem></Menu>
  </Box>;
}
