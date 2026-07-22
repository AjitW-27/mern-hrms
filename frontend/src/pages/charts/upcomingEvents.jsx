import React from "react";
import { Box, Typography } from "@mui/material";

const upcomingEvents = [
  {
    id: 1,
    dateNum: "30",
    dateMonth: "MAY",
    title: "Team Building Event",
    details: "May 30, 2025 • 10:00 AM",
  },
  {
    id: 2,
    dateNum: "05",
    dateMonth: "JUN",
    title: "Monthly Review Meeting",
    details: "June 5, 2025 • 02:00 PM",
  },
];

const UpcomingEvents = () => {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "16px",
        backgroundColor: "#131826", // Dark background
        color: "#fff",
        fontFamily: "sans-serif",
        width: "100%",
        maxWidth: 700,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <Box
            sx={{
              width: 44,
              height: 44,
              backgroundColor: "#6d28d9", // Purple bg
              borderRadius: "12px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mr: 2,
            }}
          >
            {/* Calendar Event Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M9 16h6"></path>
              <path d="M12 13v6"></path>
            </svg>
          </Box>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            Upcoming Events
          </Typography>
        </Box>

        {/* Events List */}
        <Box display="flex" flexDirection="column" gap={3}>
          {upcomingEvents.map((event) => (
            <Box key={event.id} display="flex" alignItems="center">
              {/* Date Box Indicator */}
              <Box
                sx={{
                  backgroundColor: "#1e293b", // Slate grey box
                  borderRadius: "10px",
                  minWidth: 55,
                  height: 60,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  mr: 2.5,
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{ fontWeight: "bold", fontSize: "1.2rem", lineHeight: 1 }}
                >
                  {event.dateNum}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "#94a3b8",
                    mt: 0.5,
                    fontWeight: 600,
                  }}
                >
                  {event.dateMonth}
                </Typography>
              </Box>

              {/* Event Details */}
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "1rem", mb: 0.5 }}>
                  {event.title}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  {event.details}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Footer Link */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography
          sx={{
            color: "#a855f7", // Purple link color
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          View Calendar
          <svg
            style={{ marginLeft: 4 }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </Typography>
      </Box>
    </Box>
  );
};

export default UpcomingEvents;
