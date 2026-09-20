import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Divider, Skeleton } from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Work as WorkIcon,
  EventNote as LeaveIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";

const ICON_MAP = {
  employee: { icon: PersonAddIcon, bg: "#10B981" },
  project: { icon: WorkIcon, bg: "#4F46E5" },
  leave: { icon: LeaveIcon, bg: "#F59E0B" },
  payroll: { icon: PaymentIcon, bg: "#8B5CF6" },
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
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "4px",
        background: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        height: "100%",
        minHeight: 300,
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
      >
        <Box>
          <Typography fontSize={16} fontWeight={700} color="text.primary">
            Recent Activities
          </Typography>
          <Typography fontSize={12} color="text.secondary" mt={0.2}>
            Latest actions across your org
          </Typography>
        </Box>
        <Typography
          component="button"
          type="button"
          onClick={() => navigate("/dashboard/audit-logs")}
          sx={{
            color: "primary.main",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            border: 0,
            background: "transparent",
            p: 0,
            fontFamily: "inherit",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          View All
        </Typography>
      </Box>

      {/* Activity List */}
      <Box display="flex" flexDirection="column">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Box key={i} display="flex" gap={1.5} mb={2}>
              <Skeleton
                variant="rounded"
                width={42}
                height={42}
                sx={{
                  bgcolor: "action.hover",
                  borderRadius: "4px",
                  flexShrink: 0,
                }}
              />
              <Box flexGrow={1}>
                <Skeleton
                  variant="text"
                  width="75%"
                  height={18}
                  sx={{ bgcolor: "action.hover" }}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={14}
                  sx={{ bgcolor: "action.hover", mt: 0.5 }}
                />
              </Box>
            </Box>
          ))
        ) : !activities?.length ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height={150}
          >
            <Typography color="text.secondary" fontSize={13}>
              No recent activities
            </Typography>
          </Box>
        ) : (
          activities.map((activity, index) => {
            const config = ICON_MAP[activity.type] || ICON_MAP.employee;
            const Icon = config.icon;
            return (
              <React.Fragment key={index}>
                <Box display="flex" alignItems="flex-start" py={0.5} gap={1.5}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "primary.light",
                      borderRadius: "4px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: 0,
                      boxShadow: "none",
                    }}
                  >
                    <Icon sx={{ color: "primary.main", fontSize: 20 }} />
                  </Box>
                  <Box flexGrow={1}>
                    <Typography
                      fontSize={13}
                      color="text.primary"
                      lineHeight={1.4}
                    >
                      {activity.content}
                    </Typography>
                    {activity.subContent && (
                      <Typography fontSize={11} color="text.secondary" mt={0.2}>
                        {activity.subContent}
                      </Typography>
                    )}
                    <Typography fontSize={11} color="text.secondary" mt={0.5}>
                      {timeAgo(activity.time)}
                    </Typography>
                  </Box>
                </Box>
                {index < activities.length - 1 && (
                  <Divider sx={{ borderColor: "divider", my: 1.5 }} />
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
