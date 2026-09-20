import React from "react";
import { Box, LinearProgress, Skeleton, Typography } from "@mui/material";
import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import {
  ChartCard,
  ChartHeading,
  useChartTheme,
} from "../../components/common/ChartComponents";

const AttendanceSummaryBar = ({ kpis, loading }) => {
  const c = useChartTheme();
  const present = kpis?.todayPresent || 0;
  const absent = kpis?.todayAbsent || 0;
  const late = kpis?.todayLate || 0;
  const total = kpis?.totalEmployees || 1;
  const rate = Math.round((present / total) * 100);
  const stats = [
    { label: "Present", value: present, color: c.primary },
    { label: "Absent", value: absent, color: c.error },
    { label: "Late", value: late, color: c.warning },
  ].map((stat) => ({ ...stat, pct: Math.round((stat.value / total) * 100) }));
  return (
    <ChartCard tone="teal">
      <ChartHeading
        title="Today's Attendance"
        subtitle={new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
        })}
      />
      {loading ? (
        <Skeleton
          variant="circular"
          width={140}
          height={140}
          sx={{ bgcolor: "action.hover", mx: "auto", my: 2 }}
        />
      ) : (
        <Box position="relative" width={160} height={160} mx="auto" mb={1}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="65%"
              outerRadius="100%"
              data={[{ value: rate, fill: c.primary }]}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={4}
                background={{ fill: c.grid }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 600,
                color: "text.primary",
                lineHeight: 1,
              }}
            >
              {rate}%
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              Rate
            </Typography>
          </Box>
        </Box>
      )}
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {stats.map((stat) => (
          <Box key={stat.label}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Box display="flex" alignItems="center" gap={0.8}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: stat.color,
                  }}
                />
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {stat.label}
                </Typography>
              </Box>
              <Typography
                sx={{ fontSize: 12, color: "text.primary", fontWeight: 600 }}
              >
                {loading ? "—" : stat.value}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stat.pct}
              sx={{
                height: 4,
                borderRadius: "4px",
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  bgcolor: stat.color,
                  borderRadius: "4px",
                },
              }}
            />
          </Box>
        ))}
      </Box>
    </ChartCard>
  );
};
export default AttendanceSummaryBar;
