import React from "react";
import { Box, Typography, Skeleton, Chip } from "@mui/material";
import { BeachAccess as HolidayIcon } from "@mui/icons-material";

const UpcomingHolidays = ({ holidays, loading }) => {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString("en-IN", { day: "2-digit" }),
      month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
      full: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" }),
    };
  };

  const daysUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  return (
    <Box sx={{
      p: 2.5, borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(19,24,38,0.95), rgba(15,23,42,0.98))",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      height: "100%", minHeight: 300,
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
        <Box sx={{
          width: 42, height: 42, borderRadius: "12px",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 15px rgba(168,85,247,0.4)",
        }}>
          <HolidayIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography fontSize={16} fontWeight={700} color="#f1f5f9">Upcoming Holidays</Typography>
          <Typography fontSize={12} color="#64748b">Next 30 days</Typography>
        </Box>
      </Box>

      {/* List */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {loading ? (
          [1, 2, 3].map((i) => (
            <Box key={i} display="flex" gap={2} alignItems="center">
              <Skeleton variant="rounded" width={55} height={60} sx={{ bgcolor: "#1e293b", borderRadius: "10px" }} />
              <Box flexGrow={1}>
                <Skeleton variant="text" width="60%" height={18} sx={{ bgcolor: "#1e293b" }} />
                <Skeleton variant="text" width="40%" height={14} sx={{ bgcolor: "#1e293b", mt: 0.5 }} />
              </Box>
            </Box>
          ))
        ) : !holidays?.length ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} gap={1}>
            <HolidayIcon sx={{ color: "#334155", fontSize: 40 }} />
            <Typography color="#475569" fontSize={13}>No holidays in next 30 days</Typography>
          </Box>
        ) : (
          holidays.map((holiday) => {
            const date = formatDate(holiday.date);
            const until = daysUntil(holiday.date);
            return (
              <Box key={holiday._id} display="flex" alignItems="center" gap={2}
                sx={{
                  p: 1.5, borderRadius: "10px",
                  bgcolor: "rgba(30,41,59,0.4)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "rgba(30,41,59,0.7)" }
                }}>
                {/* Date Box */}
                <Box sx={{
                  bgcolor: "#1e293b", borderRadius: "10px",
                  minWidth: 52, height: 58,
                  display: "flex", flexDirection: "column",
                  justifyContent: "center", alignItems: "center", flexShrink: 0,
                  border: "1px solid #334155",
                }}>
                  <Typography fontWeight={800} fontSize={18} color="#f1f5f9" lineHeight={1}>{date.day}</Typography>
                  <Typography fontSize={10} color="#64748b" fontWeight={600} mt={0.3}>{date.month}</Typography>
                </Box>

                {/* Details */}
                <Box flexGrow={1}>
                  <Typography fontSize={14} fontWeight={600} color="#f1f5f9" mb={0.4}>{holiday.name}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontSize={11} color="#64748b">{date.full}</Typography>
                    <Chip
                      label={until}
                      size="small"
                      sx={{
                        height: 16, fontSize: 10,
                        bgcolor: until === "Today" ? "#10b98122" : "#6366f122",
                        color: until === "Today" ? "#34d399" : "#818cf8",
                        border: `1px solid ${until === "Today" ? "#10b98144" : "#6366f144"}`,
                        "& .MuiChip-label": { px: 0.8 }
                      }}
                    />
                  </Box>
                  <Typography fontSize={11} color="#475569" mt={0.3}>{holiday.type} Holiday</Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      {!loading && holidays?.length > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Typography sx={{
            color: "#a855f7", fontSize: 13, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5,
            "&:hover": { textDecoration: "underline" }
          }}>
            View Calendar →
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UpcomingHolidays;
