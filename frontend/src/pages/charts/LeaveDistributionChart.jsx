import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const LeaveDistributionChart = ({ data, loading }) => {
  const c = useChartTheme();
  const colors = [c.primary, c.secondary, c.success, c.warning];
  return (
    <ChartCard tone="amber">
      <ChartHeading title="Leave Distribution" subtitle="By leave type" />
      {loading ? (
        <Skeleton
          variant="rectangular"
          height={220}
          sx={{ bgcolor: "action.hover", borderRadius: "4px" }}
        />
      ) : !data?.length ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={220}
        >
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            No leave data yet
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
            barSize={36}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={c.grid}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: c.muted, fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: c.muted, fontSize: 12 }}
            />
            <Tooltip
              content={<ChartTooltip valueSuffix=" leaves" />}
              cursor={{ fill: c.hover }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};
export default LeaveDistributionChart;
