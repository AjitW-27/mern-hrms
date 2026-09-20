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
      bgcolor: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 1,
      boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          display: "grid",
          placeItems: "center",
          borderRadius: 1,
          bgcolor: "#E6F7F8",
          color: "#0E8F9A",
        }}
      >
        <EventOutlinedIcon />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>
          Upcoming Events
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#64748B" }}>
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
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <Box
            sx={{
              minWidth: 48,
              textAlign: "center",
              p: 0.75,
              bgcolor: "#F8FAFC",
              borderRadius: 8,
            }}
          >
            <Typography
              sx={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}
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
              sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}
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
