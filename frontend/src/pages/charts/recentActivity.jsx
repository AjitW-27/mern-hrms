import React from "react";
import { Box, Typography, Divider, Skeleton } from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Work as WorkIcon,
  EventNote as LeaveIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";

const ICON_MAP = {
  employee: { icon: PersonAddIcon, bg: "#059669" },
  project: { icon: WorkIcon, bg: "#2563eb" },
  leave: { icon: LeaveIcon, bg: "#ea580c" },
  payroll: { icon: PaymentIcon, bg: "#7c3aed" },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const RecentActivities = ({ activities, loading }) => {
  return (
    <Box sx={{
      p: 2.5, borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(19,24,38,0.95), rgba(15,23,42,0.98))",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      height: "100%", minHeight: 300,
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box>
          <Typography fontSize={16} fontWeight={700} color="#f1f5f9">Recent Activities</Typography>
          <Typography fontSize={12} color="#64748b" mt={0.2}>Latest actions across your org</Typography>
        </Box>
        <Typography sx={{
          color: "#8b5cf6", fontWeight: 600, fontSize: 13,
          cursor: "pointer", "&:hover": { textDecoration: "underline" }
        }}>
          View All
        </Typography>
      </Box>

      {/* Activity List */}
      <Box display="flex" flexDirection="column">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Box key={i} display="flex" gap={1.5} mb={2}>
              <Skeleton variant="rounded" width={42} height={42} sx={{ bgcolor: "#1e293b", borderRadius: "10px", flexShrink: 0 }} />
              <Box flexGrow={1}>
                <Skeleton variant="text" width="75%" height={18} sx={{ bgcolor: "#1e293b" }} />
                <Skeleton variant="text" width="40%" height={14} sx={{ bgcolor: "#1e293b", mt: 0.5 }} />
              </Box>
            </Box>
          ))
        ) : !activities?.length ? (
          <Box display="flex" alignItems="center" justifyContent="center" height={150}>
            <Typography color="#475569" fontSize={13}>No recent activities</Typography>
          </Box>
        ) : (
          activities.map((activity, index) => {
            const config = ICON_MAP[activity.type] || ICON_MAP.employee;
            const Icon = config.icon;
            return (
              <React.Fragment key={index}>
                <Box display="flex" alignItems="flex-start" py={0.5} gap={1.5}>
                  <Box sx={{
                    width: 42, height: 42,
                    bgcolor: config.bg,
                    borderRadius: "10px",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}>
                    <Icon sx={{ color: "#fff", fontSize: 20 }} />
                  </Box>
                  <Box flexGrow={1}>
                    <Typography fontSize={13} color="#e2e8f0" lineHeight={1.4}>
                      {activity.content}
                    </Typography>
                    {activity.subContent && (
                      <Typography fontSize={11} color="#64748b" mt={0.2}>
                        {activity.subContent}
                      </Typography>
                    )}
                    <Typography fontSize={11} color="#475569" mt={0.5}>
                      {timeAgo(activity.time)}
                    </Typography>
                  </Box>
                </Box>
                {index < activities.length - 1 && (
                  <Divider sx={{ borderColor: "#1e293b", my: 1.5 }} />
                )}
              </React.Fragment>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default RecentActivities;
