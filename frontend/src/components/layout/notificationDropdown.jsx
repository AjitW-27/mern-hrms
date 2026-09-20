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
import execReq from "../../lib/execReq";

const NotificationDropdown = () => {
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
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await execReq.put("/notifications/mark-read");
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
        return <TaskIcon sx={{ color: "#4F46E5" }} />; // Blue
      case "announcement":
        return <AnnouncementIcon sx={{ color: "#8b5cf6" }} />; // Purple
      default:
        return <SystemIcon sx={{ color: "none" }} />; // Gray
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: "none" }}>
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
            background: "#FFFFFF",
            color: "#0F172A",
            border: "1px solid #E2E8F0",
            borderRadius: "4px",
            boxShadow:
              "0 10px 15px -3px rgba(15,23,42,.10), 0 4px 6px -4px rgba(15,23,42,.06)",
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
                color: "#4F46E5",
                fontWeight: "bold",
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

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
                  sx={{
                    background: notif.isRead
                      ? "transparent"
                      : "rgba(79, 70, 229, 0.08)", // Light blue background for unread
                    "&:hover": { background: "#F8FAFC" },
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
                      color: "#0F172A",
                    }}
                    secondaryTypographyProps={{
                      fontSize: 12,
                      color: "none",
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
