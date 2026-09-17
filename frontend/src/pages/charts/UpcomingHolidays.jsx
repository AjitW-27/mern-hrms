import React from "react";
import { Box, Chip, Skeleton, Typography } from "@mui/material";
import { BeachAccess as HolidayIcon } from "@mui/icons-material";
import {
  ChartCard,
  ChartHeading,
  useChartTheme,
} from "../../components/common/ChartComponents";
const formatDate = (value) => {
  const date = new Date(value);
  return {
    day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    full: date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "long",
    }),
  };
};
const UpcomingHolidays = ({ holidays, loading }) => {
  const c = useChartTheme();
  return (
    <ChartCard minHeight={300}>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "8px",
            bgcolor: "primary.light",
            display: "grid",
            placeItems: "center",
          }}
        >
          <HolidayIcon sx={{ color: "primary.main" }} />
        </Box>
        <ChartHeading title="Upcoming Holidays" subtitle="Next 30 days" />
      </Box>
      {loading ? (
        <Skeleton
          variant="rectangular"
          height={185}
          sx={{ mt: 2, bgcolor: "action.hover", borderRadius: "8px" }}
        />
      ) : !holidays?.length ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={180}
        >
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            No holidays in next 30 days
          </Typography>
        </Box>
      ) : (
        <Box mt={2} display="flex" flexDirection="column" gap={1}>
          {holidays.map((holiday) => {
            const date = formatDate(holiday.date);
            return (
              <Box
                key={holiday._id}
                display="flex"
                alignItems="center"
                gap={1.5}
                sx={{
                  p: 1.25,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Box
                  sx={{
                    minWidth: 48,
                    height: 52,
                    display: "grid",
                    placeItems: "center",
                    alignContent: "center",
                    bgcolor: "primary.light",
                    borderRadius: "8px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      lineHeight: 1,
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    {date.day}
                  </Typography>
                  <Typography
                    sx={{ mt: 0.25, fontSize: 9, color: "text.secondary" }}
                  >
                    {date.month}
                  </Typography>
                </Box>
                <Box flexGrow={1}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    {holiday.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    {date.full}
                  </Typography>
                </Box>
                <Chip
                  label={holiday.type}
                  size="small"
                  sx={{
                    borderRadius: "8px",
                    bgcolor: "primary.light",
                    color: "primary.dark",
                  }}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </ChartCard>
  );
};
export default UpcomingHolidays;
