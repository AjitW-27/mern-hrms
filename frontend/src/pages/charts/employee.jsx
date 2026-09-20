import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, Typography } from "@mui/material";

// Expanded data points to accurately recreate the complex wavy curve from the image
const data = [
  { name: "Apr 23", value: 50 },
  { name: "Apr 25", value: 68 }, // intermediate
  { name: "Apr 27", value: 57 }, // intermediate
  { name: "Apr 30", value: 86 },
  { name: "May 3", value: 77 }, // intermediate
  { name: "May 7", value: 114 },
  { name: "May 10", value: 104 }, // intermediate
  { name: "May 14", value: 115 },
  { name: "May 18", value: 112 }, // intermediate
  { name: "May 21", value: 128 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: "#8B5CF6",
          padding: "6px 16px",
          borderRadius: "4px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow:
            "0 24px 44px -12px rgba(15,23,42,.22), 0 4px 16px -4px rgba(15,23,42,.08)",
          border: "none",
        }}
      >
        <Typography
          sx={{
            fontWeight: "bold",
            fontSize: "16px",
            color: "#FFFFFF",
            lineHeight: 1.2,
          }}
        >
          {payload[0].value}
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#E0E4FF" }}>
          {label}
        </Typography>
      </Box>
    );
  }
  return null;
};

const EmployeeChart = () => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "4px",
        backgroundColor: "#0F172A",
        color: "#FFFFFF",
        fontFamily: "sans-serif",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Area */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography sx={{ fontSize: "1.1rem", fontWeight: "bold", ml: 1 }}>
          Employee Overview
        </Typography>

        {/* Styled Dropdown Mimic */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#0F172A",
            padding: "4px 14px",
            borderRadius: "4px",
            fontSize: "0.85rem",
            cursor: "pointer",
            border: "1px solid #1E293B",
          }}
        >
          This Month
          <svg
            style={{ marginLeft: 10, width: 14, height: 14, color: "none" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Box>
      </Box>

      {/* Chart Area */}
      <Box sx={{ flexGrow: 1, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            /* FIXED MARGIN: Changed left from -20 to 0 so the Y-axis has room to render */
            margin={{ top: 0, right: 15, left: -15, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Solid horizontal lines instead of dashed */}
            <CartesianGrid vertical={false} stroke="#1E293B" />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "none", fontSize: 13 }}
              dy={15}
              ticks={["Apr 23", "Apr 30", "May 7", "May 14", "May 21"]}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "none", fontSize: 13 }}
              /* REMOVED dx={-10} here to prevent text squishing */
              domain={[0, 150]}
              ticks={[0, 30, 60, 90, 120, 150]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#8B5CF6", strokeWidth: 1 }}
            />

            <Area
              type="natural"
              dataKey="value"
              stroke="#8B5CF6"
              strokeWidth={3}
              fill="url(#colorValue)"
              activeDot={{ r: 6, fill: "#8B5CF6", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default EmployeeChart;
