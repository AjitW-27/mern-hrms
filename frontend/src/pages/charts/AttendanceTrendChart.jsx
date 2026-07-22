import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const FALLBACK = [
  { date: "Mon", Present: 0, Absent: 0, Late: 0 },
  { date: "Tue", Present: 0, Absent: 0, Late: 0 },
  { date: "Wed", Present: 0, Absent: 0, Late: 0 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box
        sx={{
          bgcolor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "10px",
          p: 1.5,
          minWidth: 140,
        }}
      >
        <Typography fontSize={12} color="#94a3b8" mb={0.5}>
          {label}
        </Typography>
        {payload.map((p) => (
          <Box
            key={p.name}
            display="flex"
            justifyContent="space-between"
            gap={2}
          >
            <Typography fontSize={13} color={p.color}>
              {p.name}
            </Typography>
            <Typography fontSize={13} color="#f1f5f9" fontWeight={600}>
              {p.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const AttendanceTrendChart = ({ data, loading }) => {
  const chartData = data?.length ? data : FALLBACK;

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "16px",
        background:
          "linear-gradient(135deg, rgba(19,24,38,0.95), rgba(15,23,42,0.98))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        height: "100%",
        minHeight: 320,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
      >
        <Box>
          <Typography fontSize={16} fontWeight={700} color="#f1f5f9">
            Attendance Trend
          </Typography>
          <Typography fontSize={12} color="#64748b" mt={0.3}>
            Last 7 days overview
          </Typography>
        </Box>
        <Box
          sx={{
            px: 2,
            py: 0.8,
            bgcolor: "#1e293b",
            borderRadius: "8px",
            border: "1px solid #334155",
          }}
        >
          <Typography fontSize={12} color="#94a3b8">
            This Week
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Skeleton
          variant="rectangular"
          height={220}
          sx={{ bgcolor: "#1e293b", borderRadius: "8px" }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradLate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 12, color: "#94a3b8" }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="Present"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradPresent)"
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="Absent"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#gradAbsent)"
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="Late"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#gradLate)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default AttendanceTrendChart;
