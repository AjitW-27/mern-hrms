import React from "react";
import {
  Box,
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  LogoutOutlined,
  AdminPanelSettingsOutlined,
  ManageAccountsOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { getPageMeta } from "../../config/pageMeta";
import useAuthStore from "../../strore/authStore";
import execReq from "../../lib/execReq";
import NotificationDropdown from "./notificationDropdown";
import MessageNotificationDropdown from "./MessageNotificationDropdown";

const Appbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const page = getPageMeta(location.pathname);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [rbacEnabled, setRbacEnabled] = React.useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  React.useEffect(() => {
    let mounted = true;
    execReq("/settings")
      .then(({ data }) => {
        if (mounted) setRbacEnabled(data?.data?.rbacEnabled === true);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const role = String(
    user?.role?.code || user?.role?.name || user?.role || "employee",
  ).toLowerCase();
  const canAccessAdmin =
    !rbacEnabled ||
    ["admin", "superadmin", "super_admin", "hr"].includes(role) ||
    Boolean(
      user?.rolePermissions?.users?.read || user?.rolePermissions?.roles?.read,
    );

  const handleLogout = async () => {
    await execReq.post("/auth/logout").catch(() => {});
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Box
      sx={{
        height: 64,
        px: { xs: 2, md: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 16,
            lineHeight: "24px",
            fontWeight: 600,
            color: "#0F172A",
          }}
        >
          {page.title}
        </Typography>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            gap: 0.75,
            alignItems: "center",
          }}
        >
          {page.crumbs.map((crumb) => (
            <Typography key={crumb.to} sx={{ fontSize: 12, color: "none" }}>
              {crumb.label} /
            </Typography>
          ))}
          <Typography sx={{ fontSize: 12, color: "#475569" }}>
            {page.title}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}
      >
        <MessageNotificationDropdown />
        <NotificationDropdown />
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label="Open account menu"
          sx={{ p: 0.5, borderRadius: 999 }}
        >
          <Avatar
            src={user?.avatar}
            sx={{
              width: 34,
              height: 34,
              bgcolor: "#0E8F9A",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {user?.name?.trim()?.charAt(0)?.toUpperCase() || "A"}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: 12, color: "none", fontWeight: 600 }}>
              ACCOUNT
            </Typography>
            <Typography
              sx={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}
            >
              {user?.name || "Administrator"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "none" }} noWrap>
              {user?.email || ""}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/dashboard/profile");
            }}
          >
            <ListItemIcon>
              <ManageAccountsOutlined fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/dashboard/settings");
            }}
          >
            <ListItemIcon>
              <SettingsOutlined fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          {canAccessAdmin && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate("/dashboard/admin");
              }}
            >
              <ListItemIcon>
                <AdminPanelSettingsOutlined fontSize="small" />
              </ListItemIcon>
              Admin
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutOutlined fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Appbar;
