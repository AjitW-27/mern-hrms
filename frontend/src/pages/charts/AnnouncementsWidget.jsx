import React from "react";
import { Box, Chip, Skeleton, Typography } from "@mui/material";
import { Campaign as CampaignIcon } from "@mui/icons-material";
import {
  ChartCard,
  ChartHeading,
  useChartTheme,
} from "../../components/common/ChartComponents";
const timeAgo = (date) => {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  return minutes < 60
    ? `${minutes}m ago`
    : minutes < 1440
      ? `${Math.floor(minutes / 60)}h ago`
      : `${Math.floor(minutes / 1440)}d ago`;
};
const AnnouncementsWidget = ({ announcements, loading }) => {
  const c = useChartTheme();
  return (
    <ChartCard minHeight={340} tone="sky">
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "4px",
            bgcolor: "primary.light",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CampaignIcon sx={{ color: "primary.main" }} />
        </Box>
        <ChartHeading title="Announcements" subtitle="Latest updates" />
      </Box>
      {loading ? (
        <Skeleton
          variant="rectangular"
          height={180}
          sx={{ bgcolor: "action.hover", borderRadius: "4px" }}
        />
      ) : !announcements?.length ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={180}
        >
          <CampaignIcon sx={{ color: "text.secondary", fontSize: 36 }} />
          <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
            No announcements yet
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          {announcements.map((ann) => (
            <Box
              key={ann._id}
              sx={{
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "4px",
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Box display="flex" justifyContent="space-between" gap={1}>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}
                >
                  {ann.title}
                </Typography>
                <Chip
                  label={ann.audience}
                  size="small"
                  sx={{
                    height: 18,
                    borderRadius: "4px",
                    bgcolor: "primary.light",
                    color: "primary.dark",
                  }}
                />
              </Box>
              <Typography
                sx={{ mt: 0.5, fontSize: 12, color: "text.secondary" }}
              >
                {ann.message?.length > 80
                  ? `${ann.message.slice(0, 80)}…`
                  : ann.message}
              </Typography>
              <Typography
                sx={{ mt: 0.5, fontSize: 11, color: "text.secondary" }}
              >
                by {ann.postedBy} · {timeAgo(ann.createdAt)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </ChartCard>
  );
};
export default AnnouncementsWidget;
