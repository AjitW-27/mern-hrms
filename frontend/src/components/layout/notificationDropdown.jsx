import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  EventNote as LeaveIcon,
  Assignment as TaskIcon,
  Campaign as AnnouncementIcon,
  Info as SystemIcon,
} from "@mui/icons-material";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000/api/notifications";

  // Fetch notifications from Backend
  const fetchNotifications = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_URL}/mark-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update UI immediately without waiting for a re-fetch
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  // Helper to get exact icon based on Notification Type from Backend
  const getIcon = (type) => {
    switch (type) {
      case "payroll":
        return <PaymentIcon sx={{ color: "#10b981" }} />; // Green
      case "leave":
        return <LeaveIcon sx={{ color: "#f59e0b" }} />; // Orange
      case "task":
        return <TaskIcon sx={{ color: "#3b82f6" }} />; // Blue
      case "announcement":
        return <AnnouncementIcon sx={{ color: "#8b5cf6" }} />; // Purple
      default:
        return <SystemIcon sx={{ color: "#94a3b8" }} />; // Gray
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: "#94a3b8" }}>
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
            background: "#1e293b", // Dark theme background
            color: "#fff",
            border: "1px solid #334155",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
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
              onClick={handleMarkAllRead}
              sx={{
                textTransform: "none",
                color: "#3b82f6",
                fontWeight: "bold",
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider sx={{ borderColor: "#334155" }} />

        {/* Scrollable List */}
        <List sx={{ p: 0, maxHeight: 400, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <Box p={4} textAlign="center" color="#94a3b8">
              <NotificationsIcon sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
              <Typography variant="body2">No notifications yet</Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <Box key={notif._id}>
                <ListItem
                  sx={{
                    background: notif.isRead
                      ? "transparent"
                      : "rgba(59, 130, 246, 0.08)", // Light blue background for unread
                    "&:hover": { background: "#334155" },
                    cursor: "pointer",
                    py: 1.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Box
                      sx={{
                        background: "rgba(255,255,255,0.05)",
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
                      color: "#f8fafc",
                    }}
                    secondaryTypographyProps={{
                      fontSize: 12,
                      color: "#94a3b8",
                      mt: 0.5,
                    }}
                  />
                  {!notif.isRead && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        background: "#ef4444", // Red dot for unread status
                        borderRadius: "50%",
                        ml: 2,
                      }}
                    />
                  )}
                </ListItem>
                <Divider sx={{ borderColor: "#334155" }} />
              </Box>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationDropdown;
