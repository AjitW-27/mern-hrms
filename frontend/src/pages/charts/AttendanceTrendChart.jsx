import { Skeleton } from "../../components/common/UI";
import React from "react";
import { Box, Typography } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartCard,
  ChartHeading,
  ChartTooltip,
  useChartTheme,
} from "../../components/common/ChartComponents";

const AttendanceTrendChart = ({ data, loading }) => {
  const c = useChartTheme();
  const chartData = data || [];
  const series = [
    { key: "Present", color: c.primary },
    { key: "Absent", color: c.error },
    { key: "Late", color: c.warning },
  ];
  return (
    <ChartCard tone="blue">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <ChartHeading
          title="Attendance Trend"
          subtitle="Last 7 days overview"
        />
        <Typography
          sx={{
            px: 1,
            py: 0.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "4px",
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          This Week
        </Typography>
      </Box>
      {loading ? (
        <Skeleton
          variant="rectangular"
          height={260}
          sx={{ bgcolor: "action.hover", borderRadius: "4px" }}
        />
      ) : !chartData.length ? (
        <Box sx={{ minHeight: 260, display: "grid", placeItems: "center" }}><Typography color="text.secondary">No attendance records in this period.</Typography></Box>
      ) : (
        <ResponsiveContainer width="100%" height={275}>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              {series.map((item) => (
                <linearGradient
                  key={item.key}
                  id={`attendance-${item.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={c.grid}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: c.muted, fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: c.muted, fontSize: 12 }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 12, color: c.text }}
              iconType="circle"
            />
            {series.map((item) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={2}
                fill={`url(#attendance-${item.key})`}
                activeDot={{ r: 4, fill: item.color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};
export default AttendanceTrendChart;
