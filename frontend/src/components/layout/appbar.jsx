import React, { useState } from "react";
import {
  Box,
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  Breadcrumbs,
  Link,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  LogoutOutlined,
  AdminPanelSettingsOutlined,
  ManageAccountsOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { getPageMeta } from "../../config/pageMeta";
import useAuthStore from "../../strore/authStore";
import api from "../../lib/api";
import NotificationDropdown from "./notificationDropdown";

const Appbar = ({ open, setOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const page = getPageMeta(location.pathname);
  const [anchorEl, setAnchorEl] = useState(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [rbacEnabled, setRbacEnabled] = useState(false);
  const canAccessAdmin = !rbacEnabled || ["superadmin", "super_admin"].includes(String(user?.role || "").toLowerCase()) || Boolean(user?.rolePermissions?.users?.read || user?.rolePermissions?.roles?.read);

  React.useEffect(() => {
    let mounted = true;
    api.get("/settings").then(({ data }) => {
      if (mounted) setRbacEnabled(data.data?.rbacEnabled === true);
    }).catch(() => {
      if (mounted) setRbacEnabled(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    // The backend invalidates the refresh token; local cleanup still happens if
    // the server is unavailable so the protected UI is never left accessible.
    await api.post("/auth/logout").catch(() => {});
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Box
      sx={{
        height: 70,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* LEFT */}
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{ color: "text.primary", ml: -2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: { xs: "none", lg: "flex" }, flexDirection: "column", alignItems: "flex-start", minWidth: 190 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25, color: "text.primary" }}>{page.title}</Typography>
          <Breadcrumbs separator="/" sx={{ mt: 0.15, "& .MuiBreadcrumbs-li": { fontSize: 12, color: "text.secondary" } }}>
            {page.crumbs.map((crumb) => <Link key={crumb.to} component="button" underline="hover" color="inherit" onClick={() => navigate(crumb.to)} sx={{ fontSize: 12 }}>{crumb.label}</Link>)}
            <Typography component="span" sx={{ fontSize: 12, color: "text.secondary" }}>{page.title}</Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      {/* RIGHT */}
      <Box display="flex" alignItems="center" gap={isMobile ? 0.75 : 3}>
        
       
        <NotificationDropdown/>

        <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="Open account menu" aria-controls={anchorEl ? "account-menu" : undefined} aria-haspopup="true" aria-expanded={Boolean(anchorEl)} sx={{ p: 0.5, borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}>
          <Avatar src={user?.avatar} sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14, fontWeight: 700 }}>
            {user?.name?.trim()?.charAt(0)?.toUpperCase() || "A"}
          </Avatar>
        </IconButton>
        <Menu id="account-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }} PaperProps={{ sx: { width: { xs: 240, sm: 260 }, mt: 1, border: "1px solid", borderColor: "divider", borderRadius: 1, boxShadow: "0 10px 24px rgba(16,24,40,.12)", overflow: "hidden" } }}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>ADMIN</Typography>
            <Typography variant="subtitle2" fontWeight={700}>{user?.name || "Administrator"}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">{user?.email || "No email available"}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate("/dashboard/profile"); }}><ListItemIcon><ManageAccountsOutlined fontSize="small" /></ListItemIcon>Profile</MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); navigate("/dashboard/settings"); }}><ListItemIcon><SettingsOutlined fontSize="small" /></ListItemIcon>Settings</MenuItem>
          {canAccessAdmin && <MenuItem onClick={() => { setAnchorEl(null); navigate("/dashboard/admin/users"); }}><ListItemIcon><AdminPanelSettingsOutlined fontSize="small" /></ListItemIcon>Admin</MenuItem>}
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}><ListItemIcon sx={{ color: "error.main" }}><LogoutOutlined fontSize="small" /></ListItemIcon>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Appbar;
