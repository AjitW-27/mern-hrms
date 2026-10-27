import { Skeleton } from "../../components/common/UI";
import React from "react";
import { Box, Typography } from "@mui/material";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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

const PayrollTrendChart = ({ data, loading }) => {
  const c = useChartTheme();
  return (
    <ChartCard minHeight={340} tone="violet">
      <Box display="flex" justifyContent="space-between">
        <ChartHeading
          title="Payroll Trend"
          subtitle="Last 6 months net payroll"
        />
        <Typography
          sx={{
            px: 1,
            py: 0.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "4px",
            color: "text.secondary",
            fontSize: 11,
          }}
        >
          Admin/HR Only
        </Typography>
      </Box>
      {loading ? (
        <Skeleton
          variant="rectangular"
          height={200}
          sx={{ bgcolor: "action.hover", borderRadius: "4px" }}
        />
      ) : !data?.length ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={200}
        >
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            No payroll data yet
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={c.grid}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: c.muted, fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: c.muted, fontSize: 11 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: c.hover }} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: c.text, paddingTop: 12 }}
              iconType="circle"
            />
            <Bar
              dataKey="total"
              name="Total Payroll"
              fill={c.primary}
              radius={[4, 4, 0, 0]}
              fillOpacity={0.85}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="Employees Paid"
              stroke={c.secondary}
              strokeWidth={2}
              dot={{ fill: c.secondary, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};
export default PayrollTrendChart;
