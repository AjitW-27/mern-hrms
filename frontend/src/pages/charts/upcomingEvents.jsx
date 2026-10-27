import { colors as themeColors } from "../../theme/designTokens";
import React from "react";
import { Box, Typography } from "@mui/material";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

const UpcomingEvents = ({ events = [], loading = false }) => (
  <Box
    sx={{
      p: 2.5,
      width: "100%",
      height: "100%",
      minHeight: 300,
      bgcolor: themeColors.cardBg,
      border: "1px solid " + themeColors.border,
      borderRadius: "4px",
      boxShadow: "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          display: "grid",
          placeItems: "center",
          borderRadius: "4px",
          bgcolor: themeColors.primarySoft,
          color: themeColors.primary,
        }}
      >
        <EventOutlinedIcon />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: themeColors.textPrimary }}>
          Upcoming Events
        </Typography>
        <Typography sx={{ fontSize: 13, color: themeColors.textMuted }}>
          Meetings scheduled for you
        </Typography>
      </Box>
    </Box>
    {loading ? (
      <Typography sx={{ fontSize: 13, color: "none" }}>
        Loading events...
      </Typography>
    ) : events.length ? (
      events.map((event) => (
        <Box
          key={event._id}
          sx={{
            display: "flex",
            gap: 1.5,
            py: 1.25,
            borderBottom: "1px solid " + themeColors.tableHeader,
          }}
        >
          <Box
            sx={{
              minWidth: 48,
              textAlign: "center",
              p: 0.75,
              bgcolor: themeColors.hover,
              borderRadius: "4px",
            }}
          >
            <Typography
              sx={{ fontSize: 16, fontWeight: 700, color: themeColors.navyDark }}
            >
              {new Date(event.startAt).getDate()}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "none" }}>
              {new Date(event.startAt)
                .toLocaleDateString("en-IN", { month: "short" })
                .toUpperCase()}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: themeColors.navyDark }}
            >
              {event.title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "none", mt: 0.25 }}>
              {new Date(event.startAt).toLocaleString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              ·{" "}
              {event.meetingType === "online"
                ? "Online"
                : event.location || "In person"}
            </Typography>
          </Box>
        </Box>
      ))
    ) : (
      <Box sx={{ py: 7, textAlign: "center" }}>
        <Typography sx={{ fontSize: 13, color: "none" }}>
          No upcoming events
        </Typography>
      </Box>
    )}
  </Box>
);
export default UpcomingEvents;
