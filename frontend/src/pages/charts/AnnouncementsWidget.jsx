import React from "react";
import { Box, Typography, Skeleton, Chip } from "@mui/material";
import { Campaign as CampaignIcon } from "@mui/icons-material";

const AUDIENCE_COLORS = {
  All: { bg: "#6366f122", text: "#818cf8", border: "#6366f144" },
  Department: { bg: "#10b98122", text: "#34d399", border: "#10b98144" },
  Role: { bg: "#f59e0b22", text: "#fbbf24", border: "#f59e0b44" },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const AnnouncementsWidget = ({ announcements, loading }) => {
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
          background: "linear-gradient(135deg, #7c3aed, #6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
        }}>
          <CampaignIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography fontSize={16} fontWeight={700} color="#f1f5f9">Announcements</Typography>
          <Typography fontSize={12} color="#64748b">Latest updates</Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {loading ? (
          [1, 2, 3].map((i) => (
            <Box key={i} display="flex" gap={1.5}>
              <Skeleton variant="circular" width={8} height={8} sx={{ bgcolor: "#1e293b", mt: 0.8, flexShrink: 0 }} />
              <Box flexGrow={1}>
                <Skeleton variant="text" width="80%" height={18} sx={{ bgcolor: "#1e293b" }} />
                <Skeleton variant="text" width="100%" height={14} sx={{ bgcolor: "#1e293b", mt: 0.5 }} />
              </Box>
            </Box>
          ))
        ) : !announcements?.length ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} gap={1}>
            <CampaignIcon sx={{ color: "#334155", fontSize: 40 }} />
            <Typography color="#475569" fontSize={13}>No announcements yet</Typography>
          </Box>
        ) : (
          announcements.map((ann) => {
            const colors = AUDIENCE_COLORS[ann.audience] || AUDIENCE_COLORS.All;
            return (
              <Box key={ann._id} display="flex" gap={1.5}
                sx={{
                  p: 1.5, borderRadius: "10px",
                  bgcolor: "rgba(30,41,59,0.4)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "rgba(30,41,59,0.7)", border: "1px solid rgba(99,102,241,0.2)" }
                }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#8b5cf6", mt: 0.8, flexShrink: 0 }} />
                <Box flexGrow={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.4}>
                    <Typography fontSize={13} fontWeight={600} color="#f1f5f9" lineHeight={1.3}>
                      {ann.title}
                    </Typography>
                    <Chip
                      label={ann.audience}
                      size="small"
                      sx={{
                        height: 18, fontSize: 10, ml: 1, flexShrink: 0,
                        bgcolor: colors.bg, color: colors.text,
                        border: `1px solid ${colors.border}`,
                        "& .MuiChip-label": { px: 0.8 }
                      }}
                    />
                  </Box>
                  <Typography fontSize={12} color="#64748b" lineHeight={1.5} mb={0.5}>
                    {ann.message?.length > 80 ? ann.message.slice(0, 80) + "…" : ann.message}
                  </Typography>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontSize={11} color="#475569">by {ann.postedBy}</Typography>
                    <Typography fontSize={11} color="#475569">{timeAgo(ann.createdAt)}</Typography>
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      {!loading && announcements?.length > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Typography sx={{
            color: "#8b5cf6", fontSize: 13, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5,
            "&:hover": { textDecoration: "underline" }
          }}>
            View All Announcements
            <span style={{ fontSize: 16 }}>→</span>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AnnouncementsWidget;
