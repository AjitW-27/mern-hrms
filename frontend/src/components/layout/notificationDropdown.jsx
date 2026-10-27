import { IconButton, Button } from "../common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useState, useEffect } from "react";
import { Alert, Badge, Popover, Box, Typography, List, ListItem, ListItemText, ListItemIcon, Divider } from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  EventNote as LeaveIcon,
  Assignment as TaskIcon,
  Campaign as AnnouncementIcon,
  Info as SystemIcon,
} from "@mui/icons-material";
import execReq, { SOCKET_BASE_URL } from "../../lib/execReq";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../strore/authStore";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  const role = String(user?.role?.code || user?.role?.name || user?.role || "employee").toLowerCase();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch notifications from Backend
  const fetchNotifications = async () => {
    try {
      const { data: result } = await execReq("/notifications");
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      setError("Notifications could not be loaded. Reopen to retry.");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 60000);
    const socket = token ? io(SOCKET_BASE_URL, { auth: { token } }) : null;
    socket?.on("notification:new", fetchNotifications);
    socket?.on("connect", fetchNotifications);
    return () => { clearInterval(timer); socket?.disconnect(); };
  }, [token]);

  const handleOpen = (event) => { setError(""); setAnchorEl(event.currentTarget); fetchNotifications(); };
  const handleClose = () => setAnchorEl(null);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      setBusy(true);
      const { data } = await execReq.put("/notifications/mark-read");
      if (!data.success) throw new Error("Mark as read failed");
      // Update UI immediately without waiting for a re-fetch
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      setError("Could not mark notifications as read. Please retry.");
    } finally { setBusy(false); }
  };

  const handleNotification = async (notification) => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (!notification.isRead) {
        const { data } = await execReq.put("/notifications/" + notification._id + "/read");
        if (!data.success) throw new Error("Mark as read failed");
        await fetchNotifications();
      }
      const destinations = { leave: "/dashboard/leave", payroll: "/dashboard/payroll", task: "/dashboard/projects", attendance: "/dashboard/attendance", expense: "/dashboard/expenses", announcement: "/dashboard" };
      const destination = destinations[notification.type];
      if (destination) { handleClose(); navigate(destination, { state: { notificationId: notification._id, relatedId: notification.relatedId, approvals: notification.type === "leave" && ["admin", "hr", "manager", "superadmin", "super_admin"].includes(role) && /new leave application/i.test(notification.title || "") } }); }
      else setError("This notification has no linked page. Its message is shown here.");
    } catch { setError("Could not mark this notification as read. Please retry."); }
    finally { setBusy(false); }
  };

  // Helper to get exact icon based on Notification Type from Backend
  const getIcon = (type) => {
    switch (type) {
      case "payroll":
        return <PaymentIcon sx={{ color: themeColors.success }} />; // Green
      case "leave":
        return <LeaveIcon sx={{ color: themeColors.warning }} />;
      case "task":
        return <TaskIcon sx={{ color: themeColors.info }} />; // Blue
      case "announcement":
        return <AnnouncementIcon sx={{ color: themeColors.purple }} />; // Purple
      default:
        return <SystemIcon sx={{ color: "text.secondary" }} />; // Gray
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton aria-label={"Notifications, " + unreadCount + " unread"} onClick={handleOpen} sx={{ color: "text.secondary" }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Dropdown Menu */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 380,
            maxWidth: "calc(100vw - 24px)",
            background: themeColors.cardBg,
            color: themeColors.navyDark,
            border: "1px solid " + themeColors.border,
            borderRadius: "4px",
            boxShadow:
              "0 10px 15px -3px " + themeColors.overlay5 + ", 0 4px 6px -4px " + themeColors.overlay1,
          },
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
        >
          <Typography fontWeight="bold" fontSize={16}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              disabled={busy}
              onClick={handleMarkAllRead}
              sx={{
                textTransform: "none",
                color: themeColors.info,
                fontWeight: "bold",
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {error && <Alert severity="warning">{error}</Alert>}
        {/* Scrollable List */}
        <List sx={{ p: 0, maxHeight: 400, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <Box p={4} textAlign="center" color="text.secondary">
              <NotificationsIcon sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
              <Typography variant="body2">No notifications yet</Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <Box key={notif._id}>
                <ListItem
                  component="button"
                  disabled={busy}
                  onClick={() => handleNotification(notif)}
                  sx={{
                    width: "100%", border: 0, textAlign: "left",
                    background: notif.isRead
                      ? "transparent"
                      : themeColors.overlay10, // Light blue background for unread
                    "&:hover": { background: themeColors.hover },
                    cursor: "pointer",
                    py: 1.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Box
                      sx={{
                        background: themeColors.overlay11,
                        p: 1,
                        borderRadius: "50%",
                        display: "flex",
                      }}
                    >
                      {getIcon(notif.type)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={notif.title}
                    secondary={notif.message}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: notif.isRead ? "normal" : "bold",
                      color: themeColors.navyDark,
                    }}
                    secondaryTypographyProps={{
                      fontSize: 12,
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  />
                  {!notif.isRead && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        background: themeColors.primary, // Red dot for unread status
                        borderRadius: "50%",
                        ml: 2,
                      }}
                    />
                  )}
                </ListItem>
                <Divider />
              </Box>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationDropdown;
